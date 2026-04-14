import { QUIZ_SECONDS_PER_QUESTION } from '@/types/game';

const QUESTION_TIME_MS = QUIZ_SECONDS_PER_QUESTION * 1000;

export const QUIZ_SCORE_BASE = 800;
export const QUIZ_SCORE_MAX_TIME_BONUS = 400;

export function scoreQuestion(
	correct: boolean,
	elapsedMs: number,
): {
	total: number;
	base: number;
	timeBonus: number;
} {
	if (!correct) {
		return { total: 0, base: 0, timeBonus: 0 };
	}

	const clamped = Math.min(Math.max(0, elapsedMs), QUESTION_TIME_MS);
	const timeLeftRatio = 1 - clamped / QUESTION_TIME_MS;
	const timeBonus = Math.round(QUIZ_SCORE_MAX_TIME_BONUS * timeLeftRatio);
	return {
		total: QUIZ_SCORE_BASE + timeBonus,
		base: QUIZ_SCORE_BASE,
		timeBonus,
	};
}

export function timeBonusPercent(timeBonus: number): number {
	return Math.round((timeBonus / QUIZ_SCORE_MAX_TIME_BONUS) * 100);
}
