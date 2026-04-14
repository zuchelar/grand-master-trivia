import { useState } from 'react';
import type { OpenTriviaCategory } from '@/types/open-trivia';
import CategoryCard from './_components/CategoryCard';
import TopCard from './_components/TopCard';

const StartScreen = () => {
	const [categoryId, setCategoryId] = useState<OpenTriviaCategory['id'] | null>(null);

	return (
		<div className='mx-auto flex w-full max-w-2xl flex-col gap-4'>
			<TopCard />
			<CategoryCard value={categoryId} onValueChange={setCategoryId} />
		</div>
	);
};

export default StartScreen;
