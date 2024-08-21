import { z } from "zod";

const envSchema = z.object({
  API_URL: z.string(),
  INFURA_API: z.string(),
  SEPOLIA_URL: z.string(),
});

export const env: z.infer<typeof envSchema> = envSchema.parse({
  API_URL: import.meta.env.VITE_PUBLIC_API_URL,
  INFURA_API: import.meta.env.VITE_PUBLIC_INFURA_API,
  SEPOLIA_URL: import.meta.env.VITE_PUBLIC_INFURA_URL,
});
