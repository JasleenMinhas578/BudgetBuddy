// Supabase lets each address get one auth email (signup confirmation,
// password reset) per 60 seconds, and answers anything sooner with
// `over_email_send_rate_limit` and a message like "For security purposes, you
// can only request this after 42 seconds." The same code (without a number)
// is used when the project's hourly email quota runs out.
export const EMAIL_COOLDOWN_SECONDS = 60;

export function isRateLimitError(error) {
  return (
    error?.code === 'over_email_send_rate_limit' ||
    error?.code === 'over_request_rate_limit' ||
    error?.status === 429
  );
}

// Seconds until another email can be requested, or null if the error doesn't
// say (the hourly quota, or a message format we don't recognise).
export function retryAfterSeconds(error) {
  const match = /(?:after|every) (\d+) seconds?/i.exec(error?.message || '');
  return match ? Number(match[1]) : null;
}

// The error text to show for a rate-limit error, given the countdown it
// started (if any).
export function rateLimitMessage(seconds) {
  return seconds
    ? 'To keep your account secure, we can only send one email a minute. You can request another one when the timer on the button runs out.'
    : 'Too many emails have been sent recently. Please wait a few minutes and try again.';
}
