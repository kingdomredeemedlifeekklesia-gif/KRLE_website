import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [donationAggregate, titheAggregate, offeringAggregate, covenantSeedAggregate, totalUsers, unreadMessages, recentTransactions, recentMessages] = await Promise.all([
      prisma.paymentTransaction.aggregate({
        where: { status: "Completed", type: "donation" },
        _sum: { amount: true },
      }),
      prisma.paymentTransaction.aggregate({
        where: { status: "Completed", purpose: { contains: "tithe", mode: "insensitive" } },
        _sum: { amount: true },
      }),
      prisma.paymentTransaction.aggregate({
        where: { status: "Completed", purpose: { contains: "offertory", mode: "insensitive" } },
        _sum: { amount: true },
      }),
      prisma.paymentTransaction.aggregate({
        where: { status: "Completed", purpose: { contains: "covenant seed", mode: "insensitive" } },
        _sum: { amount: true },
      }),
      prisma.communityMember.count(),
      prisma.contactMessage.count({ where: { status: "unread" } }),
      prisma.paymentTransaction.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, createdAt: true, amount: true, type: true, donor: true, purpose: true, status: true },
      }),
      prisma.contactMessage.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        select: { id: true, createdAt: true, name: true, status: true },
      }),
    ]);

    const totalDonations = Number((donationAggregate as { _sum?: { amount?: number | null } } | null)?._sum?.amount ?? 0);
    const totalTithe = Number((titheAggregate as { _sum?: { amount?: number | null } } | null)?._sum?.amount ?? 0);
    const totalOffering = Number((offeringAggregate as { _sum?: { amount?: number | null } } | null)?._sum?.amount ?? 0);
    const totalCovenantSeed = Number((covenantSeedAggregate as { _sum?: { amount?: number | null } } | null)?._sum?.amount ?? 0);

    let monthlyStats: Array<{ month: string; total: number }> = [];
    try {
      monthlyStats = await prisma.$queryRaw<Array<{ month: string; total: number }>>`
        SELECT TO_CHAR("createdAt", 'YYYY-MM') AS month, SUM(amount)::float AS total
        FROM "PaymentTransaction"
        WHERE "status" = 'Completed'
        GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
        ORDER BY month DESC
        LIMIT 6
      `;
    } catch {
      monthlyStats = [];
    }

    const activities = [
      ...(Array.isArray(recentTransactions) ? recentTransactions : []).map((transaction: { id: string; createdAt: Date; amount: number; type: string; donor: string | null; purpose: string; status: string }) => ({
        id: `txn-${transaction.id}`,
        action: `${transaction.purpose || transaction.type} • GHS ${Number(transaction.amount || 0).toFixed(2)}`,
        time: getTimeAgo(transaction.createdAt),
      })),
      ...(Array.isArray(recentMessages) ? recentMessages : []).map((message: { id: string; createdAt: Date; name: string; status: string }) => ({
        id: `msg-${message.id}`,
        action: message.status === "unread" ? `New message from ${message.name}` : `Message replied to ${message.name}`,
        time: getTimeAgo(message.createdAt),
      })),
    ]
      .sort((a, b) => parseTimeAgo(b.time) - parseTimeAgo(a.time))
      .slice(0, 8);

    return NextResponse.json({
      totalDonations,
      totalTithe,
      totalOffering,
      totalCovenantSeed,
      totalUsers,
      unreadMessages,
      monthlyStats,
      recentActivities: activities,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to load dashboard stats." }, { status: 500 });
  }
}

function getTimeAgo(date: Date | string | null | undefined): string {
  const now = new Date();
  const parsedDate = date instanceof Date ? date : new Date(date ?? Date.now());
  if (Number.isNaN(parsedDate.getTime())) {
    return "Just now";
  }

  const diffMs = now.getTime() - parsedDate.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
}

function parseTimeAgo(timeStr: string): number {
  if (timeStr === "Just now") return 0;
  if (timeStr.includes("min ago")) return parseInt(timeStr) * 60 * 1000;
  if (timeStr.includes("hours ago")) return parseInt(timeStr) * 60 * 60 * 1000;
  if (timeStr.includes("days ago")) return parseInt(timeStr) * 24 * 60 * 60 * 1000;
  return 0;
}