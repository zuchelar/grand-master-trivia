import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useOpenTriviaQuestions from '@/hooks/useOpenTrivia/useOpenTriviaQuestions';
import { playCorrectChime } from '@/lib/feedbackSounds';
import {
	decodeOpenTriviaText,
	type OpenTriviaAnswerLetter,
	prepareOpenTriviaAnswerChoices,
} from '@/lib/openTriviaAnswers';
import QuizActiveScreen, { type QuizAnswerFeedback } from '@/routes/quiz_active';
import StartScreen from '@/routes/start_screen';
import {
	GAME_STAGES,
	QUIZ_FEEDBACK_CORRECT_MS,
	QUIZ_FEEDBACK_WRONG_MS,
	QUIZ_QUESTION_COUNT,
	type GameStage,
} from '@/types/game';
import type { OpenTriviaCategory, OpenTriviaDifficulty } from '@/types/open-trivia';

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

	const resolvingRef = useRef(false);
	const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => clearStoredTimeout(advanceTimeoutRef);
	}, []);

	const interactionLocked = answerFeedback !== 'idle';

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

	const answerChoices = useMemo(
		() => (currentQuestion ? prepareOpenTriviaAnswerChoices(currentQuestion) : []),
		[currentQuestion],
	);

	const questionText = currentQuestion ? decodeOpenTriviaText(currentQuestion.question) : '';

	const advanceQuestion = useCallback(
		(wasCorrect: boolean) => {
			setStreak((s) => (wasCorrect ? s + 1 : 0));
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
				advanceQuestion(wasCorrect);
			}, delay);
		},
		[advanceQuestion],
	);

	const handleLockIn = () => {
		if (resolvingRef.current || interactionLocked || selectedLetter === null || !currentQuestion) {
			return;
		}

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
				<div className='mx-auto flex w-full max-w-lg flex-col items-center gap-8 py-16 text-center'>
					<h2 className='font-heading text-3xl font-bold text-white'>Quiz complete</h2>
					<p className='text-lg text-white/80'>
						You ended with a streak of <span className='font-bold text-brand-green'>{streak}</span>.
					</p>
					<button
						type='button'
						onClick={handlePlayAgain}
						className='w-full max-w-sm rounded-2xl bg-[#7c4dff] py-4 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_0_28px_rgba(124,77,255,0.45)] transition-[filter] hover:brightness-110'
					>
						Play again
					</button>
				</div>
			)}
		</div>
	);
}

export default App;
