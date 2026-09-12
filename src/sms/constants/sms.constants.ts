export const SMS_CONSTANTS = {
  DEFAULT_PRIMARY_URL: 'https://sms2.aliftech.net',
  DEFAULT_FALLBACK_URL: 'https://smsgate.tj',
  DEFAULT_SENDER_ADDRESS: 'SmartTJ',
  DEFAULT_TIMEOUT_MS: 8000,
  DEFAULT_OTP_EXPIRES_IN_SEC: 300,
  PROVIDER_NAME: 'SMS GATE',
  API_PATHS: {
    SEND_SINGLE: '/api/v1/sms',
    SEND_BULK: '/api/v1/sms/bulk',
    GET_STATUS: (id: string | number) => `/api/v1/sms/${id}`,
  },
} as const;
