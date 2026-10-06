import { z } from "zod";

export const createCandidateSchema = z.object({
  full_name: z.string().trim().min(1),
  email: z.string().trim().email(),
  location: z.string().trim().optional().nullable(),
  years_experience: z.number().min(0).optional().nullable(),
  skills: z
    .array(z.string().trim().min(1))
    .transform((skills) => [...new Set(skills)]),
});
