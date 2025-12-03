import config from 'dotenv';
import z from 'zod';

config.config({
  path: '.env',
});

const configSchema = z.object({
  APP_NAME: z.string(),
  DATABASE_URL: z.string(),
  JWT_ACCESS_TOKEN_SECRET: z.string(),
  JWT_ACCESS_TOKEN_EXPIRATION_TIME: z.string(),
  JWT_REFRESH_TOKEN_SECRET: z.string(),
  JWT_REFRESH_TOKEN_EXPIRATION_TIME: z.string(),
  SECRET_API_KEY: z.string(),
  OTP_EXPIRES_IN: z.string(),
  RESEND_API_KEY: z.string(),
});

const configServer = configSchema.safeParse(process.env);
if (!configServer.success) {
  console.error('❌ Invalid environment variables:', configServer.error);
  process.exit(1);
}

const envConfig = configServer.data;
export default envConfig;
