import { useQuery } from '@tanstack/react-query';
import { type OpenTriviaCategory, type OpenTriviaDifficulty, type OpenTriviaQuestion } from '@/types/open-trivia';

interface OpenTriviaQuestionsParams {
	category_id: OpenTriviaCategory['id'];
	difficulty: OpenTriviaDifficulty;
	amount?: number;
	enabled?: boolean;
}

interface OpenTriviaQuestionsResult {
	response_code: number;
	results: OpenTriviaQuestion[];
}

const useOpenTriviaQuestions = ({
	category_id,
	difficulty,
	amount = 10,
	enabled = true,
}: OpenTriviaQuestionsParams) => {
	return useQuery<OpenTriviaQuestionsResult>({
		queryKey: ['open-trivia-questions', category_id, difficulty, amount],
		queryFn: async () => {
			const response = await fetch(
				`https://opentdb.com/api.php?amount=${amount}&category=${category_id}&difficulty=${difficulty}`,
			);
			const data = await response.json();
			return data;
		},
		enabled,
	});
};

export default useOpenTriviaQuestions;
