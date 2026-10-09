import argon2 from "argon2";
import type { QueryResultRow } from "pg";
import { queryDatabase } from "../db/pool.js";
import type { RegisterInput } from "../types/auth.js";

interface UserRecord extends QueryResultRow {
  id: string;
  email: string;
  full_name: string;
  role: string;
  password_hash: string | null;
  created_at: Date;
  updated_at: Date;
}

interface SafeUserRecord extends QueryResultRow {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export interface SafeUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export function toSafeUser(user: SafeUserRecord): SafeUser {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

export class DuplicateEmailError extends Error {
  constructor() {
    super("An account with this email already exists.");
    this.name = "DuplicateEmailError";
  }
}

export async function registerUser(input: RegisterInput): Promise<SafeUser> {
  const email = input.email.toLowerCase();
  const duplicate = await queryDatabase<{ id: string }>(
    "SELECT id FROM users WHERE lower(email) = $1 LIMIT 1",
    [email],
  );
  if (duplicate.rows.length > 0) {
    throw new DuplicateEmailError();
  }

  const passwordHash = await argon2.hash(input.password, {
    type: argon2.argon2id,
  });

  const result = await queryDatabase<SafeUserRecord>(
    `INSERT INTO users (email, full_name, role, password_hash)
     VALUES ($1, $2, 'recruiter', $3)
     ON CONFLICT (email) DO NOTHING
     RETURNING id, email, full_name, role, created_at, updated_at`,
    [email, input.full_name, passwordHash],
  );
  const user = result.rows[0];
  if (!user) {
    throw new DuplicateEmailError();
  }
  return toSafeUser(user);
}

export async function findUserForLogin(email: string): Promise<UserRecord | null> {
  const result = await queryDatabase<UserRecord>(
    `SELECT id, email, full_name, role, password_hash, created_at, updated_at
     FROM users
     WHERE lower(email) = $1
     LIMIT 1`,
    [email.toLowerCase()],
  );
  return result.rows[0] ?? null;
}

export async function getSafeUserById(userId: string): Promise<SafeUser | null> {
  const result = await queryDatabase<SafeUserRecord>(
    `SELECT id, email, full_name, role, created_at, updated_at
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [userId],
  );
  const user = result.rows[0];
  return user ? toSafeUser(user) : null;
}

export async function verifyUserPassword(
  password: string,
  passwordHash: string | null,
): Promise<boolean> {
  if (!passwordHash) {
    return false;
  }
  return argon2.verify(passwordHash, password);
}
