export const GAME_STAGES = {
	START_SCREEN: 'START_SCREEN',
	QUIZ_ACTIVE: 'QUIZ_ACTIVE',
	RESULTS_SCREEN: 'RESULTS_SCREEN',
} as const;

export type GameStage = (typeof GAME_STAGES)[keyof typeof GAME_STAGES];
