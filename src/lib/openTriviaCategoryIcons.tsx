import type { LucideIcon } from 'lucide-react';
import {
	BookMarked,
	BookOpen,
	Brain,
	Calculator,
	Car,
	Clapperboard,
	Cpu,
	Dice5,
	Gamepad2,
	Globe2,
	Landmark,
	Laptop,
	Laugh,
	Leaf,
	Mic2,
	Music,
	Palette,
	PawPrint,
	Scale,
	Scroll,
	Sparkles,
	Star,
	Trophy,
	Tv,
} from 'lucide-react';

import type { OpenTriviaCategory } from '@/types/open-trivia';

export const OPEN_TRIVIA_CATEGORY_ICONS = {
	9: Brain,
	10: BookOpen,
	11: Clapperboard,
	12: Music,
	13: Mic2,
	14: Tv,
	15: Gamepad2,
	16: Dice5,
	17: Leaf,
	18: Laptop,
	19: Calculator,
	20: Scroll,
	21: Trophy,
	22: Globe2,
	23: Landmark,
	24: Scale,
	25: Palette,
	26: Star,
	27: PawPrint,
	28: Car,
	29: BookMarked,
	30: Cpu,
	31: Sparkles,
	32: Laugh,
} as const satisfies Record<OpenTriviaCategory['id'], LucideIcon>;

type OpenTriviaCategoryId = keyof typeof OPEN_TRIVIA_CATEGORY_ICONS;

export function getOpenTriviaCategoryIcon(id: OpenTriviaCategory['id']): LucideIcon {
	return OPEN_TRIVIA_CATEGORY_ICONS[id as OpenTriviaCategoryId];
}
