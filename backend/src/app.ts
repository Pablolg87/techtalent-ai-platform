import express from "express";
import { verifyDatabaseConnection } from "./db/pool.js";
import candidatesRouter from "./routes/candidates.js";
import { createHealthRouter, type DatabaseHealthCheck } from "./routes/health.js";
import jobsRouter from "./routes/jobs.js";

export function createApp(checkDatabase: DatabaseHealthCheck = verifyDatabaseConnection) {
  const app = express();
  app.use(express.json());
  app.use("/health", createHealthRouter(checkDatabase));
  app.use("/jobs", jobsRouter);
  app.use("/candidates", candidatesRouter);
  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof error.status === "number" &&
      error.status >= 400 &&
      error.status < 500
        ? 400
        : 500;
    response
      .status(status)
      .json({ error: status === 400 ? "Invalid request body" : "Internal server error" });
  });
  return app;
}