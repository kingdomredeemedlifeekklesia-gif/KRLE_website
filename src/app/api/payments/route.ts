import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const transactions = await prisma.paymentTransaction.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Payments GET error:", error);
    return NextResponse.json({ error: "Failed to load payment transactions." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      donor,
      email,
      amount,
      currency = "GHS",
      purpose,
      type,
      status = "Completed",
      provider,
      note,
      details,
    } = body;

    if (!amount || !purpose || !type) {
      return NextResponse.json(
        { error: "Amount, purpose, and type are required." },
        { status: 400 }
      );
    }

    const transaction = await prisma.paymentTransaction.create({
      data: {
        donor: donor || null,
        email: email || null,
        amount: Number(amount),
        currency,
        purpose,
        type,
        status,
        provider: provider || null,
        note: note || null,
        details: details || null,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Payments POST error:", error);
    return NextResponse.json({ error: "Failed to save payment transaction." }, { status: 500 });
  }
}
