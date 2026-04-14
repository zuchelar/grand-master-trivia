import { Flame, RefreshCw, Share2, Sparkles, Zap } from 'lucide-react';
import { useMemo } from 'react';
import { timeBonusPercent } from '@/lib/quizScoring';
import { cn } from '@/lib/utils';
import type { QuizQuestionStat } from '@/types/quiz-session';

interface ResultsScreenProps {
	stats: QuizQuestionStat[];
	maxStreakThisRun: number;
	onPlayAgain: () => void;
}

function streakLabel(streak: number): { title: string; subtitle: string } {
	if (streak >= 12) {
		return { title: String(streak), subtitle: 'Unstoppable' };
	}

	if (streak >= 8) {
		return { title: String(streak), subtitle: 'On fire' };
	}

	if (streak >= 4) {
		return { title: String(streak), subtitle: 'Heating up' };
	}

	return { title: String(streak), subtitle: 'Keep pushing' };
}

function topPercentileLabel(accuracyPct: number): string {
	if (accuracyPct >= 95) {
		return 'Top 2% of players today';
	}

	if (accuracyPct >= 85) {
		return 'Top 8% of players today';
	}

	if (accuracyPct >= 70) {
		return 'Top 20% of players today';
	}

	return 'Room to climb the ladder';
}

const ResultsScreen = ({ stats, maxStreakThisRun, onPlayAgain }: ResultsScreenProps) => {
	const summary = useMemo(() => {
		const totalAnswered = stats.length;
		const correctCount = stats.filter((s) => s.correct).length;
		const accuracyPct = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
		const totalScore = stats.reduce((acc, s) => acc + s.points, 0);
		const avgElapsedMs = totalAnswered > 0 ? stats.reduce((acc, s) => acc + s.elapsedMs, 0) / totalAnswered : 0;
		const avgSpeedSec = avgElapsedMs / 1000;
		const correctWithBonus = stats.filter((s) => s.correct && s.timeBonus > 0);
		const avgSpeedBonusPct =
			correctWithBonus.length > 0
				? Math.round(
						correctWithBonus.reduce((acc, s) => acc + timeBonusPercent(s.timeBonus), 0) / correctWithBonus.length,
					)
				: 0;
		const maxPoints = totalAnswered > 0 ? Math.max(...stats.map((s) => s.points), 1) : 1;
		const maxElapsed = totalAnswered > 0 ? Math.max(...stats.map((s) => s.elapsedMs), 1) : 1;
		return {
			totalAnswered,
			accuracyPct,
			totalScore,
			avgSpeedSec,
			avgSpeedBonusPct,
			maxPoints,
			maxElapsed,
		};
	}, [stats]);

	const showGrandMasterBadge = summary.accuracyPct >= 90 && summary.totalAnswered >= 3;
	const streak = streakLabel(maxStreakThisRun);

	const shareResults = async () => {
		const text = `I scored ${summary.totalScore.toLocaleString()} pts (${summary.accuracyPct}% accuracy) on Grand Master Trivia.`;
		try {
			if (navigator.share) {
				await navigator.share({ title: 'Grand Master Trivia', text });
			} else {
				await navigator.clipboard.writeText(text);
			}
		} catch {
			// User cancelled or clipboard/share unavailable.
		}
	};

	return (
		<div className='mx-auto flex w-full max-w-lg flex-col gap-6 pb-12 pt-4'>
			<div className='flex flex-col items-center gap-3 text-center'>
				{showGrandMasterBadge && (
					<div className='flex items-center justify-center gap-1.5 rounded-full bg-[#1e1a3a] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-cyan ring-1 ring-brand-cyan/35'>
						<Sparkles className='size-3 shrink-0' aria-hidden />
						Grand master status achieved
					</div>
				)}
				<h1 className='font-heading text-4xl font-bold tracking-tight text-white md:text-5xl'>VICTORY</h1>
				<p className='font-heading text-6xl font-bold tabular-nums text-brand-cyan drop-shadow-[0_0_24px_rgba(0,229,255,0.35)] md:text-7xl'>
					{summary.totalScore.toLocaleString()}
				</p>
				<p className='text-xs font-bold uppercase tracking-[0.25em] text-[#a89bc4]'>Total score</p>
			</div>

			<div className='relative overflow-hidden rounded-2xl bg-[#1A1A2E] p-5 ring-1 ring-white/[0.06]'>
				<div
					className='pointer-events-none absolute -right-8 top-1/2 size-40 -translate-y-1/2 rounded-full border border-white/[0.04] opacity-40'
					aria-hidden
				/>
				<div
					className='pointer-events-none absolute -right-4 top-1/2 size-24 -translate-y-1/2 rounded-full border border-white/[0.06] opacity-30'
					aria-hidden
				/>
				<p className='text-[10px] font-bold uppercase tracking-[0.18em] text-white/45'>Performance accuracy</p>
				<p className='mt-2 font-heading text-4xl font-bold text-brand-green'>{summary.accuracyPct}%</p>
				<div className='mt-4 h-2.5 w-full overflow-hidden rounded-full bg-black/50'>
					<div
						className='h-full rounded-full bg-linear-to-r from-[#7c4dff] to-brand-purple shadow-[0_0_12px_rgba(124,77,255,0.4)] transition-[width] duration-500'
						style={{ width: `${summary.accuracyPct}%` }}
					/>
				</div>
				<p className='mt-3 text-sm text-white/45'>{topPercentileLabel(summary.accuracyPct)}</p>
			</div>

			<div className='grid grid-cols-2 gap-3'>
				<div className='flex flex-col items-center rounded-2xl bg-[#1A1A2E] px-4 py-5 text-center ring-1 ring-white/[0.06]'>
					<Zap className='mb-2 size-6 text-brand-cyan' aria-hidden />
					<p className='text-[10px] font-bold uppercase tracking-[0.15em] text-white/45'>Average speed</p>
					<p className='mt-1 font-heading text-2xl font-bold text-white tabular-nums'>
						{summary.avgSpeedSec.toFixed(1)}s
					</p>
					<p className='mt-1 text-xs font-semibold text-brand-cyan'>+{summary.avgSpeedBonusPct}% speed bonus</p>
				</div>
				<div className='flex flex-col items-center rounded-2xl bg-[#1A1A2E] px-4 py-5 text-center ring-1 ring-white/[0.06]'>
					<Flame className='mb-2 size-6 text-[#FF6B35]' aria-hidden />
					<p className='text-[10px] font-bold uppercase tracking-[0.15em] text-white/45'>Current streak</p>
					<p className='mt-1 font-heading text-2xl font-bold text-white tabular-nums'>{streak.title}</p>
					<p className='mt-1 text-xs font-semibold text-[#FF6B35]'>{streak.subtitle}</p>
				</div>
			</div>

			<div className='rounded-2xl bg-[#1A1A2E] p-5 ring-1 ring-white/[0.06]'>
				<div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
					<p className='font-heading text-sm font-bold text-white'>Performance flow</p>
					<div className='flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-wide text-white/50'>
						<span className='flex items-center gap-1.5'>
							<span className='size-2 rounded-full bg-brand-cyan' aria-hidden />
							Response time
						</span>
						<span className='flex items-center gap-1.5'>
							<span className='size-2 rounded-full bg-[#8A2BE2]' aria-hidden />
							Points
						</span>
					</div>
				</div>
				<div
					className='flex h-[140px] justify-between gap-1.5 sm:gap-2'
					role='img'
					aria-label='Per-question points and response time'
				>
					{stats.length === 0 ? (
						<p className='w-full py-8 text-center text-sm text-white/40'>No rounds to show yet.</p>
					) : (
						stats.map((s, i) => {
							const trackPx = 120;
							const hFracPoints = summary.maxPoints > 0 ? Math.min(1, s.points / summary.maxPoints) : 0;
							const hFracTime = summary.maxElapsed > 0 ? Math.min(1, s.elapsedMs / summary.maxElapsed) : 0;
							const barPointsPx = Math.max(6, Math.round(hFracPoints * trackPx));
							const barTimePx = Math.max(6, Math.round(hFracTime * trackPx));
							return (
								<div
									key={`${i}-${s.elapsedMs}`}
									className='flex min-h-0 min-w-0 flex-1 flex-col items-stretch justify-end'
								>
									<div className='mx-auto flex h-[120px] w-full max-w-9 items-end justify-center gap-1'>
										<div
											className={cn('w-[42%] max-w-3 shrink-0 rounded-t-sm bg-brand-cyan', !s.correct && 'opacity-30')}
											style={{ height: barTimePx }}
											title={`Q${i + 1} response time`}
										/>
										<div
											className={cn('w-[42%] max-w-3 shrink-0 rounded-t-sm bg-[#8A2BE2]', !s.correct && 'opacity-30')}
											style={{ height: barPointsPx }}
											title={`Q${i + 1} points`}
										/>
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>

			<div className='flex flex-col gap-3 pt-2'>
				<button
					type='button'
					onClick={onPlayAgain}
					className='flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-[#7c4dff] to-[#c4a6ff] py-4 text-sm font-bold uppercase tracking-[0.12em] text-[#0D0D1A] shadow-[0_0_28px_rgba(124,77,255,0.45)] transition-[filter] hover:brightness-110'
				>
					<RefreshCw className='size-5' aria-hidden />
					Play again
				</button>
				<button
					type='button'
					onClick={() => void shareResults()}
					className='flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-[#12121f] py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-white/5'
				>
					<Share2 className='size-5' aria-hidden />
					Share result
				</button>
			</div>
		</div>
	);
};

export default ResultsScreen;
