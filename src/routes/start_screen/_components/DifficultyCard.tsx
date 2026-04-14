import { Zap } from 'lucide-react';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { OPEN_TRIVIA_DIFFICULTIES, type OpenTriviaDifficulty } from '@/types/open-trivia';

const DIFFICULTY_OPTIONS = [
	{ difficulty: OPEN_TRIVIA_DIFFICULTIES.EASY, label: 'Easy', pointsLabel: '100 PTS / Q' },
	{ difficulty: OPEN_TRIVIA_DIFFICULTIES.MEDIUM, label: 'Medium', pointsLabel: '250 PTS / Q' },
	{ difficulty: OPEN_TRIVIA_DIFFICULTIES.HARD, label: 'Hard', pointsLabel: '500 PTS / Q' },
] as const;

interface DifficultyCardProps {
	value?: OpenTriviaDifficulty | null;
	defaultValue?: OpenTriviaDifficulty | null;
	onValueChange?: (difficulty: OpenTriviaDifficulty) => void;
	className?: string;
}

const DifficultyCard = ({ value: valueProp, defaultValue = null, onValueChange, className }: DifficultyCardProps) => {
	const [uncontrolled, setUncontrolled] = useState<OpenTriviaDifficulty | null>(defaultValue);
	const isControlled = valueProp !== undefined;
	const selected = isControlled ? (valueProp ?? null) : uncontrolled;

	const setSelected = (d: OpenTriviaDifficulty) => {
		if (!isControlled) setUncontrolled(d);
		onValueChange?.(d);
	};

	return (
		<Card
			title='Challenge Level'
			icon={<Zap className='size-5 shrink-0 text-brand-purple' aria-hidden />}
			className={className}
			titleClassName='font-bold uppercase tracking-wide text-white'
		>
			<div className='flex flex-col gap-2.5'>
				{DIFFICULTY_OPTIONS.map(({ difficulty, label, pointsLabel }) => {
					const isOn = selected === difficulty;
					return (
						<button
							key={difficulty}
							type='button'
							aria-pressed={isOn}
							onClick={() => setSelected(difficulty)}
							className={cn(
								'flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors',
								'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/70 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950',
								isOn ? 'bg-brand-purple' : 'bg-indigo-900/55 hover:bg-indigo-900/75',
							)}
						>
							<span
								className={cn('text-sm font-bold uppercase tracking-wide', isOn ? 'text-indigo-950' : 'text-white')}
							>
								{label}
							</span>
							<span
								className={cn(
									'text-xs font-semibold uppercase tracking-wide sm:text-sm',
									isOn ? 'text-indigo-950/75' : 'text-indigo-200/50',
								)}
							>
								{pointsLabel}
							</span>
						</button>
					);
				})}
			</div>
		</Card>
	);
};

export default DifficultyCard;
