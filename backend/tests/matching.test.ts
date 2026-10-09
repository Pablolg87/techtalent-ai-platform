import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getJobById, getCandidateById } = vi.hoisted(() => ({
  getJobById: vi.fn(),
  getCandidateById: vi.fn(),
}));

vi.mock("../src/services/jobs.service.js", () => ({
  getJobById,
}));

vi.mock("../src/services/candidates.service.js", () => ({
  getCandidateById,
}));

import { createApp } from "../src/app.js";
import { matchCandidateToJob } from "../src/services/matching.service.js";
import { setTestJwtSecret, testBearerToken } from "./auth-test-helper.js";

const app = createApp(vi.fn().mockResolvedValue(undefined));
const jobId = "11111111-1111-4111-8111-111111111111";
const candidateId = "33333333-3333-4333-8333-333333333333";
const payload = { job_id: jobId, candidate_id: candidateId };
const jobRecord = {
  id: jobId,
  title: "Senior Data Engineer",
  description: "We need Python, SQL, PostgreSQL, Docker and GCP experience.",
};
const candidateRecord = {
  id: candidateId,
  skills: ["Python", "SQL", "Docker"],
};
const aiMatchingResult = {
  score: 60,
  matched_skills: ["Python", "SQL", "Docker"],
  missing_skills: ["PostgreSQL", "GCP"],
  explanation: "Candidate matches 3 of 5 identified job skills.",
};

function stubAiResponse(status: number, body: unknown): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  setTestJwtSecret();
  vi.stubGlobal("fetch", vi.fn());
  getJobById.mockResolvedValue(jobRecord);
  getCandidateById.mockResolvedValue(candidateRecord);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("POST /matching", () => {
  it("returns the matching result and resource IDs", async () => {
    stubAiResponse(200, aiMatchingResult);

    const response = await request(app)
      .post("/matching")
      .set("Authorization", `Bearer ${await testBearerToken()}`)
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      job_id: jobId,
      candidate_id: candidateId,
      ...aiMatchingResult,
    });
    expect(getJobById).toHaveBeenCalledWith(jobId);
    expect(getCandidateById).toHaveBeenCalledWith(candidateId);
    expect(fetch).toHaveBeenCalledWith(
      new URL("http://localhost:8000/match"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          job_title: jobRecord.title,
          job_description: jobRecord.description,
          candidate_skills: candidateRecord.skills,
        }),
      }),
    );
  });

  it("returns 400 for an invalid UUID", async () => {
    const response = await request(app)
      .post("/matching")
      .set("Authorization", `Bearer ${await testBearerToken()}`)
      .send({ ...payload, job_id: "not-a-uuid" });

    expect(response.status).toBe(400);
    expect(getJobById).not.toHaveBeenCalled();
    expect(getCandidateById).not.toHaveBeenCalled();
  });

  it("returns 404 when the job does not exist", async () => {
    getJobById.mockResolvedValue(null);

    const response = await request(app)
      .post("/matching")
      .set("Authorization", `Bearer ${await testBearerToken()}`)
      .send(payload);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Job not found" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns 404 when the candidate does not exist", async () => {
    getCandidateById.mockResolvedValue(null);

    const response = await request(app)
      .post("/matching")
      .set("Authorization", `Bearer ${await testBearerToken()}`)
      .send(payload);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Candidate not found" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns 503 when FastAPI is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connection refused")));

    const response = await request(app)
      .post("/matching")
      .set("Authorization", `Bearer ${await testBearerToken()}`)
      .send(payload);

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      error: "AI matching service unavailable",
    });
    expect(JSON.stringify(response.body)).not.toContain("connection refused");
  });

  it("returns 504 when FastAPI reports a timeout", async () => {
    stubAiResponse(504, { detail: "upstream timeout" });

    const response = await request(app)
      .post("/matching")
      .set("Authorization", `Bearer ${await testBearerToken()}`)
      .send(payload);

    expect(response.status).toBe(504);
    expect(response.body).toEqual({ error: "AI matching service timed out" });
  });

  it("aborts its timed-out FastAPI request with a 504 service error", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_input: RequestInfo | URL, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => {
              reject(new DOMException("The request was aborted", "AbortError"));
            });
          }),
      ),
    );

    const matchingPromise = matchCandidateToJob(jobId, candidateId);
    const rejection = expect(matchingPromise).rejects.toMatchObject({
      status: 504,
      message: "AI matching service timed out",
    });
    await vi.advanceTimersByTimeAsync(10_000);
    await rejection;
  });

  it("returns 502 for a malformed FastAPI response", async () => {
    stubAiResponse(200, { score: "60", matched_skills: [], missing_skills: [] });

    const response = await request(app)
      .post("/matching")
      .set("Authorization", `Bearer ${await testBearerToken()}`)
      .send(payload);

    expect(response.status).toBe(502);
    expect(response.body).toEqual({
      error: "Invalid AI matching service response",
    });
  });

  it("returns 502 when FastAPI rejects the request", async () => {
    stubAiResponse(422, { detail: "invalid request" });

    const response = await request(app)
      .post("/matching")
      .set("Authorization", `Bearer ${await testBearerToken()}`)
      .send(payload);

    expect(response.status).toBe(502);
    expect(response.body).toEqual({
      error: "Invalid AI matching service response",
    });
  });

  it("rejects unauthenticated requests before reading matched records", async () => {
    const response = await request(app).post("/matching").send(payload);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Unauthorized" });
    expect(getJobById).not.toHaveBeenCalled();
    expect(getCandidateById).not.toHaveBeenCalled();
  });
});
