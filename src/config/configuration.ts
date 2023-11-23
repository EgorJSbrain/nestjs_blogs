export default () => ({
  port: parseInt(process.env.PORT ?? '', 10) || 3000,
  smtpUser: process.env.SMTP_USER ?? '',
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT ?? '', 10) || 5432
  }
});