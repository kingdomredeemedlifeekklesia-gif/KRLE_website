import { runRecurringCharges } from "@/lib/recurring";

export default async function RecurringChargeRunner() {
  try {
    // Only run recurring charges in production during server startup
    if (process.env.NODE_ENV === "production") {
      await runRecurringCharges().catch((error) => {
        console.error("Recurring charge runner error:", error);
      });
    }
  } catch (error) {
    // Silently fail during build time when database might not be initialized
    if (process.env.NODE_ENV !== "production") {
      console.debug("Recurring charge runner skipped (database may not be ready)", error);
    }
  }
  return null;
}
