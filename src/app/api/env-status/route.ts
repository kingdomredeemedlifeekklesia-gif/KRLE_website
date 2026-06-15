import { NextResponse } from "next/server";

export async function GET() {
  try {
    const youtubeKey = Boolean(process.env.NEXT_PUBLIC_YOUTUBE_API_KEY);
    const youtubeChannel = Boolean(process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID);
    const paystackPublic = Boolean(process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY);
    const paystackSecret = Boolean(process.env.PAYSTACK_SECRET_KEY);

    return NextResponse.json({
      youtubeKey,
      youtubeChannel,
      paystackPublic,
      paystackSecret,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
