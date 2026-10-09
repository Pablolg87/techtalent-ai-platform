import { resolve } from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: resolve(process.cwd(), "../.env") });

const environmentSchema = z.object({
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters."),
});

export function validateEnvironment(): void {
  const parsed = environmentSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Invalid backend environment: ${parsed.error.issues
        .map((issue) => issue.message)
        .join(" ")}`,
    );
  }
}