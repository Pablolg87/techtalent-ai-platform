import type { QueryResultRow } from "pg";
import { queryDatabase } from "../db/pool.js";
import { createJobSchema } from "../schemas/job.js";
import type { z } from "zod";

type CreateJobData = z.infer<typeof createJobSchema>;

export interface JobRecord extends QueryResultRow {
  id: string;
  title: string;
  description: string;
  location: string | null;
  status: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export async function createJob(data: CreateJobData): Promise<JobRecord> {
  const result = await queryDatabase<JobRecord>(
    `INSERT INTO jobs (title, description, location, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.title, data.description, data.location ?? null, data.created_by],
  );
  const job = result.rows[0];

  if (!job) {
    throw new Error("Job insert did not return a record");
  }

  return job;
}

export async function listJobs(): Promise<JobRecord[]> {
  const result = await queryDatabase<JobRecord>(
    "SELECT * FROM jobs ORDER BY created_at DESC",
  );
  return result.rows;
}

export async function getJobById(id: string): Promise<JobRecord | null> {
  const result = await queryDatabase<JobRecord>(
    "SELECT * FROM jobs WHERE id = $1",
    [id],
  );
  return result.rows[0] ?? null;
}
