export interface Job {
  id: string;
  title: string;
  description: string;
  location: string | null;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateJobInput {
  title: string;
  description: string;
  location: string | null;
}

export interface Candidate {
  id: string;
  full_name: string;
  email: string;
  location: string | null;
  years_experience: string | number | null;
  skills: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateCandidateInput {
  full_name: string;
  email: string;
  location: string | null;
  years_experience: number | null;
  skills: string[];
}

export interface MatchingInput {
  job_id: string;
  candidate_id: string;
}

export interface MatchingResult extends MatchingInput {
  score: number;
  matched_skills: string[];
  missing_skills: string[];
  explanation: string;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResult {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  user: AuthUser;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let accessToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isAuthUser(value: unknown): value is AuthUser {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.email === "string" &&
    typeof value.full_name === "string" &&
    typeof value.role === "string" &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string" &&
    !("password_hash" in value)
  );
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

function isJob(value: unknown): value is Job {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    isNullableString(value.location) &&
    typeof value.status === "string" &&
    typeof value.created_by === "string" &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string"
  );
}

function isCandidate(value: unknown): value is Candidate {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.full_name === "string" &&
    typeof value.email === "string" &&
    isNullableString(value.location) &&
    (typeof value.years_experience === "string" ||
      typeof value.years_experience === "number" ||
      value.years_experience === null) &&
    Array.isArray(value.skills) &&
    value.skills.every((skill) => typeof skill === "string") &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string"
  );
}

function isMatchingResult(value: unknown): value is MatchingResult {
  return (
    isRecord(value) &&
    isUuid(value.job_id) &&
    isUuid(value.candidate_id) &&
    typeof value.score === "number" &&
    Number.isInteger(value.score) &&
    value.score >= 0 &&
    value.score <= 100 &&
    Array.isArray(value.matched_skills) &&
    value.matched_skills.every((skill) => typeof skill === "string") &&
    Array.isArray(value.missing_skills) &&
    value.missing_skills.every((skill) => typeof skill === "string") &&
    typeof value.explanation === "string"
  );
}

async function requestJson(
  path: string,
  init?: RequestInit,
  authenticated = true,
): Promise<unknown> {
  const requestToken = authenticated ? accessToken : null;
  let response: Response;
  try {
    const headers = new Headers(init?.headers);
    headers.set("Content-Type", "application/json");
    if (requestToken) {
      headers.set("Authorization", `Bearer ${requestToken}`);
    } else {
      headers.delete("Authorization");
    }
    response = await fetch(`/api${path}`, {
      ...init,
      headers,
    });
  } catch {
    throw new ApiError("Could not reach the backend. Check that it is running.", 0);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ApiError(
      response.ok
        ? "The backend returned an unreadable response."
        : `The backend request failed (${response.status}).`,
      response.status,
    );
  }

  if (!response.ok) {
    if (response.status === 401 && authenticated && requestToken === accessToken) {
      accessToken = null;
      unauthorizedHandler?.();
    }
    const message = isRecord(body) && typeof body.error === "string"
      ? body.error
      : `The backend request failed (${response.status}).`;
    throw new ApiError(message, response.status);
  }

  return body;
}

async function requestList<T>(
  path: string,
  isItem: (value: unknown) => value is T,
): Promise<T[]> {
  const body = await requestJson(path);
  if (!Array.isArray(body) || !body.every(isItem)) {
    throw new ApiError("The backend returned data in an unexpected format.", 200);
  }
  return body;
}

async function requestItem<T>(
  path: string,
  input: object,
  isItem: (value: unknown) => value is T,
  authenticated = true,
): Promise<T> {
  const body = await requestJson(path, {
    method: "POST",
    body: JSON.stringify(input),
  }, authenticated);
  if (!isItem(body)) {
    throw new ApiError("The backend returned data in an unexpected format.", 200);
  }
  return body;
}

export const api = {
  register: async (input: { full_name: string; email: string; password: string }) => {
    const body = await requestItem(
      "/auth/register",
      input,
      (value): value is { user: AuthUser } =>
        isRecord(value) && isAuthUser(value.user),
      false,
    );
    return body.user;
  },
  login: async (input: { email: string; password: string }): Promise<LoginResult> => {
    const body = await requestItem(
      "/auth/login",
      input,
      (value): value is LoginResult =>
        isRecord(value) &&
        typeof value.access_token === "string" &&
        value.access_token.length > 0 &&
        value.token_type === "Bearer" &&
        value.expires_in === 900 &&
        isAuthUser(value.user),
      false,
    );
    return body;
  },
  currentUser: async (): Promise<AuthUser> => {
    const body = await requestJson("/auth/me");
    if (!isRecord(body) || !isAuthUser(body.user)) {
      throw new ApiError("The backend returned data in an unexpected format.", 200);
    }
    return body.user;
  },
  listJobs: () => requestList("/jobs", isJob),
  createJob: (input: CreateJobInput) => requestItem("/jobs", input, isJob),
  listCandidates: () => requestList("/candidates", isCandidate),
  createCandidate: (input: CreateCandidateInput) =>
    requestItem("/candidates", input, isCandidate),
  calculateMatch: async (input: MatchingInput) => {
    const result = await requestItem("/matching", input, isMatchingResult);
    if (result.job_id !== input.job_id || result.candidate_id !== input.candidate_id) {
      throw new ApiError("The backend returned a result for a different match request.", 200);
    }
    return result;
  },
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return error.message;
    if (error.message === "Internal server error") {
      return "The backend could not complete the request. Please try again.";
    }
    return error.message;
  }
  return "Something went wrong. Please try again.";
}
