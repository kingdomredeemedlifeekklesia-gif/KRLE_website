import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runRecurringCharges } from "@/lib/recurring";

export async function GET() {
  try {
    const subscriptions = await prisma.recurringSubscription.findMany({
      orderBy: { nextChargeAt: "asc" },
    });
    return NextResponse.json({ success: true, subscriptions });
  } catch (error) {
    console.error("Recurring subscriptions GET error:", error);

    const errorCode = (error as any)?.code;
    const errorMessage = (error as any)?.message;
    if (errorCode === "P2021" || typeof errorMessage === "string" && errorMessage.toLowerCase().includes("no such table")) {
      return NextResponse.json({ success: true, subscriptions: [] });
    }

    return NextResponse.json({ error: "Failed to load recurring subscriptions." }, { status: 500 });
  }
}

export async function POST() {
  try {
    const results = await runRecurringCharges();
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Recurring charge POST error:", error);
    return NextResponse.json({ error: (error as any)?.message || "Failed to charge recurring subscriptions." }, { status: 500 });
  }
}
