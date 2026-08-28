import { getMonthEndForecast } from '../utils/forecastUtils';

// Pin to the 15th of a month so daysElapsed >= 3 and the function never returns null
const FAKE_NOW = new Date(2024, 0, 15); // 15 Jan 2024

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(FAKE_NOW);
});

afterAll(() => {
  jest.useRealTimers();
});

describe('getMonthEndForecast', () => {
  it('returns null for an empty expenses array', () => {
    expect(getMonthEndForecast([])).toBeNull();
  });

  it('returns null on day 1 and day 2 to avoid inflated forecasts', () => {
    jest.setSystemTime(new Date(2024, 0, 1));
    expect(getMonthEndForecast([{ amount: 100 }])).toBeNull();
    jest.setSystemTime(new Date(2024, 0, 2));
    expect(getMonthEndForecast([{ amount: 100 }])).toBeNull();
    jest.setSystemTime(FAKE_NOW); // restore
  });

  it('returns an object with forecast and dailyAvg', () => {
    const result = getMonthEndForecast([{ amount: 100 }, { amount: 50 }]);
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('forecast');
    expect(result).toHaveProperty('dailyAvg');
  });

  it('forecast equals dailyAvg × days in the current month', () => {
    const daysInMonth = new Date(2024, 1, 0).getDate(); // 31 for Jan
    const result = getMonthEndForecast([{ amount: 100 }, { amount: 50 }]);
    expect(result.forecast).toBeCloseTo(result.dailyAvg * daysInMonth);
  });

  it('dailyAvg equals total ÷ days elapsed so far', () => {
    const daysElapsed = FAKE_NOW.getDate(); // 15
    const result = getMonthEndForecast([{ amount: 100 }, { amount: 50 }]);
    expect(result.dailyAvg).toBeCloseTo(150 / daysElapsed);
  });

  it('treats a missing amount field as 0', () => {
    const daysElapsed = FAKE_NOW.getDate();
    const result = getMonthEndForecast([{ amount: 100 }, { title: 'no amount' }]);
    expect(result.dailyAvg).toBeCloseTo(100 / daysElapsed);
  });

  it('dailyAvg scales linearly with total spend', () => {
    const single = getMonthEndForecast([{ amount: 60 }]);
    const double = getMonthEndForecast([{ amount: 60 }, { amount: 60 }]);
    expect(double.dailyAvg).toBeCloseTo(single.dailyAvg * 2);
  });
});
