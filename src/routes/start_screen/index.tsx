import { useState } from 'react';
import type { OpenTriviaCategory, OpenTriviaDifficulty } from '@/types/open-trivia';
import CategoryCard from './_components/CategoryCard';
import DifficultyCard from './_components/DifficultyCard';
import TopCard from './_components/TopCard';

const StartScreen = () => {
	const [categoryId, setCategoryId] = useState<OpenTriviaCategory['id'] | null>(null);
	const [difficulty, setDifficulty] = useState<OpenTriviaDifficulty | null>(null);

	return (
		<div className='mx-auto flex w-full max-w-2xl flex-col gap-4'>
			<TopCard />
			<CategoryCard value={categoryId} onValueChange={setCategoryId} />
			<DifficultyCard value={difficulty} onValueChange={setDifficulty} />
		</div>
	);
};

export default StartScreen;
