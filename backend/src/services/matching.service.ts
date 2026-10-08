import { getCandidateById } from "./candidates.service.js";
import { getJobById } from "./jobs.service.js";
import {
  aiMatchingResponseSchema,
  matchingResponseSchema,
} from "../schemas/matching.js";

const AI_SERVICE_TIMEOUT_MS = 10_000;
const DEFAULT_AI_SERVICE_URL = "http://localhost:8000";

type MatchingServiceErrorStatus = 404 | 502 | 503 | 504;

export class MatchingServiceError extends Error {
  constructor(
    message: string,
    readonly status: MatchingServiceErrorStatus,
  ) {
    super(message);
    this.name = "MatchingServiceError";
  }
}

export async function matchCandidateToJob(
  jobId: string,
  candidateId: string,
) {
  const [job, candidate] = await Promise.all([
    getJobById(jobId),
    getCandidateById(candidateId),
  ]);

  if (!job) {
    throw new MatchingServiceError("Job not found", 404);
  }
  if (!candidate) {
    throw new MatchingServiceError("Candidate not found", 404);
  }

  const configuredUrl = process.env.AI_SERVICE_URL || DEFAULT_AI_SERVICE_URL;
  let matchUrl: URL;
  try {
    matchUrl = new URL("/match", configuredUrl);
  } catch {
    throw new MatchingServiceError("AI matching service unavailable", 503);
  }

  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, AI_SERVICE_TIMEOUT_MS);

  try {
    let aiResponse: Response;
    try {
      aiResponse = await fetch(matchUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_title: job.title,
          job_description: job.description,
          candidate_skills: candidate.skills,
        }),
        signal: controller.signal,
      });
    } catch {
      if (timedOut) {
        throw new MatchingServiceError("AI matching service timed out", 504);
      }
      throw new MatchingServiceError("AI matching service unavailable", 503);
    }

    if (!aiResponse.ok) {
      if (aiResponse.status === 408 || aiResponse.status === 504) {
        throw new MatchingServiceError("AI matching service timed out", 504);
      }
      if (aiResponse.status >= 500 || aiResponse.status === 429) {
        throw new MatchingServiceError("AI matching service unavailable", 503);
      }
      throw new MatchingServiceError("Invalid AI matching service response", 502);
    }

    let responseBody: unknown;
    try {
      responseBody = await aiResponse.json();
    } catch {
      if (timedOut) {
        throw new MatchingServiceError("AI matching service timed out", 504);
      }
      throw new MatchingServiceError("Invalid AI matching service response", 502);
    }

    const parsedResponse = aiMatchingResponseSchema.safeParse(responseBody);
    if (!parsedResponse.success) {
      throw new MatchingServiceError("Invalid AI matching service response", 502);
    }

    return matchingResponseSchema.parse({
      ...parsedResponse.data,
      job_id: job.id,
      candidate_id: candidate.id,
    });
  } finally {
    clearTimeout(timeout);
  }
}
