import { Trophy } from 'lucide-react';
import { useMemo } from 'react';
import { tierLabelFromScore } from '@/lib/leaderboardHandles';
import { cn } from '@/lib/utils';
import type { LeaderboardAttempt } from '@/types/leaderboard';

const STORAGE_CAP = 5;

interface HofLeaderboardProps {
	attempts: LeaderboardAttempt[];
}

function formatPts(n: number): string {
	return n.toLocaleString();
}

const HofLeaderboard = ({ attempts }: HofLeaderboardProps) => {
	const { rankedRows, personalBest } = useMemo(() => {
		const sorted = [...attempts].sort((a, b) => b.score - a.score).slice(0, STORAGE_CAP);
		const rows: (LeaderboardAttempt | null)[] = [...sorted];
		while (rows.length < STORAGE_CAP) {
			rows.push(null);
		}
		const best = attempts.length > 0 ? Math.max(...attempts.map((a) => a.score), 0) : 0;
		return { rankedRows: rows, personalBest: best };
	}, [attempts]);

	return (
		<div className='rounded-2xl bg-[#121526] p-5 ring-1 ring-white/6'>
			<div className='mb-4 flex items-center gap-2.5'>
				<Trophy className='size-6 shrink-0 text-brand-cyan' aria-hidden />
				<h2 className='font-heading text-sm font-bold uppercase tracking-[0.12em] text-white'>HOF leaderboard</h2>
			</div>

			<ul className='flex flex-col gap-2.5'>
				{rankedRows.map((row, index) => {
					const rank = index + 1;
					const isTop = rank === 1 && row !== null;

					if (row === null) {
						return (
							<li
								key={`empty-${rank}`}
								className='flex items-center gap-3 rounded-xl bg-[#1a1f35]/80 px-4 py-3 ring-1 ring-white/4'
							>
								<span className='w-6 text-center font-heading text-lg text-white/25 tabular-nums'>{rank}</span>
								<div className='min-w-0 flex-1'>
									<p className='text-sm font-bold uppercase tracking-wide text-white/25'>Slot open</p>
									<p className='text-[10px] font-semibold uppercase tracking-wide text-white/20'>Play a run to claim</p>
								</div>
							</li>
						);
					}

					return (
						<li
							key={row.id}
							className={cn(
								'flex items-center gap-3 rounded-xl border-l-4 border-solid px-4 py-3 ring-1',
								isTop
									? 'border-l-brand-cyan bg-linear-to-r from-[#1c3a48]/90 to-[#141a2e] pl-3 ring-brand-cyan/30'
									: 'border-l-transparent bg-[#1a1f35] ring-white/6',
							)}
						>
							<span
								className={cn(
									'w-6 text-center font-heading text-xl font-bold tabular-nums',
									isTop ? 'text-brand-cyan' : 'text-white/35',
								)}
							>
								{rank}
							</span>
							<div className='min-w-0 flex-1'>
								<p className='truncate font-sans text-sm font-bold uppercase tracking-wide text-white'>{row.handle}</p>
								<p className='text-[10px] font-semibold uppercase tracking-wide text-white/40'>
									{tierLabelFromScore(row.score)}
								</p>
							</div>
							<div className='shrink-0 text-right'>
								<p
									className={cn(
										'font-heading text-lg font-bold tabular-nums',
										isTop ? 'text-brand-cyan' : 'text-white',
									)}
								>
									{formatPts(row.score)}
								</p>
								{isTop ? (
									<p className='text-[9px] font-bold uppercase tracking-wider text-brand-cyan/90'>Total pts</p>
								) : (
									<p className='text-[9px] font-bold uppercase tracking-wider text-white/35'>Total pts</p>
								)}
							</div>
						</li>
					);
				})}
			</ul>

			<div className='mt-4 rounded-xl bg-[#0d101c] px-4 py-3 text-center ring-1 ring-white/5'>
				<p className='text-xs font-bold uppercase tracking-[0.18em] text-[#b8a8dc]'>
					Your best: <span className='text-[#d4c4f4]'>{personalBest > 0 ? formatPts(personalBest) : '—'}</span>
				</p>
			</div>
		</div>
	);
};

export default HofLeaderboard;
