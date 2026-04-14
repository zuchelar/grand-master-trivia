import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import useOpenTriviaQuestions from '@/hooks/useOpenTrivia/useOpenTriviaQuestions';
import { playCorrectChime } from '@/lib/feedbackSounds';
import { generateLobbyHandle } from '@/lib/leaderboardHandles';
import {
	decodeOpenTriviaText,
	type OpenTriviaAnswerLetter,
	prepareOpenTriviaAnswerChoices,
} from '@/lib/openTriviaAnswers';
import { scoreQuestion } from '@/lib/quizScoring';
import QuizActiveScreen, { type QuizAnswerFeedback } from '@/routes/quiz_active';
import ResultsScreen from '@/routes/results_screen';
import StartScreen from '@/routes/start_screen';
import {
	GAME_STAGES,
	type GameStage,
	QUIZ_FEEDBACK_CORRECT_MS,
	QUIZ_FEEDBACK_WRONG_MS,
	QUIZ_QUESTION_COUNT,
	QUIZ_SECONDS_PER_QUESTION,
} from '@/types/game';
import type { LeaderboardAttempt } from '@/types/leaderboard';
import type { OpenTriviaCategory, OpenTriviaDifficulty } from '@/types/open-trivia';
import type { QuizQuestionStat } from '@/types/quiz-session';

const HOF_LEADERBOARD_STORAGE_KEY = 'grand-master-trivia-hof-v1';

function buildRunSignature(stats: QuizQuestionStat[]): string {
	return stats.map((s) => `${s.correct ? '1' : '0'}:${s.points}:${s.elapsedMs}`).join('|');
}

function clearStoredTimeout(ref: { current: ReturnType<typeof setTimeout> | null }) {
	if (ref.current !== null) {
		clearTimeout(ref.current);
		ref.current = null;
	}
}

function App() {
	const [gameStage, setGameStage] = useState<GameStage>(GAME_STAGES.START_SCREEN);
	const [selectedCategoryId, setSelectedCategoryId] = useState<OpenTriviaCategory['id'] | null>(null);
	const [selectedDifficulty, setSelectedDifficulty] = useState<OpenTriviaDifficulty | null>(null);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [streak, setStreak] = useState(0);
	const [selectedLetter, setSelectedLetter] = useState<OpenTriviaAnswerLetter | null>(null);
	const [answerFeedback, setAnswerFeedback] = useState<QuizAnswerFeedback>('idle');
	const [wrongHighlightLetter, setWrongHighlightLetter] = useState<OpenTriviaAnswerLetter | null>(null);
	const [roundStats, setRoundStats] = useState<QuizQuestionStat[]>([]);
	const [maxStreakThisRun, setMaxStreakThisRun] = useState(0);

	const [leaderboardAttempts, setLeaderboardAttempts] = useLocalStorage<LeaderboardAttempt[]>(
		HOF_LEADERBOARD_STORAGE_KEY,
		[],
	);

	const resolvingRef = useRef(false);
	const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const questionStartedAtRef = useRef(Date.now());
	const pendingElapsedMsRef = useRef(0);

	useEffect(() => {
		return () => clearStoredTimeout(advanceTimeoutRef);
	}, []);

	const interactionLocked = answerFeedback !== 'idle';

	const questionTimeCapMs = QUIZ_SECONDS_PER_QUESTION * 1000;

	const quizQueryEnabled =
		gameStage === GAME_STAGES.QUIZ_ACTIVE && selectedCategoryId !== null && selectedDifficulty !== null;

	const { data, isLoading, isError, refetch, isFetching } = useOpenTriviaQuestions({
		category_id: selectedCategoryId!,
		difficulty: selectedDifficulty!,
		amount: QUIZ_QUESTION_COUNT,
		enabled: quizQueryEnabled,
	});

	const questions = data?.results ?? [];
	const quizReady = Boolean(data && data.response_code === 0 && questions.length > 0);
	const isApiError = !isLoading && !isFetching && !isError && data != null && !quizReady;
	const showQuizLoading = quizQueryEnabled && !isError && (isLoading || (isFetching && !quizReady));

	const currentQuestion = questions[currentQuestionIndex] ?? null;

	useEffect(() => {
		if (gameStage !== GAME_STAGES.QUIZ_ACTIVE || !quizReady || !currentQuestion) {
			return;
		}

		questionStartedAtRef.current = Date.now();
	}, [gameStage, quizReady, currentQuestion]);

	const answerChoices = useMemo(
		() => (currentQuestion ? prepareOpenTriviaAnswerChoices(currentQuestion) : []),
		[currentQuestion],
	);

	const questionText = currentQuestion ? decodeOpenTriviaText(currentQuestion.question) : '';

	const resultsRecordedRef = useRef(false);

	useEffect(() => {
		if (gameStage !== GAME_STAGES.RESULTS_SCREEN) {
			resultsRecordedRef.current = false;
			return;
		}
		if (roundStats.length === 0 || resultsRecordedRef.current) {
			return;
		}
		resultsRecordedRef.current = true;

		const totalScore = roundStats.reduce((acc, s) => acc + s.points, 0);
		const correct = roundStats.filter((s) => s.correct).length;
		const accuracyPct = Math.round((correct / roundStats.length) * 100);
		const runSignature = buildRunSignature(roundStats);

		setLeaderboardAttempts((prev) => {
			const list = prev;
			if (list.some((p) => p.runSignature === runSignature)) {
				return list;
			}
			const entry: LeaderboardAttempt = {
				id: crypto.randomUUID(),
				handle: generateLobbyHandle(),
				score: totalScore,
				accuracyPct,
				streak: maxStreakThisRun,
				createdAt: Date.now(),
				runSignature,
			};
			const next = [entry, ...list];
			next.sort((a, b) => b.createdAt - a.createdAt);
			return next.slice(0, 5);
		});
	}, [gameStage, roundStats, maxStreakThisRun, setLeaderboardAttempts]);

	const advanceQuestion = useCallback(
		(wasCorrect: boolean, elapsedMs: number) => {
			const { total, base, timeBonus } = scoreQuestion(wasCorrect, elapsedMs);
			setRoundStats((prev) => [
				...prev,
				{
					correct: wasCorrect,
					elapsedMs,
					points: total,
					basePoints: base,
					timeBonus,
				},
			]);

			setStreak((s) => {
				const next = wasCorrect ? s + 1 : 0;
				setMaxStreakThisRun((m) => Math.max(m, next));
				return next;
			});
			setSelectedLetter(null);

			const next = currentQuestionIndex + 1;
			if (next >= questions.length) {
				setGameStage(GAME_STAGES.RESULTS_SCREEN);
				return;
			}
			setCurrentQuestionIndex(next);
		},
		[currentQuestionIndex, questions.length],
	);

	const scheduleAdvanceAfterFeedback = useCallback(
		(wasCorrect: boolean) => {
			clearStoredTimeout(advanceTimeoutRef);
			const delay = wasCorrect ? QUIZ_FEEDBACK_CORRECT_MS : QUIZ_FEEDBACK_WRONG_MS;
			advanceTimeoutRef.current = setTimeout(() => {
				advanceTimeoutRef.current = null;
				resolvingRef.current = false;
				setAnswerFeedback('idle');
				setWrongHighlightLetter(null);
				advanceQuestion(wasCorrect, pendingElapsedMsRef.current);
			}, delay);
		},
		[advanceQuestion],
	);

	const handleLockIn = () => {
		if (resolvingRef.current || interactionLocked || selectedLetter === null || !currentQuestion) {
			return;
		}

		pendingElapsedMsRef.current = Math.min(Math.max(0, Date.now() - questionStartedAtRef.current), questionTimeCapMs);

		const chosen = answerChoices.find((c) => c.letter === selectedLetter);
		const correctText = decodeOpenTriviaText(currentQuestion.correct_answer);
		const wasCorrect = chosen?.text === correctText;

		resolvingRef.current = true;
		if (wasCorrect) {
			setAnswerFeedback('correct');
			playCorrectChime();
			scheduleAdvanceAfterFeedback(true);
		} else {
			setAnswerFeedback('incorrect');
			setWrongHighlightLetter(selectedLetter);
			scheduleAdvanceAfterFeedback(false);
		}
	};

	const handleTimeUp = () => {
		if (resolvingRef.current || interactionLocked) {
			return;
		}

		pendingElapsedMsRef.current = Math.min(Math.max(0, Date.now() - questionStartedAtRef.current), questionTimeCapMs);

		resolvingRef.current = true;
		setAnswerFeedback('incorrect');
		setWrongHighlightLetter(null);
		scheduleAdvanceAfterFeedback(false);
	};

	const handleStartQuiz = () => {
		clearStoredTimeout(advanceTimeoutRef);
		resolvingRef.current = false;
		setAnswerFeedback('idle');
		setWrongHighlightLetter(null);
		setRoundStats([]);
		setMaxStreakThisRun(0);
		setCurrentQuestionIndex(0);
		setStreak(0);
		setSelectedLetter(null);
		setGameStage(GAME_STAGES.QUIZ_ACTIVE);
	};

	const handlePlayAgain = () => {
		clearStoredTimeout(advanceTimeoutRef);
		resolvingRef.current = false;
		setAnswerFeedback('idle');
		setWrongHighlightLetter(null);
		setRoundStats([]);
		setMaxStreakThisRun(0);
		setGameStage(GAME_STAGES.START_SCREEN);
		setCurrentQuestionIndex(0);
		setStreak(0);
		setSelectedLetter(null);
	};

	return (
		<div className='min-h-dvh bg-[#0B0E1B] px-4 py-4'>
			{gameStage === GAME_STAGES.START_SCREEN && (
				<StartScreen
					selectedCategoryId={selectedCategoryId}
					setSelectedCategoryId={setSelectedCategoryId}
					selectedDifficulty={selectedDifficulty}
					setSelectedDifficulty={setSelectedDifficulty}
					onStartQuiz={handleStartQuiz}
					leaderboardAttempts={leaderboardAttempts}
				/>
			)}

			{gameStage === GAME_STAGES.QUIZ_ACTIVE && (
				<QuizActiveScreen
					questionText={questionText}
					answerChoices={answerChoices}
					isLoading={showQuizLoading}
					isFetchError={isError}
					isApiError={isApiError}
					onRetry={() => void refetch()}
					currentIndex={currentQuestionIndex}
					totalQuestions={questions.length}
					streak={streak}
					selectedLetter={selectedLetter}
					onSelectLetter={setSelectedLetter}
					onLockIn={handleLockIn}
					onTimeUp={handleTimeUp}
					answerFeedback={answerFeedback}
					wrongHighlightLetter={wrongHighlightLetter}
					interactionLocked={interactionLocked}
				/>
			)}

			{gameStage === GAME_STAGES.RESULTS_SCREEN && (
				<div className='min-h-dvh bg-[#0D0D1A] px-4 py-4'>
					<ResultsScreen stats={roundStats} maxStreakThisRun={maxStreakThisRun} onPlayAgain={handlePlayAgain} />
				</div>
			)}
		</div>
	);
}

export default App;
