const TopCard = () => {
	return (
		<div className='flex flex-col p-8 gap-4 bg-indigo-950 rounded-lg w-full'>
			<h1 className='text-6xl font-bold'>
				<span className='block md:inline md:mr-2 text-white uppercase'>The</span>
				<span className='block md:inline md:mr-2 text-white uppercase'>Grand</span>
				<span className='block md:inline text-[#61C0FF] md:text-white uppercase'>Master</span>
			</h1>
			<p className='text-indigo-100 font-medium'>
				Enter the arena of supreme intellect. Outsmart the system, climb the ladder, and claim your digital legacy.
			</p>
		</div>
	);
};

export default TopCard;
