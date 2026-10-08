import { Router } from "express";
import { matchingRequestSchema } from "../schemas/matching.js";
import {
  matchCandidateToJob,
  MatchingServiceError,
} from "../services/matching.service.js";

const router = Router();

router.post("/", async (request, response) => {
  const parsed = matchingRequestSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid matching request" });
    return;
  }

  try {
    response
      .status(200)
      .json(
        await matchCandidateToJob(
          parsed.data.job_id,
          parsed.data.candidate_id,
        ),
      );
  } catch (error) {
    if (error instanceof MatchingServiceError) {
      response.status(error.status).json({ error: error.message });
      return;
    }
    response.status(500).json({ error: "Internal server error" });
  }
});

export default router;
