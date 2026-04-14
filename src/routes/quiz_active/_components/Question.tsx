import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionProps {
	question: string;
	className?: string;
}

export function Question({ question, className }: QuestionProps) {
	return (
		<div className={cn('relative pt-5', className)}>
			<div
				className='absolute -top-1 left-5 z-10 flex size-11 items-center justify-center rounded-xl bg-[#9D7CFF] shadow-[0_0_20px_rgba(157,124,255,0.45)]'
				aria-hidden
			>
				<Brain className='size-6 text-white' strokeWidth={2} />
			</div>
			<div className='rounded-2xl bg-[#16192e] px-6 pb-8 pt-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-white/10'>
				<p className='font-heading text-xl font-bold leading-snug text-white md:text-2xl'>{question}</p>
			</div>
		</div>
	);
}
