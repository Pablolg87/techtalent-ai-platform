import type { registerSchema } from "../schemas/auth.js";
import type { z } from "zod";

export type RegisterInput = z.infer<typeof registerSchema>;

export interface LoginInput {
  email: string;
  password: string;
}
