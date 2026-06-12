import cron from "node-cron";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { runRecurringCharges } from "../src/lib/recurring";

function loadDotenv(filePath: string) {
  if (!existsSync(filePath)) {
    return;
  }

  const contents = readFileSync(filePath, "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const [rawKey, ...rawValue] = trimmed.split("=");
    const key = rawKey.trim();
    let value = rawValue.join("=").trim();

    if (value.startsWith("\"") && value.endsWith("\"")) {
      value = value.slice(1, -1);
    }
    if (value.startsWith("'" ) && value.endsWith("'")) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function loadEnvFiles() {
  const root = process.cwd();
  loadDotenv(path.join(root, ".env.local"));
  loadDotenv(path.join(root, ".env"));
}

async function runJob() {
  try {
    console.log(new Date().toISOString(), "Starting recurring charge run...");
    const results = await runRecurringCharges();
    if (results.length === 0) {
      console.log(new Date().toISOString(), "No due recurring subscriptions to charge.");
      return;
    }

    for (const result of results) {
      if (result.success) {
        console.log(new Date().toISOString(), `Charged subscription ${result.id} successfully: ${result.reference}`);
      } else {
        console.warn(new Date().toISOString(), `Recurring charge failed for ${result.id}: ${result.error}`);
      }
    }
  } catch (error) {
    console.error(new Date().toISOString(), "Recurring charge job failed:", error);
  }
}

loadEnvFiles();

console.log("Recurring scheduler started. Charging due subscriptions every 30 minutes.");
cron.schedule("*/30 * * * *", async () => {
  await runJob();
});

// Run immediately after startup as well
runJob().catch((error) => {
  console.error("Initial recurring charge run failed:", error);
});
