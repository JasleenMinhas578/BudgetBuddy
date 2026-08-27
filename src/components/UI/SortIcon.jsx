import { LuArrowUp, LuArrowDown, LuArrowUpDown } from 'react-icons/lu';

export default function SortIcon({ active, dir }) {
  if (!active) return <LuArrowUpDown size={13} className="sort-icon-inactive" />;
  return dir === 'asc'
    ? <LuArrowUp size={13} className="sort-icon-active" />
    : <LuArrowDown size={13} className="sort-icon-active" />;
}
