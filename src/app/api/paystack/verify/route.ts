import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit, forbiddenResponse, isSameOriginRequest, tooManyRequestsResponse } from "@/lib/request-security";

type PaystackCustomField = {
  variable_name?: string;
  value?: unknown;
};

function getCustomField(data: any, name: string) {
  const fields = data?.metadata?.custom_fields;

  if (!Array.isArray(fields)) {
    return null;
  }

  const value = fields.find((field: PaystackCustomField) => field.variable_name === name)?.value;
  return value == null ? null : String(value);
}

function normalizeProvider(data: any) {
  if (data?.channel === "card") {
    return "Paystack Card";
  }

  return data?.authorization?.bank || data?.channel || "Paystack";
}

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return forbiddenResponse("Forbidden");
    }

    const rateLimit = enforceRateLimit(request, { limit: 10, windowMs: 60_000 });
    if (!rateLimit.ok) {
      return tooManyRequestsResponse("Too many requests");
    }

    const body = await request.json();
    const reference = String(body?.reference || "").trim();

    if (!reference) {
      return NextResponse.json({ error: "Reference is required" }, { status: 400 });
    }

    const existingTransaction = await prisma.paymentTransaction.findUnique({
      where: { reference },
    });

    if (existingTransaction?.status === "Completed") {
      return NextResponse.json({
        success: true,
        message: "Payment Successful",
        transaction: existingTransaction,
      });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json({ error: "Paystack secret key is not configured" }, { status: 500 });
    }

    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const verifyData = await verifyResponse.json();
    const data = verifyData?.data;
    const verified = verifyResponse.ok && verifyData?.status === true && data?.status === "success";
    const amount = typeof data?.amount === "number" ? data.amount / 100 : Number(body?.amount || 0);
    const normalizedAmount = Number.isFinite(amount) ? amount : 0;
    const purpose = getCustomField(data, "purpose") || getCustomField(data, "source") || body?.purpose || "Donation";
    const donor = getCustomField(data, "name") || body?.name || null;
    const email = data?.customer?.email || body?.email || null;
    const recurringMetadata = getCustomField(data, "recurring");
    const recurringLabel = recurringMetadata || "One-time";
    const type = reference.includes("deposit") ? "deposit" : "donation";

    const transaction = await prisma.paymentTransaction.upsert({
      where: { reference },
      update: {
        donor,
        email,
        amount: normalizedAmount,
        currency: data?.currency || body?.currency || "GHS",
        purpose,
        type,
        status: verified ? "Completed" : "Failed",
        provider: normalizeProvider(data),
        note: verified ? `Verified via Paystack - ${reference}` : `Paystack verification failed - ${reference}`,
        details: `Reference: ${reference}; Gateway: Paystack; Recurring: ${recurringLabel}`,
      },
      create: {
        donor,
        email,
        amount: normalizedAmount,
        currency: data?.currency || body?.currency || "GHS",
        reference,
        purpose,
        type,
        status: verified ? "Completed" : "Failed",
        provider: normalizeProvider(data),
        note: verified ? `Verified via Paystack - ${reference}` : `Paystack verification failed - ${reference}`,
        details: `Reference: ${reference}; Gateway: Paystack; Recurring: ${recurringLabel}`,
      },
    });

    if (!verified) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment Failed",
          transaction,
        },
        { status: 400 }
      );
    }

    if (
      recurringMetadata === "Monthly Covenant Deduction" &&
      data?.authorization?.authorization_code &&
      data?.authorization?.reusable
    ) {
      const nextChargeAt = new Date();
      nextChargeAt.setMonth(nextChargeAt.getMonth() + 1);

      await prisma.recurringSubscription.upsert({
        where: { authorizationCode: data.authorization.authorization_code },
        update: {
          donor,
          email,
          phone: data.customer?.phone || null,
          customerCode: data.customer?.customer_code || null,
          cardBrand: data.authorization.brand || null,
          last4: data.authorization.last4 || null,
          expMonth: Number(data.authorization.exp_month) || null,
          expYear: Number(data.authorization.exp_year) || null,
          amount: normalizedAmount,
          currency: data.currency || "GHS",
          purpose,
          active: true,
          nextChargeAt,
          lastChargeStatus: "Completed",
          note: "Covenant Seed recurring subscription",
        },
        create: {
          donor,
          email,
          phone: data.customer?.phone || null,
          authorizationCode: data.authorization.authorization_code,
          customerCode: data.customer?.customer_code || null,
          cardBrand: data.authorization.brand || null,
          last4: data.authorization.last4 || null,
          expMonth: Number(data.authorization.exp_month) || null,
          expYear: Number(data.authorization.exp_year) || null,
          amount: normalizedAmount,
          currency: data.currency || "GHS",
          purpose,
          active: true,
          nextChargeAt,
          lastChargeStatus: "Completed",
          note: "Covenant Seed recurring subscription",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Payment Successful",
      transaction,
    });
  } catch (error) {
    console.error("Paystack verification error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Payment Failed",
        details: error instanceof Error ? error.message : "Unknown verification error",
      },
      { status: 500 }
    );
  }
}
