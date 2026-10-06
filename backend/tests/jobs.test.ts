import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createJob, listJobs, getJobById } = vi.hoisted(() => ({
  createJob: vi.fn(),
  listJobs: vi.fn(),
  getJobById: vi.fn(),
}));

vi.mock("../src/services/jobs.service.js", () => ({
  createJob,
  listJobs,
  getJobById,
}));

import { createApp } from "../src/app.js";

const app = createApp(vi.fn().mockResolvedValue(undefined));
const jobId = "11111111-1111-4111-8111-111111111111";
const validJob = {
  title: "Senior Engineer",
  description: "Build and maintain reliable backend systems.",
  location: "Remote",
  created_by: "22222222-2222-4222-8222-222222222222",
};
const jobRecord = {
  id: jobId,
  ...validJob,
  location: "Remote",
  status: "open",
  created_at: new Date("2026-01-01T00:00:00.000Z"),
  updated_at: new Date("2026-01-01T00:00:00.000Z"),
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("Jobs endpoints", () => {
  it("creates a job and returns 201", async () => {
    createJob.mockResolvedValue(jobRecord);

    const response = await request(app).post("/jobs").send(validJob);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ id: jobId, title: validJob.title });
    expect(createJob).toHaveBeenCalledWith(validJob);
  });

  it("returns 400 for an invalid job request", async () => {
    const response = await request(app).post("/jobs").send({ ...validJob, title: " " });

    expect(response.status).toBe(400);
    expect(createJob).not.toHaveBeenCalled();
  });

  it("lists jobs and returns 200", async () => {
    listJobs.mockResolvedValue([jobRecord]);

    const response = await request(app).get("/jobs");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe(jobId);
  });

  it("returns an existing job by ID", async () => {
    getJobById.mockResolvedValue(jobRecord);

    const response = await request(app).get(`/jobs/${jobId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(jobId);
    expect(getJobById).toHaveBeenCalledWith(jobId);
  });

  it("returns 400 for a malformed job UUID", async () => {
    const response = await request(app).get("/jobs/not-a-uuid");

    expect(response.status).toBe(400);
    expect(getJobById).not.toHaveBeenCalled();
  });

  it("returns 404 for a valid but nonexistent job ID", async () => {
    getJobById.mockResolvedValue(null);

    const response = await request(app).get(`/jobs/${jobId}`);

    expect(response.status).toBe(404);
  });

  it("maps a PostgreSQL foreign-key violation to 400 without exposing details", async () => {
    createJob.mockRejectedValue({
      code: "23503",
      detail: "internal database detail",
    });

    const response = await request(app).post("/jobs").send(validJob);

    expect(response.status).toBe(400);
    expect(JSON.stringify(response.body)).not.toContain("internal database detail");
  });
});
