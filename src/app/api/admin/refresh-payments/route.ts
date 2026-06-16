import { NextResponse } from "next/server";

export async function POST() {
  // Lightweight endpoint used by client to request admin UI refreshes.
  // This is a no-op on the server but returns 200 so client calls succeed.
  return NextResponse.json({ status: "ok" });
}
