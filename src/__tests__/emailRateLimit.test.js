// Tests for utils/emailRateLimit.js — reading Supabase's email rate-limit
// errors so the auth screens can show a countdown.
import { isRateLimitError, rateLimitMessage, retryAfterSeconds } from '../utils/emailRateLimit';

describe('emailRateLimit', () => {
  it('recognises Supabase rate-limit errors', () => {
    expect(isRateLimitError({ code: 'over_email_send_rate_limit' })).toBe(true);
    expect(isRateLimitError({ code: 'over_request_rate_limit' })).toBe(true);
    expect(isRateLimitError({ status: 429 })).toBe(true);
    expect(isRateLimitError({ code: 'invalid_credentials', status: 400 })).toBe(false);
    expect(isRateLimitError(undefined)).toBe(false);
  });

  it('reads the wait time from the error message', () => {
    expect(retryAfterSeconds({
      message: 'For security purposes, you can only request this after 42 seconds.',
    })).toBe(42);
    expect(retryAfterSeconds({ message: 'you can only request this after 1 second.' })).toBe(1);
    expect(retryAfterSeconds({ message: 'you can only request this once every 60 seconds' })).toBe(60);
  });

  it('returns null when there is no wait time to read', () => {
    expect(retryAfterSeconds({ message: 'email rate limit exceeded' })).toBeNull();
    expect(retryAfterSeconds({})).toBeNull();
    expect(retryAfterSeconds(null)).toBeNull();
  });

  it('words the message for a countdown vs the hourly limit', () => {
    expect(rateLimitMessage(42)).toMatch(/one email a minute/i);
    expect(rateLimitMessage(null)).toMatch(/wait a few minutes/i);
  });
});
