// Unit tests for `guessHomeCurrency` — picks the signup form's default
// home currency from a browser locale, limited to the app's 10 currencies.
import { guessHomeCurrency } from '../utils/currencyUtils';

describe('guessHomeCurrency', () => {
  it.each([
    ['en-US', 'USD'],
    ['en-CA', 'CAD'],
    ['fr-CA', 'CAD'],
    ['en-GB', 'GBP'],
    ['en-IN', 'INR'],
    ['de-DE', 'EUR'],
    ['ja', 'JPY'],   // no region — inferred (ja → JP)
    ['fr', 'EUR'],   // no region — inferred (fr → FR, a eurozone country)
  ])('maps %s to %s', (locale, expected) => {
    expect(guessHomeCurrency(locale)).toBe(expected);
  });

  it('falls back to USD for a region the app has no currency for', () => {
    expect(guessHomeCurrency('pt-BR')).toBe('USD');
  });

  it('falls back to USD for an invalid locale', () => {
    expect(guessHomeCurrency('not a locale!')).toBe('USD');
  });
});
