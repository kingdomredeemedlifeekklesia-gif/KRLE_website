"use client";

import { useEffect } from "react";

export default function RecurringChargeRunner() {
  useEffect(() => {
    const run = async () => {
      try {
        await fetch("/api/recurring-runner");
      } catch (error) {
        console.error("Recurring charge runner request failed:", error);
      }
    };

    run();
  }, []);

  return null;
}
