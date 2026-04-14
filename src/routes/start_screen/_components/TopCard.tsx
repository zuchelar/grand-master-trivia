const TopCard = () => {
	return (
		<div className='relative flex flex-col gap-4 overflow-hidden rounded-lg bg-indigo-950 p-8 w-full'>
			{/* Decorative ambient glows */}
			<div
				className='pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-[#7c4dff]/20 blur-3xl'
				aria-hidden
			/>
			<div
				className='pointer-events-none absolute -left-8 bottom-0 size-32 rounded-full bg-[#00e5ff]/10 blur-2xl'
				aria-hidden
			/>

			<h1 className='font-heading text-6xl font-bold lg:text-7xl'>
				<span className='block text-white/50 text-lg uppercase tracking-[0.35em] font-semibold mb-1 lg:text-xl'>
					The
				</span>
				<span className='block text-white uppercase'>Grand</span>
				<span className='block uppercase text-[#00e5ff] drop-shadow-[0_0_24px_rgba(0,229,255,0.4)]'>Master</span>
			</h1>

			<p className='text-indigo-100/70 font-medium leading-relaxed text-sm lg:text-base max-w-prose'>
				Enter the arena of supreme intellect. Outsmart the system, climb the ladder, and claim your digital legacy.
			</p>
		</div>
	);
};

export default TopCard;
