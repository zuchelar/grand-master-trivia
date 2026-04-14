import successSoundUrl from '@/assets/success.mp3';

export function playCorrectChime(): void {
	const audio = new Audio(successSoundUrl);
	audio.volume = 0.9;
	void audio.play().catch(() => {
		// Autoplay policy or playback errors (user gesture, etc.).
	});
}
