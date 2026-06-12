import { NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client only if credentials are available
const twilioClient = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phones, phone, message, recipients } = body;

    // Handle both single SMS and bulk SMS
    const phoneList = Array.isArray(phones) ? phones : (phone ? [phone] : []);

    if (phoneList.length === 0 || !message) {
      return NextResponse.json(
        { error: "Phone number(s) and message are required." },
        { status: 400 }
      );
    }

    // Check if Twilio is configured
    if (!twilioClient || !twilioPhoneNumber) {
      return NextResponse.json(
        {
          error: "SMS service is not configured. Please set Twilio credentials in environment variables.",
          hint: "Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to .env.local",
        },
        { status: 500 }
      );
    }

    const results = {
      success: 0,
      failed: 0,
      messages: [] as string[],
      errors: [] as string[],
    };

    // Send SMS to each phone number
    for (const phoneNumber of phoneList) {
      try {
        await twilioClient.messages.create({
          body: message,
          from: twilioPhoneNumber,
          to: phoneNumber,
        });

        results.success++;
        results.messages.push(`✓ Sent to ${phoneNumber}`);
        console.log(`SMS sent to ${phoneNumber}: ${message}`);
      } catch (error: any) {
        results.failed++;
        const errorMsg = error?.message || "Unknown error";
        results.messages.push(`✗ Failed to send to ${phoneNumber}`);
        results.errors.push(`${phoneNumber}: ${errorMsg}`);
        console.error(`Failed to send SMS to ${phoneNumber}:`, error);
      }
    }

    return NextResponse.json(
      {
        success: results.failed === 0,
        message: `SMS campaign completed. Sent: ${results.success}, Failed: ${results.failed}`,
        results,
      },
      { status: results.failed === phoneList.length ? 500 : 200 }
    );
  } catch (error) {
    console.error("SMS sending error:", error);
    return NextResponse.json(
      { error: "Failed to send SMS." },
      { status: 500 }
    );
  }
}
