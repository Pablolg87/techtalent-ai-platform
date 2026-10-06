import type { QueryResultRow } from "pg";
import { queryDatabase } from "../db/pool.js";
import { createCandidateSchema } from "../schemas/candidate.js";
import type { z } from "zod";

type CreateCandidateData = z.infer<typeof createCandidateSchema>;

export interface CandidateRecord extends QueryResultRow {
  id: string;
  full_name: string;
  email: string;
  location: string | null;
  years_experience: string | null;
  skills: string[];
  created_at: Date;
  updated_at: Date;
}

export async function createCandidate(
  data: CreateCandidateData,
): Promise<CandidateRecord> {
  const result = await queryDatabase<CandidateRecord>(
    `INSERT INTO candidates
       (full_name, email, location, years_experience, skills)
     VALUES ($1, $2, $3, $4, $5::jsonb)
     RETURNING *`,
    [
      data.full_name,
      data.email,
      data.location ?? null,
      data.years_experience ?? null,
      JSON.stringify(data.skills),
    ],
  );
  const candidate = result.rows[0];

  if (!candidate) {
    throw new Error("Candidate insert did not return a record");
  }

  return candidate;
}

export async function listCandidates(): Promise<CandidateRecord[]> {
  const result = await queryDatabase<CandidateRecord>(
    "SELECT * FROM candidates ORDER BY created_at DESC",
  );
  return result.rows;
}

export async function getCandidateById(
  id: string,
): Promise<CandidateRecord | null> {
  const result = await queryDatabase<CandidateRecord>(
    "SELECT * FROM candidates WHERE id = $1",
    [id],
  );
  return result.rows[0] ?? null;
}
