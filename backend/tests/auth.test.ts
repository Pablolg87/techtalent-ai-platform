import argon2 from "argon2";
import request from "supertest";
import { SignJWT } from "jose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { queryDatabase } = vi.hoisted(() => ({
  queryDatabase: vi.fn(),
}));

vi.mock("../src/db/pool.js", () => ({
  queryDatabase,
  verifyDatabaseConnection: vi.fn(),
  closeDatabasePool: vi.fn(),
}));

import { createApp } from "../src/app.js";

const testSecret = "test-only-secret-that-is-at-least-32-characters";
const app = createApp(vi.fn().mockResolvedValue(undefined));
const userId = "11111111-1111-4111-8111-111111111111";
const password = "a-long-test-password";
const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
const createdAt = new Date("2026-01-01T00:00:00.000Z");
const updatedAt = new Date("2026-01-02T00:00:00.000Z");

function userRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: userId,
    email: "person@example.test",
    full_name: "Test Recruiter",
    role: "recruiter",
    password_hash: passwordHash,
    created_at: createdAt,
    updated_at: updatedAt,
    ...overrides,
  };
}

function rows<T>(...items: T[]) {
  return { rows: items };
}

beforeEach(() => {
  process.env.JWT_SECRET = testSecret;
  queryDatabase.mockReset();
});

describe("Authentication endpoints", () => {
  it("registers with a normalized email, hashed password, and fixed recruiter role", async () => {
    queryDatabase
      .mockResolvedValueOnce(rows())
      .mockImplementationOnce(async (_query: string, values: unknown[]) => {
        const [email, fullName, hash] = values as [string, string, string];
        return rows(userRecord({
          email,
          full_name: fullName,
          password_hash: hash,
        }));
      });

    const response = await request(app).post("/auth/register").send({
      email: "  Person@Example.Test ",
      full_name: "  Test Recruiter  ",
      password,
      role: "admin",
    });

    expect(response.status).toBe(201);
    expect(response.body.user).toMatchObject({
      id: userId,
      email: "person@example.test",
      full_name: "Test Recruiter",
      role: "recruiter",
    });
    expect(response.body.user).not.toHaveProperty("password_hash");
    const insertValues = queryDatabase.mock.calls[1]?.[1] as unknown[];
    const storedHash = insertValues[2] as string;
    expect(storedHash).not.toBe(password);
    expect(await argon2.verify(storedHash, password)).toBe(true);
    expect(queryDatabase.mock.calls[1]?.[0]).toContain("'recruiter'");
  });

  it("rejects invalid registration input", async () => {
    const response = await request(app).post("/auth/register").send({
      email: "not-an-email",
      full_name: " ",
      password: "short",
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid registration data." });
    expect(queryDatabase).not.toHaveBeenCalled();
  });

  it("returns 409 for an existing normalized email", async () => {
    queryDatabase.mockResolvedValueOnce(rows({ id: userId }));

    const response = await request(app).post("/auth/register").send({
      email: "PERSON@example.test",
      full_name: "Another Person",
      password,
    });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: "An account with this email already exists.",
    });
    expect(queryDatabase).toHaveBeenCalledOnce();
  });

  it("returns a short-lived signed token and safe user on successful login", async () => {
    queryDatabase.mockResolvedValueOnce(rows(userRecord()));

    const response = await request(app).post("/auth/login").send({
      email: " PERSON@EXAMPLE.TEST ",
      password,
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      token_type: "Bearer",
      expires_in: 900,
      user: {
        id: userId,
        email: "person@example.test",
        role: "recruiter",
      },
    });
    expect(response.body.user).not.toHaveProperty("password_hash");
    const [protectedHeader, payload] = response.body.access_token
      .split(".")
      .slice(0, 2)
      .map((part: string) => JSON.parse(Buffer.from(part, "base64url").toString("utf8")));
    expect(protectedHeader.alg).toBe("HS256");
    expect(Object.keys(payload).sort()).toEqual(["aud", "exp", "iat", "iss", "sub"]);
    expect(payload.sub).toBe(userId);
  });

  it("returns the same generic error for wrong password and unknown email", async () => {
    queryDatabase
      .mockResolvedValueOnce(rows(userRecord()))
      .mockResolvedValueOnce(rows());

    const wrongPassword = await request(app).post("/auth/login").send({
      email: "person@example.test",
      password: "incorrect-long-password",
    });
    const unknownEmail = await request(app).post("/auth/login").send({
      email: "unknown@example.test",
      password,
    });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body).toEqual({ error: "Invalid email or password." });
    expect(unknownEmail.body).toEqual(wrongPassword.body);
  });

  it("returns the current safe user for a valid Bearer token", async () => {
    queryDatabase.mockResolvedValueOnce(rows(userRecord()));
    const login = await request(app).post("/auth/login").send({
      email: "person@example.test",
      password,
    });
    queryDatabase.mockResolvedValueOnce(rows(userRecord({ password_hash: null })));

    const response = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${login.body.access_token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({
      id: userId,
      email: "person@example.test",
      full_name: "Test Recruiter",
      role: "recruiter",
    });
    expect(response.body.user).not.toHaveProperty("password_hash");
  });

  it("rejects missing, malformed, and expired Bearer tokens", async () => {
    const missing = await request(app).get("/auth/me");
    const malformed = await request(app)
      .get("/auth/me")
      .set("Authorization", "Bearer not-a-jwt");
    const now = Math.floor(Date.now() / 1000);
    const expiredToken = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setSubject(userId)
      .setIssuer("talentpilot-api")
      .setAudience("talentpilot-client")
      .setIssuedAt(now - 60)
      .setExpirationTime(now - 30)
      .sign(new TextEncoder().encode(testSecret));
    const expired = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${expiredToken}`);

    for (const response of [missing, malformed, expired]) {
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Unauthorized" });
    }
    expect(queryDatabase).not.toHaveBeenCalled();
  });
});
