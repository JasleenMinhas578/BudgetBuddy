import { LuUtensils, LuCar, LuFilm, LuZap, LuHome, LuPackage, LuTag } from 'react-icons/lu';

// Map category names to their Lucide icon components
export const CATEGORY_ICON_MAP = {
  'Food':          LuUtensils,
  'Transport':     LuCar,
  'Entertainment': LuFilm,
  'Utilities':     LuZap,
  'Rent':          LuHome,
  'Other':         LuPackage,
};

// Returns a rendered <Icon /> element — drop-in replacement for the old emoji string
export function getCategoryIcon(category, size = 16) {
  const Icon = CATEGORY_ICON_MAP[category] || LuTag;
  return <Icon size={size} />;
}
