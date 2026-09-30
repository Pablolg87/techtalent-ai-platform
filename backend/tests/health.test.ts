import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";

describe("GET /health", () => {
  it("returns service health when PostgreSQL is reachable", async () => {
    const checkDatabase = vi.fn().mockResolvedValue(undefined);
    const response = await request(createApp(checkDatabase)).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      service: "talentpilot-backend",
      database: "connected",
    });
    expect(checkDatabase).toHaveBeenCalledOnce();
  });

  it("returns 503 without exposing database errors when PostgreSQL is unavailable", async () => {
    const checkDatabase = vi.fn().mockRejectedValue(new Error("connection details must not be exposed"));
    const response = await request(createApp(checkDatabase)).get("/health");

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      status: "error",
      service: "talentpilot-backend",
      database: "unavailable",
    });
    expect(JSON.stringify(response.body)).not.toContain("connection details");
  });
});