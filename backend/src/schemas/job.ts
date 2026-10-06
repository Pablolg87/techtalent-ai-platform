import { z } from "zod";

export const createJobSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(20),
  location: z.string().trim().optional().nullable(),
  created_by: z.string().uuid(),
});
