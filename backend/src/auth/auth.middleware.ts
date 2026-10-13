import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "./jwt.js";

declare global {
  namespace Express {
    interface Request {
      authUser?: { id: string };
    }
  }
}

export async function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const authorization = request.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    response.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = match[1].trim();
  if (!token) {
    response.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    request.authUser = await verifyAccessToken(token);
    next();
  } catch {
    response.status(401).json({ error: "Unauthorized" });
  }
}
