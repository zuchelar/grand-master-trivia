import { useEffect, useRef, useState } from 'react';

interface TimerProps {
	/** Countdown duration in whole seconds. */
	timerLimit: number;
	onTimeout?: () => void;
	/** When true, countdown is frozen and `onTimeout` will not run. */
	paused?: boolean;
}

/**
 * Counts down from `timerLimit` to 0. Returns whole seconds remaining.
 * `onTimeout` runs once when the countdown first hits zero.
 */
const useTimer = ({ timerLimit, onTimeout, paused = false }: TimerProps): number => {
	const onTimeoutRef = useRef(onTimeout);
	onTimeoutRef.current = onTimeout;

	const [remainingSec, setRemainingSec] = useState(() => Math.max(0, timerLimit));
	const timeoutFiredRef = useRef(false);

	useEffect(() => {
		setRemainingSec(Math.max(0, timerLimit));
	}, [timerLimit]);

	useEffect(() => {
		if (timerLimit <= 0 || paused) {
			return;
		}

		timeoutFiredRef.current = false;
		const start = Date.now();
		const limitMs = timerLimit * 1000;

		const id = setInterval(() => {
			const elapsed = Date.now() - start;
			const next = Math.max(0, Math.ceil((limitMs - elapsed) / 1000));

			setRemainingSec((prev) => {
				if (next === 0 && prev > 0 && !timeoutFiredRef.current) {
					timeoutFiredRef.current = true;
					onTimeoutRef.current?.();
				}
				return next;
			});
		}, 1000);

		return () => clearInterval(id);
	}, [timerLimit, paused]);

	return remainingSec;
};

export default useTimer;
