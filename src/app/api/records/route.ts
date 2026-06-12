import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidEmail, isValidName } from "@/lib/validation";

export async function GET() {
  try {
    const records = await prisma.record.findMany({
      orderBy: { joinedAt: "desc" },
    });
    return NextResponse.json(records);
  } catch (error) {
    console.error("Records GET error:", error);
    return NextResponse.json({ error: "Failed to load records." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, name, email, joinedAt, status } = body;

    if (!type || !name || !email) {
      return NextResponse.json(
        { error: "Type, name, and email are required." },
        { status: 400 }
      );
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

    const record = await prisma.record.create({
      data: {
        type,
        name,
        email,
        joinedAt: joinedAt ? new Date(joinedAt) : new Date(),
        status: status || "Active",
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Records POST error:", error);
    return NextResponse.json(
      { error: "Failed to create record." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, type, name, email, joinedAt, status } = body;

    if (!id || !type || !name || !email) {
      return NextResponse.json(
        { error: "ID, type, name, and email are required." },
        { status: 400 }
      );
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

    const updatedRecord = await prisma.record.update({
      where: { id },
      data: {
        type,
        name,
        email,
        joinedAt: joinedAt ? new Date(joinedAt) : undefined,
        status,
      },
    });

    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error("Records PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update record." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Record ID is required." }, { status: 400 });
    }

    await prisma.record.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Records DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete record." },
      { status: 500 }
    );
  }
}
