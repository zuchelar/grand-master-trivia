import { FileText, SendHorizontal, Zap } from 'lucide-react';
import { type OpenTriviaAnswerChoice, type OpenTriviaAnswerLetter } from '@/lib/openTriviaAnswers';
import { cn } from '@/lib/utils';
import { Answer } from '@/routes/quiz_active/_components/Answer';
import { Question } from '@/routes/quiz_active/_components/Question';
import QuizTimer from '@/routes/quiz_active/_components/QuizTimer';
import { QUIZ_SECONDS_PER_QUESTION } from '@/types/game';

export type QuizAnswerFeedback = 'idle' | 'correct' | 'incorrect';

interface QuizActiveScreenProps {
	questionText: string;
	answerChoices: OpenTriviaAnswerChoice[];
	isLoading: boolean;
	isFetchError: boolean;
	isApiError: boolean;
	onRetry: () => void;
	currentIndex: number;
	totalQuestions: number;
	streak: number;
	selectedLetter: OpenTriviaAnswerLetter | null;
	onSelectLetter: (letter: OpenTriviaAnswerLetter) => void;
	onLockIn: () => void;
	onTimeUp: () => void;
	answerFeedback: QuizAnswerFeedback;
	wrongHighlightLetter: OpenTriviaAnswerLetter | null;
	interactionLocked: boolean;
}

const QuizActiveScreen = ({
	questionText,
	answerChoices,
	isLoading,
	isFetchError,
	isApiError,
	onRetry,
	currentIndex,
	totalQuestions,
	streak,
	selectedLetter,
	onSelectLetter,
	onLockIn,
	onTimeUp,
	answerFeedback,
	wrongHighlightLetter,
	interactionLocked,
}: QuizActiveScreenProps) => {
	const quizBarProgress = totalQuestions > 0 ? currentIndex / totalQuestions : 0;

	if (isLoading) {
		return (
			<div className='flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center'>
				<p className='font-heading text-lg text-white/90'>Loading your quiz…</p>
				<p className='text-sm text-white/50'>Fetching questions from Open Trivia</p>
			</div>
		);
	}

	if (isFetchError || isApiError) {
		return (
			<div className='flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center'>
				<p className='font-heading text-lg text-white'>
					{isApiError ? 'The trivia API returned an error.' : 'Could not load questions.'}
				</p>
				<button
					type='button'
					onClick={onRetry}
					className='rounded-xl bg-[#7c4dff] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-[0_0_20px_rgba(124,77,255,0.4)]'
				>
					Try again
				</button>
			</div>
		);
	}

	if (!questionText || answerChoices.length === 0) {
		return (
			<div className='flex min-h-[40vh] items-center justify-center text-white/70'>
				<p>No question to show.</p>
			</div>
		);
	}

	return (
		<div
			className={cn(
				'mx-auto flex w-full max-w-lg flex-col gap-5 rounded-2xl pb-10 pt-1',
				answerFeedback === 'correct' && 'quiz-feedback-correct-flash',
			)}
		>
			<header className='flex items-center justify-between gap-2'>
				<div className='flex items-center gap-2 rounded-full bg-[#141829] px-3.5 py-2 text-xs font-bold text-white/95 ring-1 ring-white/[0.08] sm:text-sm'>
					<FileText className='size-4 shrink-0 text-[#9D7CFF]' aria-hidden />
					<span className='tabular-nums'>
						Q {currentIndex + 1} / {totalQuestions}
					</span>
				</div>
				<div className='flex items-center gap-2 rounded-full bg-[#141829] px-3.5 py-2 text-xs font-bold ring-1 ring-white/[0.08] sm:text-sm'>
					<Zap className='size-4 shrink-0 text-brand-green' aria-hidden />
					<span className='text-brand-green'>x{streak} STREAK</span>
				</div>
			</header>

			<QuizTimer
				key={currentIndex}
				timerLimit={QUIZ_SECONDS_PER_QUESTION}
				onTimeout={onTimeUp}
				barProgress={quizBarProgress}
				paused={interactionLocked}
				className='max-w-none'
			/>

			<Question question={questionText} />

			<div className={cn('flex flex-col gap-3', answerFeedback === 'incorrect' && 'quiz-feedback-shake')}>
				{answerChoices.map(({ letter, text }) => (
					<Answer
						key={`${currentIndex}-${letter}-${text}`}
						letter={letter}
						selected={selectedLetter === letter}
						incorrectHighlight={wrongHighlightLetter === letter}
						disabled={interactionLocked}
						onSelect={() => onSelectLetter(letter)}
					>
						{text}
					</Answer>
				))}
			</div>

			<button
				type='button'
				onClick={onLockIn}
				disabled={selectedLetter === null || interactionLocked}
				className={cn(
					'mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-xs font-bold uppercase tracking-[0.12em] text-white sm:text-sm',
					'bg-[#7c4dff] shadow-[0_0_28px_rgba(124,77,255,0.5)] transition-[filter,opacity] hover:brightness-110',
					'disabled:pointer-events-none disabled:opacity-35 disabled:shadow-none',
				)}
			>
				LOCK IN ANSWER
				<SendHorizontal className='size-4 shrink-0' aria-hidden />
			</button>
		</div>
	);
};

export default QuizActiveScreen;
