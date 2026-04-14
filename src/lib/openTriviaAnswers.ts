import { decodeHTML } from 'entities/decode';
import type { OpenTriviaQuestion } from '@/types/open-trivia';

const CHOICE_LETTERS = ['A', 'B', 'C', 'D'] as const;

export type OpenTriviaAnswerLetter = (typeof CHOICE_LETTERS)[number];

export interface OpenTriviaAnswerChoice {
	letter: OpenTriviaAnswerLetter;
	text: string;
}

/** Decodes HTML entities returned by the Open Trivia DB API (e.g. &#039;, &quot;). */
export function decodeOpenTriviaText(text: string): string {
	return decodeHTML(text);
}

function shuffleInPlace<T>(items: T[]): void {
	for (let i = items.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[items[i], items[j]] = [items[j], items[i]];
	}
}

/**
 * Builds A–D (multiple choice) or A–B (boolean) options with shuffled order.
 * Correct and incorrect answers are merged per Open Trivia's `correct_answer` / `incorrect_answers` shape.
 */
export function prepareOpenTriviaAnswerChoices(question: OpenTriviaQuestion): OpenTriviaAnswerChoice[] {
	const combined = [question.correct_answer, ...question.incorrect_answers];
	const decoded = combined.map(decodeOpenTriviaText);

	shuffleInPlace(decoded);

	return decoded.map((text, index) => ({
		letter: CHOICE_LETTERS[index],
		text,
	}));
}
