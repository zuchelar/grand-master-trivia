const PREFIXES = ['CYBER', 'NEON', 'VOID', 'PIXEL', 'DATA', 'QUANTUM', 'STELLAR', 'NOVA', 'RAPID', 'ALPHA'] as const;

const SUFFIXES = [
	'PHOENIX',
	'DRIFTER',
	'WALKER',
	'HUNTER',
	'SHARD',
	'RUNNER',
	'GHOST',
	'WOLF',
	'VIPER',
	'ORACLE',
] as const;

export function generateLobbyHandle(): string {
	const p = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
	const s = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
	return `${p}_${s}`;
}

export function tierLabelFromScore(score: number): string {
	if (score >= 20_000) {
		return 'Season elite';
	}

	if (score >= 15_000) {
		return 'Pro challenger';
	}

	if (score >= 10_000) {
		return 'Gold tier';
	}

	if (score >= 5000) {
		return 'Silver tier';
	}

	return 'Rookie run';
}
