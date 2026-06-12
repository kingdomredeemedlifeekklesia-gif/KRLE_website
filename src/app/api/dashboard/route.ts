import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get total donations from completed payment transactions
    let totalDonations = 0;
    try {
      const donationData = await prisma.paymentTransaction.aggregate({
        where: {
          status: "Completed",
          type: "donation"
        },
        _sum: {
          amount: true
        }
      });
      totalDonations = donationData._sum?.amount || 0;
    } catch (e) {
      console.warn("Could not fetch donations:", e);
    }

    // Get total registered users
    let totalUsers = 0;
    try {
      totalUsers = await prisma.communityMember.count();
    } catch (e) {
      console.warn("Could not count community members:", e);
    }

    // Get unread messages
    let unreadMessages = 0;
    try {
      unreadMessages = await prisma.contactMessage.count({
        where: {
          status: "unread"
        }
      });
    } catch (e) {
      console.warn("Could not count unread messages:", e);
    }

    // Get recent activities (last 5 items from various sources)
    let activities = [
      { id: "1", action: "Welcome to your church dashboard", time: "Just now" },
      { id: "2", action: "System initialized successfully", time: "1 min ago" }
    ];

    try {
      const recentTransactions = await prisma.paymentTransaction.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          amount: true,
          type: true,
          donor: true
        }
      });

      const recentMessages = await prisma.contactMessage.findMany({
        take: 2,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          name: true,
          status: true
        }
      });

      // Combine and sort recent activities
      activities = [
        ...recentTransactions.map(t => ({
          id: `txn-${t.id}`,
          action: t.type === "donation" ? `New donation received: GHS ${t.amount}` : `${t.type} transaction: GHS ${t.amount}`,
          time: getTimeAgo(t.createdAt)
        })),
        ...recentMessages.map(m => ({
          id: `msg-${m.id}`,
          action: m.status === "unread" ? `New message from ${m.name}` : `Message replied to ${m.name}`,
          time: getTimeAgo(m.createdAt)
        }))
      ].sort((a, b) => {
        // Sort by time (most recent first)
        const timeA = parseTimeAgo(a.time);
        const timeB = parseTimeAgo(b.time);
        return timeA - timeB;
      }).slice(0, 5);

      if (activities.length === 0) {
        activities = [
          { id: "1", action: "Welcome to your church dashboard", time: "Just now" },
          { id: "2", action: "System initialized successfully", time: "1 min ago" }
        ];
      }
    } catch (e) {
      console.warn("Could not fetch recent activities:", e);
    }

    return NextResponse.json({
      totalDonations,
      totalUsers,
      unreadMessages,
      recentActivities: activities
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to load dashboard stats." }, { status: 500 });
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
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