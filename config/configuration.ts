export default () => ({
  THROTTLE_TTL: 10000,
  THROTTLE_LIMIT: 5,
  PORT: parseInt(process.env.PORT ?? '3008', 10) || 3000,
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  ACCESS_SECRET_KEY: process.env.ACCESS_SECRET_KEY ?? '',
  REFRESH_SECRET_KEY: process.env.REFRESH_SECRET_KEY ?? '',
  DB: {
    DIALECT: process.env.DB_DIALECT,
    HOST: process.env.DB_HOST,
    PORT: Number(process.env.DB_PORT),
    USER: process.env.DB_USER,
    NAME: process.env.DB_NAME,
    PASS: process.env.DB_PASS,
  },
  S3: {
    BUCKET: process.env.S3_BUCKET,
    REGION: process.env.S3_REGION,
    ENDPOINT: process.env.S3_ENDPOINT,
    ACCESS_ID: process.env.S3_ACCESS_ID,
    ACCESS_SECRET_KEY: process.env.S3_ACCESS_SECRET_KEY,
  }
});
