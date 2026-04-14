import { type ComponentPropsWithoutRef } from 'react';
import { type OpenTriviaAnswerLetter } from '@/lib/openTriviaAnswers';
import { cn } from '@/lib/utils';

interface AnswerProps extends Omit<ComponentPropsWithoutRef<'button'>, 'children'> {
	letter: OpenTriviaAnswerLetter;
	children: string;
	selected?: boolean;
	incorrectHighlight?: boolean;
	onSelect?: () => void;
}

export function Answer({
	letter,
	children,
	selected = false,
	incorrectHighlight = false,
	disabled,
	onSelect,
	className,
	onClick,
	...props
}: AnswerProps) {
	return (
		<button
			type='button'
			aria-pressed={selected}
			disabled={disabled}
			onClick={(e) => {
				onClick?.(e);
				if (!disabled) {
					onSelect?.();
				}
			}}
			className={cn(
				'group flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-[background-color,box-shadow,transform] duration-150',
				'bg-[#232147] text-white',
				'shadow-[inset_4px_0_0_rgba(168,150,230,0.45),inset_-3px_-4px_10px_rgba(0,0,0,0.35),inset_0_2px_0_rgba(255,255,255,0.06)]',
				'hover:bg-[#2a2854] hover:shadow-[inset_4px_0_0_rgba(188,170,245,0.5),inset_-3px_-4px_12px_rgba(0,0,0,0.38),inset_0_2px_0_rgba(255,255,255,0.08)]',
				'active:translate-y-px',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 focus-visible:ring-offset-[#12122a]',
				'disabled:pointer-events-none disabled:opacity-45',
				selected &&
					'bg-[#2e2b58] shadow-[inset_4px_0_0_rgba(124,77,255,0.85),inset_-3px_-4px_10px_rgba(0,0,0,0.35),0_0_0_2px_rgba(124,77,255,0.45)]',
				incorrectHighlight &&
					'bg-[#3a1f2e] shadow-[inset_4px_0_0_rgba(248,113,113,0.75),inset_-3px_-4px_10px_rgba(0,0,0,0.35),0_0_0_2px_rgba(239,68,68,0.65)]',
				className,
			)}
			{...props}
		>
			<span
				className={cn(
					'flex size-11 shrink-0 items-center justify-center rounded-lg text-base font-bold tabular-nums',
					'bg-[#433E70] text-white transition-colors duration-150',
					'group-hover:bg-[#4d477c]',
					selected && !incorrectHighlight && 'bg-[#5c4ba8] group-hover:bg-[#5c4ba8]',
					incorrectHighlight && 'bg-[#b91c1c] group-hover:bg-[#b91c1c]',
				)}
			>
				{letter}
			</span>
			<span className='min-w-0 flex-1 font-sans text-base font-bold leading-snug text-[#f4f2ff]'>{children}</span>
		</button>
	);
}
