import { runRecurringCharges } from "@/lib/recurring";

export default async function RecurringChargeRunner() {
  try {
    // Only run in development or if database is ready
    if (process.env.NODE_ENV === "production") {
      await runRecurringCharges();
    }
  } catch (error) {
    // Silently fail during build time when database might not be initialized
    if (process.env.NODE_ENV !== "production") {
      console.debug("Recurring charge runner skipped (database may not be ready)", error);
    }
  }
  return null;
}
