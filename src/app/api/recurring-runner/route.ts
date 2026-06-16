import { runRecurringCharges } from "@/lib/recurring";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await runRecurringCharges();
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Recurring charge runner error:", error);
    const msg = String(error || "");
    // If DB is unreachable during local development, return a non-error response
    // so automated background checks don't surface as client-side 500s.
    if (msg.includes("Can't reach database server") || msg.includes("PrismaClientInitializationError")) {
      return NextResponse.json({ status: "skipped", message: "Database unreachable" }, { status: 200 });
    }
    return NextResponse.json({ status: "error", message: msg }, { status: 500 });
  }
}
