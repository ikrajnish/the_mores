
import { z } from 'zod';

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL").optional().default("http://localhost:3000"),
  JWT_SECRET: z.string().min(8, "JWT_SECRET must be at least 8 characters long").optional(), // Optional for now to not break dev if unset, but should be required in prod
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Validate process.env
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
