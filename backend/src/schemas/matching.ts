import { z } from "zod";

export const matchingRequestSchema = z.object({
  job_id: z.string().uuid(),
  candidate_id: z.string().uuid(),
});

export const aiMatchingResponseSchema = z.object({
  score: z.number().int().min(0).max(100),
  matched_skills: z.array(z.string()),
  missing_skills: z.array(z.string()),
  explanation: z.string(),
});

export const matchingResponseSchema = aiMatchingResponseSchema.extend({
  job_id: z.string().uuid(),
  candidate_id: z.string().uuid(),
});
