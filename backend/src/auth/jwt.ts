import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { z } from "zod";

export const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 15 * 60;

const issuer = "talentpilot-api";
const audience = "talentpilot-client";
const subjectSchema = z.string().uuid();

export interface AuthenticatedUser {
  id: string;
}

function getSigningKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function signAccessToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(userId)
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_EXPIRES_IN_SECONDS}s`)
    .sign(getSigningKey());
}

export async function verifyAccessToken(token: string): Promise<AuthenticatedUser> {
  const { payload }: { payload: JWTPayload } = await jwtVerify(token, getSigningKey(), {
    algorithms: ["HS256"],
    issuer,
    audience,
  });
  const parsedSubject = subjectSchema.safeParse(payload.sub);
  if (!parsedSubject.success) {
    throw new Error("Invalid access token subject.");
  }
  return { id: parsedSubject.data };
}
