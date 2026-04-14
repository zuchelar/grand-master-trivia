import { useState } from 'react';
import StartScreen from '@/routes/start_screen';
import { GAME_STAGES, type GameStage } from '@/types/game';

function App() {
	const [gameStage] = useState<GameStage>(GAME_STAGES.START_SCREEN);

	return <div className='p-4'>{gameStage === GAME_STAGES.START_SCREEN && <StartScreen />}</div>;
}

export default App;
