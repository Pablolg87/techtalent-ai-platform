import express from "express";
import { verifyDatabaseConnection } from "./db/pool.js";
import { createHealthRouter, type DatabaseHealthCheck } from "./routes/health.js";

export function createApp(checkDatabase: DatabaseHealthCheck = verifyDatabaseConnection) {
  const app = express();
  app.use("/health", createHealthRouter(checkDatabase));
  return app;
}