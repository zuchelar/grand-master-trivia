export const GAME_STAGES = {
	START_SCREEN: 'START_SCREEN',
	QUIZ_ACTIVE: 'QUIZ_ACTIVE',
	RESULTS_SCREEN: 'RESULTS_SCREEN',
} as const;

export type GameStage = (typeof GAME_STAGES)[keyof typeof GAME_STAGES];

export const QUIZ_QUESTION_COUNT = 3;
export const QUIZ_SECONDS_PER_QUESTION = 15;
export const QUIZ_FEEDBACK_WRONG_MS = 1_200;
export const QUIZ_FEEDBACK_CORRECT_MS = 550;
