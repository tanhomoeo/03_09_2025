import { z } from 'zod';

const envSchema = z.object({
  GOOGLE_API_KEY: z.string().min(1, { message: 'Missing Google API Key' }),
});

export const env = envSchema.parse(process.env);
