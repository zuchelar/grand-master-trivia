import { useEffect, useId, useRef } from 'react';
import useTimer from '@/hooks/useTimer';
import { cn } from '@/lib/utils';

const RING_SIZE = 220;
const RING_STROKE = 12;

interface QuizTimerProps {
	timerLimit: number;
	onTimeout?: () => void;
	className?: string;
	barProgress?: number;
	paused?: boolean;
}

const QuizTimer = ({ timerLimit, onTimeout, className, barProgress, paused = false }: QuizTimerProps) => {
	const ringGlowId = useId().replace(/:/g, '');
	const secondsLeft = useTimer({ timerLimit, onTimeout, paused });
	const progressRingRef = useRef<SVGCircleElement>(null);

	const r = (RING_SIZE - RING_STROKE) / 2;
	const circumference = 2 * Math.PI * r;

	useEffect(() => {
		const ring = progressRingRef.current;
		if (!ring) {
			return;
		}

		if (timerLimit <= 0) {
			ring.setAttribute('stroke-dasharray', `0 ${circumference}`);
			return;
		}

		if (paused) {
			return;
		}

		const limitMs = timerLimit * 1000;
		const start = Date.now();
		let frameId = 0;

		const tick = () => {
			const elapsed = Date.now() - start;
			const remainingFrac = Math.max(0, Math.min(1, 1 - elapsed / limitMs));
			const cyanArc = (1 - remainingFrac) * circumference;

			ring.setAttribute('stroke-dasharray', `${cyanArc} ${circumference}`);

			if (remainingFrac > 0) {
				frameId = requestAnimationFrame(tick);
			}
		};

		ring.setAttribute('stroke-dasharray', `0 ${circumference}`);
		frameId = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frameId);
	}, [timerLimit, paused, circumference]);

	const display = String(secondsLeft).padStart(2, '0');
	const timeRemainingFraction = timerLimit > 0 ? secondsLeft / timerLimit : 0;
	const barWidthFraction = barProgress ?? timeRemainingFraction;

	return (
		<div
			className={cn('flex w-full max-w-md flex-col items-center gap-6', className)}
			role='timer'
			aria-valuemin={0}
			aria-valuemax={timerLimit}
			aria-valuenow={secondsLeft}
			aria-valuetext={`${secondsLeft} seconds remaining`}
		>
			<div className='relative flex flex-col items-center justify-center'>
				<svg width={RING_SIZE} height={RING_SIZE} className='-rotate-90' aria-hidden>
					<defs>
						<filter id={ringGlowId} x='-40%' y='-40%' width='180%' height='180%'>
							<feGaussianBlur in='SourceGraphic' stdDeviation='3' result='blur' />
							<feMerge>
								<feMergeNode in='blur' />
								<feMergeNode in='SourceGraphic' />
							</feMerge>
						</filter>
					</defs>
					<circle
						cx={RING_SIZE / 2}
						cy={RING_SIZE / 2}
						r={r}
						fill='none'
						stroke='rgba(124, 77, 255, 0.22)'
						strokeWidth={RING_STROKE}
						strokeLinecap='round'
					/>
					<circle
						ref={progressRingRef}
						cx={RING_SIZE / 2}
						cy={RING_SIZE / 2}
						r={r}
						fill='none'
						stroke='var(--brand-cyan)'
						strokeWidth={RING_STROKE}
						strokeLinecap='round'
						filter={`url(#${ringGlowId})`}
					/>
				</svg>

				<div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-1'>
					<span className='font-heading text-6xl font-bold tracking-tight text-brand-cyan tabular-nums drop-shadow-[0_0_14px_rgba(0,229,255,0.55)]'>
						{display}
					</span>
					<span className='mt-1 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/55'>
						Seconds
					</span>
				</div>
			</div>

			<div className='h-2.5 w-full max-w-[min(100%,20rem)] overflow-hidden rounded-full bg-black/80'>
				<div
					className='h-full rounded-full bg-linear-to-r from-brand-cyan to-[#9D7CFF] shadow-[0_0_12px_rgba(0,229,255,0.35)] transition-[width] duration-300 ease-out'
					style={{ width: `${barWidthFraction * 100}%` }}
				/>
			</div>
		</div>
	);
};

export default QuizTimer;
