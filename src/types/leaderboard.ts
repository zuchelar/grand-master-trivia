export interface LeaderboardAttempt {
	id: string;
	handle: string;
	score: number;
	accuracyPct: number;
	streak: number;
	createdAt: number;
	runSignature: string;
}
