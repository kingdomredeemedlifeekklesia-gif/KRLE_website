import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json({ error: "Reference is required" }, { status: 400 });
    }

    // Check if transaction already exists
    const existingTransaction = await prisma.paymentTransaction.findFirst({
      where: { details: { contains: reference } },
    });

    if (existingTransaction) {
      return NextResponse.json({ success: true, message: "Transaction already recorded" });
    }

    // Verify with Paystack
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error("Paystack secret key not configured");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    });

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok || verifyData.status !== true || verifyData.data.status !== "success") {
      console.error("Paystack verification failed:", verifyData);
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // Extract transaction details
    const { data } = verifyData;
    const recurringMetadata = data.metadata?.custom_fields?.find((f: any) => f.variable_name === "recurring")?.value;
    const recurringLabel = recurringMetadata ? String(recurringMetadata) : "One-time";
    const recurringAmount = data.amount / 100; // Convert from kobo to GHS
    const recurringPurpose = data.metadata?.custom_fields?.find((f: any) => f.variable_name === "purpose")?.value || "Donation";

    const transaction = {
      donor: data.metadata?.custom_fields?.find((f: any) => f.variable_name === "name")?.value || null,
      email: data.customer.email,
      amount: recurringAmount,
      currency: data.currency,
      purpose: recurringPurpose,
      type: data.reference.includes("deposit") ? "deposit" : "donation",
      status: "Completed",
      provider: data.channel === "card" ? "Paystack Card" : `${data.authorization?.bank || "Mobile Money"}`,
      note: `Verified via Paystack - ${reference}${recurringMetadata ? `; ${recurringMetadata}` : ""}`,
      details: `Reference: ${reference}; Gateway: Paystack; Recurring: ${recurringLabel}`,
    };

    // Save recurring subscription when Covenant Seed is authorized for monthly deduction
    if (
      recurringMetadata === "Monthly Covenant Deduction" &&
      data.authorization?.authorization_code &&
      data.authorization?.reusable
    ) {
      const nextChargeAt = new Date();
      nextChargeAt.setMonth(nextChargeAt.getMonth() + 1);

      await prisma.recurringSubscription.upsert({
        where: { authorizationCode: data.authorization.authorization_code },
        update: {
          donor: transaction.donor,
          email: transaction.email,
          phone: data.customer.phone,
          customerCode: data.customer?.customer_code || null,
          cardBrand: data.authorization.brand || null,
          last4: data.authorization.last4 || null,
          expMonth: Number(data.authorization.exp_month) || null,
          expYear: Number(data.authorization.exp_year) || null,
          amount: recurringAmount,
          purpose: recurringPurpose,
          active: true,
          nextChargeAt,
          note: "Covenant Seed recurring subscription",
        },
        create: {
          donor: transaction.donor,
          email: transaction.email,
          phone: data.customer.phone,
          authorizationCode: data.authorization.authorization_code,
          customerCode: data.customer?.customer_code || null,
          cardBrand: data.authorization.brand || null,
          last4: data.authorization.last4 || null,
          expMonth: Number(data.authorization.exp_month) || null,
          expYear: Number(data.authorization.exp_year) || null,
          amount: recurringAmount,
          purpose: recurringPurpose,
          active: true,
          nextChargeAt,
          note: "Covenant Seed recurring subscription",
        },
      });
    }

    // Save to database
    await prisma.paymentTransaction.create({
      data: transaction,
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}