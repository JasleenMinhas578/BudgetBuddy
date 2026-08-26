import { LuUtensils, LuCar, LuFilm, LuZap, LuHome, LuPackage, LuShoppingBag, LuTag } from 'react-icons/lu';

export const CATEGORY_ICON_MAP = {
  'Food':          LuUtensils,
  'Transport':     LuCar,
  'Entertainment': LuFilm,
  'Utilities':     LuZap,
  'Rent':          LuHome,
  'Shopping':      LuShoppingBag,
  'Other':         LuPackage,
};

export const DEFAULT_CATEGORIES = [
  { id: 'food',          name: 'Food',          Icon: CATEGORY_ICON_MAP['Food']          },
  { id: 'transport',     name: 'Transport',     Icon: CATEGORY_ICON_MAP['Transport']     },
  { id: 'entertainment', name: 'Entertainment', Icon: CATEGORY_ICON_MAP['Entertainment'] },
  { id: 'utilities',     name: 'Utilities',     Icon: CATEGORY_ICON_MAP['Utilities']     },
  { id: 'rent',          name: 'Rent',          Icon: CATEGORY_ICON_MAP['Rent']          },
  { id: 'shopping',      name: 'Shopping',      Icon: CATEGORY_ICON_MAP['Shopping']      },
  { id: 'other',         name: 'Other',         Icon: CATEGORY_ICON_MAP['Other']         },
];

export function getCategoryIcon(category, size = 16) {
  const Icon = CATEGORY_ICON_MAP[category] || LuTag;
  return <Icon size={size} />;
}
