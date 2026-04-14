import { ChevronDown, Shapes } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getOpenTriviaCategoryIcon } from '@/lib/openTriviaCategoryIcons';
import { cn } from '@/lib/utils';
import { OPEN_TRIVIA_CATEGORIES, type OpenTriviaCategory } from '@/types/open-trivia';

const DEFAULT_FEATURED_IDS: OpenTriviaCategory['id'][] = [9, 11];

const categoryIconClassName = 'size-4 shrink-0 text-brand-cyan';

function formatCategoryLabel(name: string): string {
	return name.replace(/^Entertainment:\s*/i, '').trim();
}

function sortBySourceOrder(categories: typeof OPEN_TRIVIA_CATEGORIES) {
	const indexById = new Map(OPEN_TRIVIA_CATEGORIES.map((c, i) => [c.id, i]));
	return [...categories].sort((a, b) => (indexById.get(a.id) ?? 0) - (indexById.get(b.id) ?? 0));
}

interface CategoryCardProps {
	value?: OpenTriviaCategory['id'] | null;
	defaultValue?: OpenTriviaCategory['id'] | null;
	onValueChange?: (id: OpenTriviaCategory['id']) => void;
	featuredIds?: OpenTriviaCategory['id'][];
	className?: string;
}

const CategoryCard = ({
	value: valueProp,
	defaultValue = null,
	onValueChange,
	featuredIds = DEFAULT_FEATURED_IDS,
	className,
}: CategoryCardProps) => {
	const panelId = useId();
	const [uncontrolled, setUncontrolled] = useState<OpenTriviaCategory['id'] | null>(defaultValue);
	const isControlled = valueProp !== undefined;
	const selectedId = isControlled ? (valueProp ?? null) : uncontrolled;

	const setSelected = (id: OpenTriviaCategory['id']) => {
		if (!isControlled) setUncontrolled(id);
		onValueChange?.(id);
	};

	const { featured, rest, selectedMoreCategory, SummaryIcon } = useMemo(() => {
		const featuredIdSet = new Set(featuredIds.slice(0, 2));
		const featured = sortBySourceOrder(OPEN_TRIVIA_CATEGORIES.filter((c) => featuredIdSet.has(c.id)));
		const rest = sortBySourceOrder(OPEN_TRIVIA_CATEGORIES.filter((c) => !featuredIdSet.has(c.id)));
		const selectedMoreCategory =
			selectedId !== null && !featuredIdSet.has(selectedId)
				? (OPEN_TRIVIA_CATEGORIES.find((c) => c.id === selectedId) ?? null)
				: null;
		const SummaryIcon = selectedMoreCategory ? getOpenTriviaCategoryIcon(selectedMoreCategory.id) : null;
		return { featured, rest, selectedMoreCategory, SummaryIcon };
	}, [featuredIds, selectedId]);

	return (
		<Card
			title='Select domain'
			icon={<Shapes className='text-brand-cyan' />}
			className={className}
			titleClassName='uppercase'
		>
			<div className='flex flex-col gap-3'>
				<div className='flex flex-wrap gap-2'>
					{featured.map((cat) => {
						const Icon = getOpenTriviaCategoryIcon(cat.id);
						const isOn = selectedId === cat.id;
						return (
							<Button
								key={cat.id}
								type='button'
								variant={isOn ? 'default' : 'outline'}
								size='sm'
								className='min-h-10'
								aria-pressed={isOn}
								onClick={() => setSelected(cat.id)}
							>
								<Icon data-icon='inline-start' className={categoryIconClassName} aria-hidden />
								{formatCategoryLabel(cat.name)}
							</Button>
						);
					})}
				</div>

				<details className='group rounded-lg border border-border bg-muted/30'>
					<summary
						className={cn(
							'flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium text-foreground outline-none',
							'hover:bg-muted/60 rounded-lg transition-colors',
							'focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring',
							'[&::-webkit-details-marker]:hidden',
						)}
					>
						{selectedMoreCategory && SummaryIcon ? (
							<span className='flex min-w-0 flex-1 items-center gap-2'>
								<SummaryIcon className={categoryIconClassName} aria-hidden />
								<span className='min-w-0 truncate'>{formatCategoryLabel(selectedMoreCategory.name)}</span>
							</span>
						) : (
							<span className='min-w-0 flex-1'>
								More categories
								<span className='ml-1.5 font-normal text-muted-foreground'>({rest.length})</span>
							</span>
						)}
						<ChevronDown
							className='size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180'
							aria-hidden
						/>
					</summary>
					<div
						id={panelId}
						className='max-h-64 overflow-y-auto border-t border-border px-2 py-3 sm:px-3'
						role='region'
						aria-label='Additional trivia categories'
					>
						<ul className='grid grid-cols-1 gap-1.5 sm:grid-cols-2'>
							{rest.map((cat) => {
								const Icon = getOpenTriviaCategoryIcon(cat.id);
								const isOn = selectedId === cat.id;
								return (
									<li key={cat.id}>
										<Button
											type='button'
											variant={isOn ? 'secondary' : 'ghost'}
											size='sm'
											className='h-auto min-h-9 w-full justify-start gap-2 px-2.5 py-2 text-left font-normal whitespace-normal'
											aria-pressed={isOn}
											onClick={() => setSelected(cat.id)}
										>
											<Icon className={categoryIconClassName} aria-hidden />
											<span className='leading-snug'>{formatCategoryLabel(cat.name)}</span>
										</Button>
									</li>
								);
							})}
						</ul>
					</div>
				</details>
			</div>
		</Card>
	);
};

export default CategoryCard;
