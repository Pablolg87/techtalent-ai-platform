import { Pool } from "pg";

let pool: Pool | undefined;

function getPool(): Pool {
  if (pool) {
    return pool;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to connect to PostgreSQL");
  }

  pool = new Pool({ connectionString });
  return pool;
}

export async function verifyDatabaseConnection(): Promise<void> {
  await getPool().query("SELECT 1");
}

export async function closeDatabasePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}