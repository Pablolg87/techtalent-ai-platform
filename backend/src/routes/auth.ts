import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { signAccessToken, ACCESS_TOKEN_EXPIRES_IN_SECONDS } from "../auth/jwt.js";
import { loginSchema, registerSchema } from "../schemas/auth.js";
import {
  DuplicateEmailError,
  findUserForLogin,
  getSafeUserById,
  registerUser,
  verifyUserPassword,
} from "../services/auth.service.js";

const router = Router();
const invalidCredentials = { error: "Invalid email or password." };

router.post("/register", async (request, response) => {
  const parsed = registerSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid registration data." });
    return;
  }

  try {
    const user = await registerUser(parsed.data);
    response.status(201).json({ user });
  } catch (error) {
    if (error instanceof DuplicateEmailError) {
      response.status(409).json({ error: error.message });
      return;
    }
    response.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (request, response) => {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid login data." });
    return;
  }

  try {
    const user = await findUserForLogin(parsed.data.email);
    const passwordValid = await verifyUserPassword(
      parsed.data.password,
      user?.password_hash ?? null,
    );
    if (!user || !passwordValid) {
      response.status(401).json(invalidCredentials);
      return;
    }

    const accessToken = await signAccessToken(user.id);
    response.status(200).json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch {
    response.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me", requireAuth, async (request, response) => {
  const userId = request.authUser?.id;
  if (!userId) {
    response.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const user = await getSafeUserById(userId);
    if (!user) {
      response.status(401).json({ error: "Unauthorized" });
      return;
    }
    response.status(200).json({ user });
  } catch {
    response.status(500).json({ error: "Internal server error" });
  }
});

export default router;
