import { prisma } from "@/lib/prisma";

function addMonths(date: Date, months: number) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

interface RecurringChargeResult {
  id: string;
  success: boolean;
  reference?: string;
  error?: string;
}

export async function getDueRecurringSubscriptions() {
  const now = new Date();
  return prisma.recurringSubscription.findMany({
    where: {
      active: true,
      nextChargeAt: {
        lte: now,
      },
    },
  });
}

export async function runRecurringCharges(): Promise<RecurringChargeResult[]> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Paystack secret key not configured.");
  }

  const now = new Date();
  const dueSubscriptions = await getDueRecurringSubscriptions();
  const results: RecurringChargeResult[] = [];

  if (dueSubscriptions.length === 0) {
    return results;
  }

  for (const subscription of dueSubscriptions) {
    if (!subscription.authorizationCode || !subscription.email) {
      await prisma.recurringSubscription.update({
        where: { id: subscription.id },
        data: {
          lastChargedAt: new Date(),
          lastChargeStatus: "failed: missing authorization or email",
        },
      });
      results.push({ id: subscription.id, success: false, error: "Missing authorization or email" });
      continue;
    }

    const chargeBody = {
      email: subscription.email,
      amount: Math.round(subscription.amount * 100),
      authorization_code: subscription.authorizationCode,
      currency: subscription.currency,
      metadata: {
        purpose: subscription.purpose,
        recurring: "Monthly Covenant Deduction",
        subscriptionId: subscription.id,
      },
    };

    const chargeResponse = await fetch("https://api.paystack.co/transaction/charge_authorization", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chargeBody),
    });

    const chargeData = await chargeResponse.json();
    const chargeSuccess = chargeResponse.ok && chargeData.status === true && chargeData.data?.status === "success";

    if (!chargeSuccess) {
      const errorMessage = chargeData.message || chargeData.data?.gateway_response || "Unknown Paystack error";
      await prisma.recurringSubscription.update({
        where: { id: subscription.id },
        data: {
          lastChargedAt: new Date(),
          lastChargeStatus: `failed: ${errorMessage}`,
        },
      });
      results.push({ id: subscription.id, success: false, error: errorMessage });
      continue;
    }

    await prisma.paymentTransaction.create({
      data: {
        donor: subscription.donor || null,
        email: subscription.email || null,
        amount: subscription.amount,
        currency: subscription.currency,
        purpose: subscription.purpose,
        type: "donation",
        status: "Completed",
        provider: "Paystack Card",
        note: `Recurring Covenant Seed charge for subscription ${subscription.id}`,
        details: `Reference: ${chargeData.data.reference}; Authorization: ${subscription.authorizationCode}`,
      },
    });

    const nextChargeAt = addMonths(subscription.nextChargeAt ?? now, 1);

    await prisma.recurringSubscription.update({
      where: { id: subscription.id },
      data: {
        lastChargedAt: new Date(),
        lastChargeStatus: "success",
        nextChargeAt,
      },
    });

    results.push({ id: subscription.id, success: true, reference: chargeData.data.reference });
  }

  return results;
}
