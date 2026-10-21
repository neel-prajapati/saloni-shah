import "dotenv/config";
import { defineCliConfig } from "sanity/cli";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
if (!projectId) {
  throw new Error("Set SANITY_STUDIO_PROJECT_ID in studio/.env before running the Sanity CLI.");
}

export default defineCliConfig({
  api: {
    projectId,
    dataset: process.env.SANITY_STUDIO_DATASET || "production",
  },
  deployment: {
    appId: "lsfrdxif8qtbmzk4p0cqzh3c",
  },
});
