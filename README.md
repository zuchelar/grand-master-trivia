Name: Austin Zuchelkowski
Project Option: Trivia
Live App URL: https://grand-master-trivia.vercel.app/
Github Repository URL: https://github.com/zuchelar/grand-master-trivia



# 1. Technical Report & User Manual

## 1.1 Project Overview

Grand Master Trivia is a gamified, time-pressured quiz engine that fetches live multiple-choice questions from the Open Trivia DB API across 24 categories and three difficulty levels. Players must answer each question within 15 seconds, earning base points plus a speed bonus for fast answers, while their top 5 run scores are automatically saved to a local Hall-of-Fame leaderboard between sessions.

---

## 1.2 Component Architecture

Below is every component in the tree, what state or props it owns, and how data flows through the app.

- **`App.tsx`** — The root component and single source of truth. Holds all global game state: `gameStage`, `selectedCategoryId`, `selectedDifficulty`, `currentQuestionIndex`, `streak`, `maxStreakThisRun`, `selectedLetter`, `answerFeedback`, `wrongHighlightLetter`, and `roundStats`. Drives every screen transition and passes callbacks down as props. Also owns the `leaderboardAttempts` array via `useLocalStorage`.

- **`StartScreen`** (`routes/start_screen/index.tsx`): Receives `selectedCategoryId`, `setSelectedCategoryId`, `selectedDifficulty`, `setSelectedDifficulty`, `onStartQuiz`, and `leaderboardAttempts` from `App`. Composes the four start-screen sub-components and derives the `canStart` boolean that gates the Begin Quiz button.

  - **`TopCard`** (`_components/TopCard.tsx`): Pure presentational hero banner. Accepts no props.

  - **`CategoryCard`** (`_components/CategoryCard.tsx`): Receives `value` and `onValueChange` from `StartScreen`. Manages an internal `uncontrolled` state for standalone use and an `isOpen` flag for the `<details>` expander. Renders a "featured" chip row plus a scrollable list of all remaining categories.

  - **`DifficultyCard`** (`_components/DifficultyCard.tsx`): Receives `value` and `onValueChange` from `StartScreen`. Renders Easy / Medium / Hard toggle buttons and mirrors the same controlled/uncontrolled pattern as `CategoryCard`.

  - **`HofLeaderboard`** (`_components/HofLeaderboard.tsx`): Receives the `attempts` array from `StartScreen`. Uses `useMemo` to sort by score, pad empty slots to five rows, and compute the personal best. Purely read-only — writes no state.

- **`QuizActiveScreen`** (`routes/quiz_active/index.tsx`): Receives `questionText`, `answerChoices`, loading/error flags, `currentIndex`, `totalQuestions`, `streak`, `selectedLetter`, `answerFeedback`, `wrongHighlightLetter`, `interactionLocked`, and four callbacks (`onSelectLetter`, `onLockIn`, `onTimeUp`, `onRetry`) from `App`. Renders three mutually exclusive states: a loading skeleton, an error/retry screen, or the live quiz layout.

  - **`QuizTimer`** (`_components/QuizTimer.tsx`): Receives `timerLimit`, `onTimeout`, `barProgress`, and `paused` from `QuizActiveScreen`. Uses the `useTimer` hook for the whole-second digit display and a separate `requestAnimationFrame` loop to animate the SVG arc at 60 fps. Fires `onTimeout` once when the countdown reaches zero.

  - **`Question`** (`_components/Question.tsx`): Receives the decoded `question` string. Pure display component with no internal state.

  - **`Answer`** (`_components/Answer.tsx`): Receives `letter`, `children` (answer text), `selected`, `incorrectHighlight`, `disabled`, and `onSelect`. Applies distinct visual states (neutral, selected, incorrect) via `cn` class merging and forwards all native `<button>` props.

- **`ResultsScreen`** (`routes/results_screen/index.tsx`): Receives `stats` (per-question breakdown), `maxStreakThisRun`, and `onPlayAgain` from `App`. Uses `useMemo` to derive total score, accuracy percentage, average speed, and speed-bonus percentage. Renders the score hero, stat cards, a bar chart of per-question performance, and the Play Again / Share buttons.

**Custom Hooks**

- **`useOpenTriviaQuestions`** (`hooks/useOpenTrivia/useOpenTriviaQuestions.ts`): Wraps TanStack Query's `useQuery` to fetch from the Open Trivia DB endpoint. The query is only enabled when `gameStage` is `QUIZ_ACTIVE` and both a category and difficulty have been selected.

- **`useTimer`** (`hooks/useTimer.ts`): Counts down from `timerLimit` to 0 using a `setInterval` keyed to wall-clock time (`Date.now() - start`) to prevent drift. Fires the `onTimeout` callback exactly once, guarded by `timeoutFiredRef`. Resets cleanly when `timerLimit` changes (i.e., on each new question).

- **`useLocalStorage`** (`hooks/useLocalStorage.ts`): Initialises `useState` from `localStorage` (JSON-parsed) on mount, then writes back via `useEffect` on every state change. Falls back silently on parse errors or quota failures.

---

## 1.3 Detailed Functionality

### Feature 1 — Dynamic API Fetching

`useOpenTriviaQuestions` calls `https://opentdb.com/api.php?amount={n}&category={id}&difficulty={difficulty}` via TanStack Query. 

The fetch is conditionally enabled using the `enabled` option: it only fires once `gameStage === 'QUIZ_ACTIVE'` and both `selectedCategoryId` and `selectedDifficulty` are non-null, preventing any wasted requests while the user is still on the start screen. 

The JSON response contains a `response_code` (0 = success, non-zero = API-level failure such as "not enough questions") and a `results` array of question objects. The app distinguishes a network error (`isFetchError` from TanStack Query) from an API-level error (`isApiError`, derived when `response_code !== 0`), and renders a "Try again" button that calls `refetch()` for both cases. 

All question and answer text returned by the API is HTML-entity encoded (e.g. `&#039;`, `&quot;`) and is decoded on use via the `entities` library's `decodeHTML` function before being displayed.

### Feature 2 — The 15-Second Pressure Timer

`useTimer` starts a `setInterval` that runs every 1 000 ms. Each tick computes `Math.ceil((limitMs - elapsed) / 1000)` from the wall clock rather than decrementing a counter, so the display never drifts behind real time. A `timeoutFiredRef` boolean ensures the `onTimeout` callback fires exactly once when `remainingSec` first reaches 0. 

Independently, `QuizTimer` runs a `requestAnimationFrame` loop that reads the same wall-clock elapsed time and updates the SVG `stroke-dasharray` attribute on every frame, giving the arc a smooth 60 fps sweep that is visually decoupled from the 1-second integer tick. 

The timer is `paused` (both the interval and the rAF loop are skipped) while `interactionLocked` is true — i.e., during the brief feedback window after an answer is submitted. When the timer expires, `App.handleTimeUp()` records the elapsed milliseconds, sets `answerFeedback` to `'incorrect'`, and schedules advancement to the next question after `QUIZ_FEEDBACK_WRONG_MS` (1 200 ms) via `setTimeout`.

### Feature 3 — The Game Loop (State Flow)

`App.tsx` maintains a `gameStage` state variable typed as `GameStage` (`'START_SCREEN' | 'QUIZ_ACTIVE' | 'RESULTS_SCREEN'`). The three screens are rendered using three consecutive `{gameStage === GAME_STAGES.X && <Screen />}` guards — no router is used; the stage itself is the navigation primitive. Transitions are:

- **`START_SCREEN → QUIZ_ACTIVE`**: triggered by `handleStartQuiz()`, which resets all per-round state (`roundStats`, `streak`, `currentQuestionIndex`, `selectedLetter`, `answerFeedback`) before changing the stage. This also enables the TanStack Query fetch.
- **`QUIZ_ACTIVE → RESULTS_SCREEN`**: triggered inside `advanceQuestion()` when `currentQuestionIndex + 1 >= questions.length`. The final question's stat is appended to `roundStats` in the same call before transitioning.
- **`RESULTS_SCREEN → START_SCREEN`**: triggered by `handlePlayAgain()`, which resets identical state to `handleStartQuiz()` and disables the query.

A `resultsRecordedRef` boolean ensures the leaderboard `useEffect` (which writes to `localStorage`) runs exactly once per trip to the results screen, even under React Strict Mode's double-invoke behaviour.

### Feature 4 — Shuffle Logic

`prepareOpenTriviaAnswerChoices` in `lib/openTriviaAnswers.ts` first builds a combined array from `[correct_answer, ...incorrect_answers]` (as returned by the API), then decodes all HTML entities in every element. 

It then applies an **in-place Fisher-Yates shuffle**: iterating from the last index down to 1, it swaps each element with a randomly chosen element at or before its current position (`Math.floor(Math.random() * (i + 1))`). Finally, it maps the shuffled strings to `{ letter: 'A' | 'B' | 'C' | 'D', text }` objects. Because the shuffle happens inside `useMemo` (keyed to `currentQuestion`), the order is locked in for the lifetime of each question and never re-randomises on re-renders.

### Advanced Feature — Sound & Visuals

On a **correct** answer: `playCorrectChime()` in `lib/feedbackSounds.ts` instantiates a new `Audio` object from the bundled `success.mp3`, sets volume to 0.9, and calls `.play()`, silently swallowing any autoplay-policy rejection. Simultaneously, `answerFeedback` is set to `'correct'`, which adds the CSS class `quiz-feedback-correct-flash` to the quiz container. 

This class runs a `@keyframes` animation (`quiz-correct-flash`) that briefly boosts `filter: brightness` and applies a large green inset box-shadow for 550 ms.

On an **incorrect** answer or timeout: `answerFeedback` is set to `'incorrect'` and the answer-choices wrapper receives the class `quiz-feedback-shake`, which runs a `@keyframes` animation (`quiz-answer-shake`) that translates the element left and right seven times over 550 ms. The specific answer button that was chosen (if any) also receives `incorrectHighlight` styling (red background and border). The `interactionLocked` flag (`answerFeedback !== 'idle'`) blocks all further input for the duration of the feedback window.

### Advanced Feature — High-Score Leaderboard

`useLocalStorage` initialises the `leaderboardAttempts` array by reading and JSON-parsing the key `'grand-master-trivia-hof-v1'` from `localStorage` on first render, falling back to `[]` on any error or absence. A `useEffect` in `App.tsx` watches for `gameStage === 'RESULTS_SCREEN'`. When triggered, it computes the run's `totalScore`, `accuracyPct`, and a `runSignature` (a pipe-delimited string encoding `correct:points:elapsedMs` for every question) to deduplicate replayed runs. It then calls `setLeaderboardAttempts`, which: checks for an existing entry with the same `runSignature`; if absent, prepends a new `LeaderboardAttempt` object containing a UUID, a randomly generated gamer handle (e.g. `CYBER_PHOENIX`) from `leaderboardHandles.ts`, score, accuracy, and streak; sorts all entries by `createdAt` descending; and slices to a maximum of 5. Because `useLocalStorage`'s `useEffect` fires on every state change, the updated array is written back to `localStorage` automatically after every mutation.

---

## 1.4 User Manual (How to Navigate)

- **Step 1 — Open the app.** You arrive at the Start Screen. The left side shows the game title, category picker, difficulty picker, and the Begin Quiz button. On wider screens the Hall-of-Fame leaderboard is visible on the right; on mobile it appears below the button.

- **Step 2 — Pick a category.** Two featured categories (General Knowledge and Film) appear as quick-select chips. Click **More categories** to expand a scrollable grid of all 24 available topics (History, Science, Music, Anime, etc.). The selected category is highlighted in purple; clicking it again or choosing another updates the selection.

- **Step 3 — Pick a difficulty.** Choose **Easy**, **Medium**, or **Hard** from the Challenge Level card. The selected row turns purple. This controls which question pool the Open Trivia DB API draws from.

- **Step 4 — Begin the quiz.** The Begin Quiz button activates once both a category and a difficulty are selected. Click it to start. If the API takes a moment, a loading message is shown. If the API returns an error (e.g. not enough questions for that combination), a "Try again" button appears.

- **Step 5 — Answer each question.** Each question shows a 15-second countdown ring, the question text, and up to four answer choices (A–D). Click a choice to highlight it, then click **Lock In Answer** to submit. A green flash and a chime confirm a correct answer; a red shake highlights a wrong one. The quiz automatically advances after a brief feedback pause. You cannot change your answer or interact with the timer after locking in.

- **Step 6 — Review your results.** After all questions are answered the Results Screen displays your total score, performance accuracy with a percentile label, average response speed and speed-bonus percentage, best answer streak, and a per-question bar chart comparing response time to points earned. Your run is automatically saved to the local leaderboard if it ranks in the top 5.

- **Step 7 — Play again or share.** Click **Play Again** to return to the Start Screen (your leaderboard entry will already appear). Click **Share Result** to invoke the native share sheet on supported devices, or copy a score summary to your clipboard on desktop.




2. Technical Challenge: One major hurdle that I need to clear was actually breaking down the project into managable parts in order to decide how to best tackle the project. In addition working out the API was not as big of a challenge but still I still needed some time to work out the specifics of how it worked.





3. Demo Video URL: [https://youtu.be/3JZG3ethLHI](https://www.youtube.com/watch?v=3JZG3ethLHI)







