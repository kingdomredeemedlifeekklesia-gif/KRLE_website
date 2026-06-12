import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidPhoneNumber, isValidName } from "@/lib/validation";

export async function GET() {
  try {
    const members = await prisma.communityMember.findMany({
      orderBy: { joinedAt: "desc" },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Community GET error:", error);
    return NextResponse.json({ error: "Failed to load members." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, whatsappNumber } = body;

    if (!name || !whatsappNumber) {
      return NextResponse.json({ error: "Name and WhatsApp number are required." }, { status: 400 });
    }

    if (!isValidName(name)) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters long." },
        { status: 400 }
      );
    }

    if (!isValidPhoneNumber(whatsappNumber)) {
      return NextResponse.json(
        { error: "Please enter a valid WhatsApp number (e.g., +256770000000 or +1234567890)." },
        { status: 400 }
      );
    }

    // Check if already exists
    const existing = await prisma.communityMember.findFirst({
      where: { whatsappNumber },
    });

    if (existing) {
      return NextResponse.json({ error: "This WhatsApp number is already registered." }, { status: 400 });
    }

    const member = await prisma.communityMember.create({
      data: {
        name,
        whatsappNumber,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Community POST error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to add member." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Member ID is required." }, { status: 400 });
    }

    const member = await prisma.communityMember.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Member deleted successfully", member });
  } catch (error) {
    console.error("Community DELETE error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete member." }, { status: 500 });
  }
}
