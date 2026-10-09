import "./config/env.js";
import { validateEnvironment } from "./config/env.js";
import { createApp } from "./app.js";

validateEnvironment();

const port = Number.parseInt(process.env.BACKEND_PORT ?? "4000", 10);
const app = createApp();

app.listen(port, () => {
  console.log(`TalentPilot backend listening on port ${port}`);
});