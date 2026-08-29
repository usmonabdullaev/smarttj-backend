export const AuthSettings = {
  AUTH_OTP_RETRY_DIFFERENCE: 1 * 60 * 1000, // 1 minute
  AUTH_OTP_EXPIRES_AT: 5 * 60 * 1000, // 5 minute
  AUTH_OTP_ATTEMPTS: 5,
  SESSION_EXPIRES_AT: 30 * 24 * 60 * 60 * 1000, // 30 days
} as const;
