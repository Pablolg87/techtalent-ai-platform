import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../auth/auth.middleware.js";
import { createCandidateSchema } from "../schemas/candidate.js";
import {
  createCandidate,
  getCandidateById,
  listCandidates,
} from "../services/candidates.service.js";

function hasPostgresCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

const candidateIdSchema = z.string().uuid();
const router = Router();

router.use(requireAuth);

router.post("/", async (request, response) => {
  const parsed = createCandidateSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid candidate data" });
    return;
  }

  try {
    const candidate = await createCandidate(parsed.data);
    response.status(201).json(candidate);
  } catch (error) {
    if (hasPostgresCode(error, "23505")) {
      response.status(409).json({ error: "A candidate with this email already exists" });
      return;
    }
    response.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (_request, response) => {
  try {
    response.status(200).json(await listCandidates());
  } catch {
    response.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (request, response) => {
  const parsedId = candidateIdSchema.safeParse(request.params.id);
  if (!parsedId.success) {
    response.status(400).json({ error: "Invalid candidate ID" });
    return;
  }

  try {
    const candidate = await getCandidateById(parsedId.data);
    if (!candidate) {
      response.status(404).json({ error: "Candidate not found" });
      return;
    }
    response.status(200).json(candidate);
  } catch {
    response.status(500).json({ error: "Internal server error" });
  }
});

export default router;
