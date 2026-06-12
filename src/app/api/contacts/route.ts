import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidEmail, isValidPhoneNumber, isValidName } from "@/lib/validation";

export async function GET() {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Contacts GET error:", error);
    return NextResponse.json({ error: "Failed to load messages." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, whatsapp, message } = body;

    if (!name || !email || !whatsapp || !message) {
      return NextResponse.json({ error: "Name, email, WhatsApp, and message are required." }, { status: 400 });
    }

    if (!isValidName(name)) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters long." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!isValidPhoneNumber(whatsapp)) {
      return NextResponse.json(
        { error: "Please enter a valid WhatsApp number (e.g., +256770000000 or +1234567890)." },
        { status: 400 }
      );
    }

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        whatsapp,
        message,
        status: "unread",
      },
    });

    return NextResponse.json(contactMessage, { status: 201 });
  } catch (error) {
    console.error("Contact POST error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save message." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, adminReply, status, adminNote } = body;

    if (!id) {
      return NextResponse.json({ error: "Message ID is required." }, { status: 400 });
    }

    const updatedMessage = await prisma.contactMessage.update({
      where: { id },
      data: {
        ...(adminReply && { adminReply }),
        ...(status && { status }),
        ...(adminNote && { adminNote }),
      },
    });

    return NextResponse.json(updatedMessage, { status: 200 });
  } catch (error) {
    console.error("Contacts POST error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save message." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Message ID is required." }, { status: 400 });
    }

    await prisma.contactMessage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete message." }, { status: 500 });
  }
}
