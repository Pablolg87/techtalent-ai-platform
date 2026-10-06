import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createCandidate, listCandidates, getCandidateById } = vi.hoisted(() => ({
  createCandidate: vi.fn(),
  listCandidates: vi.fn(),
  getCandidateById: vi.fn(),
}));

vi.mock("../src/services/candidates.service.js", () => ({
  createCandidate,
  listCandidates,
  getCandidateById,
}));

import { createApp } from "../src/app.js";

const app = createApp(vi.fn().mockResolvedValue(undefined));
const candidateId = "33333333-3333-4333-8333-333333333333";
const validCandidate = {
  full_name: "Taylor Candidate",
  email: "taylor@example.com",
  location: "Remote",
  years_experience: 5,
  skills: ["TypeScript", "PostgreSQL"],
};
const candidateRecord = {
  id: candidateId,
  ...validCandidate,
  years_experience: "5.00",
  created_at: new Date("2026-01-01T00:00:00.000Z"),
  updated_at: new Date("2026-01-01T00:00:00.000Z"),
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("Candidates endpoints", () => {
  it("creates a candidate and returns 201", async () => {
    createCandidate.mockResolvedValue(candidateRecord);

    const response = await request(app).post("/candidates").send(validCandidate);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: candidateId,
      full_name: validCandidate.full_name,
    });
    expect(createCandidate).toHaveBeenCalledWith(validCandidate);
  });

  it("returns 400 for invalid candidate input", async () => {
    const response = await request(app)
      .post("/candidates")
      .send({ ...validCandidate, email: "not-an-email" });

    expect(response.status).toBe(400);
    expect(createCandidate).not.toHaveBeenCalled();
  });

  it("maps a PostgreSQL unique violation to 409 without exposing details", async () => {
    createCandidate.mockRejectedValue({
      code: "23505",
      detail: "internal database detail",
    });

    const response = await request(app).post("/candidates").send(validCandidate);

    expect(response.status).toBe(409);
    expect(JSON.stringify(response.body)).not.toContain("internal database detail");
  });

  it("lists candidates and returns 200", async () => {
    listCandidates.mockResolvedValue([candidateRecord]);

    const response = await request(app).get("/candidates");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe(candidateId);
  });

  it("returns an existing candidate by ID", async () => {
    getCandidateById.mockResolvedValue(candidateRecord);

    const response = await request(app).get(`/candidates/${candidateId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(candidateId);
    expect(getCandidateById).toHaveBeenCalledWith(candidateId);
  });

  it("returns 400 for a malformed candidate UUID", async () => {
    const response = await request(app).get("/candidates/not-a-uuid");

    expect(response.status).toBe(400);
    expect(getCandidateById).not.toHaveBeenCalled();
  });

  it("returns 404 for a valid but nonexistent candidate ID", async () => {
    getCandidateById.mockResolvedValue(null);

    const response = await request(app).get(`/candidates/${candidateId}`);

    expect(response.status).toBe(404);
  });
});
