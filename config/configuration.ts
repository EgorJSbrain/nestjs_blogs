export default () => ({
  PORT: parseInt(process.env.PORT ?? '3008', 10) || 3000,
  DATABASE: {
    URL: process.env.DATABASE_URL,
    TEST_URL: process.env.DATABASE_URL,
  },
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  ACCESS_SECRET_KEY: process.env.ACCESS_SECRET_KEY ?? '',
  REFRESH_SECRET_KEY: process.env.REFRESH_SECRET_KEY ?? ''
});
