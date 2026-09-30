import "./config/env.js";
import { createApp } from "./app.js";

const port = Number.parseInt(process.env.BACKEND_PORT ?? "4000", 10);
const app = createApp();

app.listen(port, () => {
  console.log(`TalentPilot backend listening on port ${port}`);
});