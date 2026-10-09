import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../auth/auth.middleware.js";
import { createJob, getJobById, listJobs } from "../services/jobs.service.js";
import { createJobSchema } from "../schemas/job.js";

function hasPostgresCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

const jobIdSchema = z.string().uuid();
const router = Router();

router.use(requireAuth);

router.post("/", async (request, response) => {
  const createdBy = request.authUser?.id;
  if (!createdBy) {
    response.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = createJobSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid job data" });
    return;
  }

  try {
    const job = await createJob(parsed.data, createdBy);
    response.status(201).json(job);
  } catch (error) {
    if (hasPostgresCode(error, "23503")) {
      response.status(400).json({ error: "Invalid job creator" });
      return;
    }
    response.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (_request, response) => {
  try {
    response.status(200).json(await listJobs());
  } catch {
    response.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (request, response) => {
  const parsedId = jobIdSchema.safeParse(request.params.id);
  if (!parsedId.success) {
    response.status(400).json({ error: "Invalid job ID" });
    return;
  }

  try {
    const job = await getJobById(parsedId.data);
    if (!job) {
      response.status(404).json({ error: "Job not found" });
      return;
    }
    response.status(200).json(job);
  } catch {
    response.status(500).json({ error: "Internal server error" });
  }
});

export default router;
