export default () => ({
  THROTTLE_TTL: 10000,
  THROTTLE_LIMIT: 10,
  PORT: parseInt(process.env.PORT ?? '3008', 10) || 3000,
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  ACCESS_SECRET_KEY: process.env.ACCESS_SECRET_KEY ?? '',
  REFRESH_SECRET_KEY: process.env.REFRESH_SECRET_KEY ?? ''
});
