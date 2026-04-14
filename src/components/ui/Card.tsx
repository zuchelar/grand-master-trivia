import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
	title: string;
	icon: ReactNode;
	children?: ReactNode;
	className?: string;
	titleClassName?: string;
}

function Card({ title, icon, children, className, titleClassName }: CardProps) {
	return (
		<div className={cn('flex flex-col p-8 gap-4 bg-indigo-950 rounded-lg', className)}>
			<div className='flex items-center gap-2'>
				<span>{icon}</span>
				<h3 className={cn('text-lg font-semibold', titleClassName)}>{title}</h3>
			</div>
			<div>{children}</div>
		</div>
	);
}

export { Card };
