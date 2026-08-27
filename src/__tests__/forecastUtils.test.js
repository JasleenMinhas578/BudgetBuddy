import { getMonthEndForecast } from '../utils/forecastUtils';

describe('getMonthEndForecast', () => {
  it('returns null for an empty expenses array', () => {
    expect(getMonthEndForecast([])).toBeNull();
  });

  it('returns an object with forecast and dailyAvg', () => {
    const result = getMonthEndForecast([{ amount: 100 }, { amount: 50 }]);
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('forecast');
    expect(result).toHaveProperty('dailyAvg');
  });

  it('forecast equals dailyAvg × days in the current month', () => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const result = getMonthEndForecast([{ amount: 100 }, { amount: 50 }]);
    expect(result.forecast).toBeCloseTo(result.dailyAvg * daysInMonth);
  });

  it('dailyAvg equals total ÷ days elapsed so far', () => {
    const now = new Date();
    const daysElapsed = now.getDate();
    const result = getMonthEndForecast([{ amount: 100 }, { amount: 50 }]);
    expect(result.dailyAvg).toBeCloseTo(150 / daysElapsed);
  });

  it('treats a missing amount field as 0', () => {
    const now = new Date();
    const daysElapsed = now.getDate();
    const result = getMonthEndForecast([{ amount: 100 }, { title: 'no amount' }]);
    expect(result.dailyAvg).toBeCloseTo(100 / daysElapsed);
  });

  it('dailyAvg scales linearly with total spend', () => {
    const single = getMonthEndForecast([{ amount: 60 }]);
    const double = getMonthEndForecast([{ amount: 60 }, { amount: 60 }]);
    expect(double.dailyAvg).toBeCloseTo(single.dailyAvg * 2);
  });
});
