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
  created_by: string;
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

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
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

async function requestJson(path: string, init?: RequestInit): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
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
): Promise<T> {
  const body = await requestJson(path, {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!isItem(body)) {
    throw new ApiError("The backend returned data in an unexpected format.", 200);
  }
  return body;
}

export const api = {
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
