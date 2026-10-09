import { signAccessToken } from "../src/auth/jwt.js";

export const TEST_USER_ID = "22222222-2222-4222-8222-222222222222";
const TEST_JWT_SECRET = "backend-route-tests-only-secret-value";

export async function testBearerToken(): Promise<string> {
  process.env.JWT_SECRET = TEST_JWT_SECRET;
  return signAccessToken(TEST_USER_ID);
}

export function setTestJwtSecret(): void {
  process.env.JWT_SECRET = TEST_JWT_SECRET;
}
