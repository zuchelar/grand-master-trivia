import type { OpenTriviaCategory, OpenTriviaDifficulty } from '@/types/open-trivia';
import CategoryCard from './_components/CategoryCard';
import DifficultyCard from './_components/DifficultyCard';
import TopCard from './_components/TopCard';

interface StartScreenProps {
	selectedCategoryId: OpenTriviaCategory['id'] | null;
	setSelectedCategoryId: React.Dispatch<React.SetStateAction<OpenTriviaCategory['id'] | null>>;
	selectedDifficulty: OpenTriviaDifficulty | null;
	setSelectedDifficulty: React.Dispatch<React.SetStateAction<OpenTriviaDifficulty | null>>;
	onStartQuiz: () => void;
}

const StartScreen = ({
	selectedCategoryId,
	setSelectedCategoryId,
	selectedDifficulty,
	setSelectedDifficulty,
	onStartQuiz,
}: StartScreenProps) => {
	const canStart = selectedCategoryId !== null && selectedDifficulty !== null;

	return (
		<div className='mx-auto flex w-full max-w-2xl flex-col gap-4'>
			<TopCard />
			<CategoryCard value={selectedCategoryId} onValueChange={setSelectedCategoryId} />
			<DifficultyCard value={selectedDifficulty} onValueChange={setSelectedDifficulty} />
			<button
				type='button'
				disabled={!canStart}
				onClick={onStartQuiz}
				className='mt-2 w-full rounded-2xl bg-[#7c4dff] py-4 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_0_28px_rgba(124,77,255,0.45)] transition-[filter,opacity] hover:brightness-110 disabled:pointer-events-none disabled:opacity-35 disabled:shadow-none'
			>
				Begin quiz
			</button>
		</div>
	);
};

export default StartScreen;
