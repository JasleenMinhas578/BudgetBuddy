import { formatDate, safeFormatDate, toAmount } from '../utils/formatDate';

describe('formatDate', () => {
  it('returns empty string for null', () => expect(formatDate(null)).toBe(''));
  it('returns empty string for undefined', () => expect(formatDate(undefined)).toBe(''));
  it('returns empty string for empty string', () => expect(formatDate('')).toBe(''));

  it('formats a valid date string', () => expect(formatDate('2024-03-15')).toBe('Mar 15, 2024'));
  it('formats January correctly', () => expect(formatDate('2024-01-01')).toBe('Jan 01, 2024'));
  it('formats December correctly', () => expect(formatDate('2024-12-31')).toBe('Dec 31, 2024'));

  it('returns raw string when day part is missing', () => expect(formatDate('2024-03')).toBe('2024-03'));
  it('returns raw string when year is missing (leading dash)', () => expect(formatDate('-01-15')).toBe('-01-15'));

  it('returns raw string for month 00 (invalid)', () => expect(formatDate('2024-00-15')).toBe('2024-00-15'));
  it('returns raw string for month 13 (out of range)', () => expect(formatDate('2024-13-15')).toBe('2024-13-15'));

  it('handles all 12 months correctly', () => {
    const expected = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    expected.forEach((abbr, i) => {
      const mm = String(i + 1).padStart(2, '0');
      expect(formatDate(`2024-${mm}-01`)).toBe(`${abbr} 01, 2024`);
    });
  });
});

describe('safeFormatDate', () => {
  it('returns empty string for null', () => expect(safeFormatDate(null, 'yyyy-MM-dd')).toBe(''));
  it('returns empty string for empty string', () => expect(safeFormatDate('', 'yyyy-MM-dd')).toBe(''));
  it('formats a valid ISO string', () => expect(safeFormatDate('2024-03-15', 'MMMM d, yyyy')).toBe('March 15, 2024'));
  it('returns empty string for a non-date string', () => expect(safeFormatDate('not-a-date', 'yyyy')).toBe(''));
});

describe('toAmount', () => {
  it('returns the number unchanged', () => expect(toAmount(42)).toBe(42));
  it('returns 0 for a numeric string', () => expect(toAmount('5')).toBe(0));
  it('returns 0 for null', () => expect(toAmount(null)).toBe(0));
  it('returns 0 for undefined', () => expect(toAmount(undefined)).toBe(0));
});
