import express from "express";
import { verifyDatabaseConnection } from "./db/pool.js";
import authRouter from "./routes/auth.js";
import candidatesRouter from "./routes/candidates.js";
import { createHealthRouter, type DatabaseHealthCheck } from "./routes/health.js";
import jobsRouter from "./routes/jobs.js";
import matchingRouter from "./routes/matching.js";

export function createApp(checkDatabase: DatabaseHealthCheck = verifyDatabaseConnection) {
  const app = express();
  app.use(express.json());
  app.use("/health", createHealthRouter(checkDatabase));
  app.use("/auth", authRouter);
  app.use("/jobs", jobsRouter);
  app.use("/candidates", candidatesRouter);
  app.use("/matching", matchingRouter);
  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    const numericStatus =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof error.status === "number" &&
      Number.isInteger(error.status)
        ? error.status
        : 500;

    const status = numericStatus >= 400 && numericStatus < 600 ? numericStatus : 500;
    const message = status < 500 ? "Invalid request" : "Internal server error";

    response.status(status).json({ error: message });
  });
  return app;
}