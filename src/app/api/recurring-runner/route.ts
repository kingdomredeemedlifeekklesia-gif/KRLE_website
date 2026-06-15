import { runRecurringCharges } from "@/lib/recurring";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await runRecurringCharges();
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Recurring charge runner error:", error);
    return NextResponse.json({ status: "error", message: String(error) }, { status: 500 });
  }
}
