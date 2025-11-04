/**
 * GET - Fetch available Twilio numbers
 * POST - Buy a Twilio number
 */
import { twilioClient } from "@/lib/twilio"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Fetch incoming phone numbers
    const numbers = await twilioClient.incomingPhoneNumbers.list()

    return NextResponse.json({
      numbers: numbers.map((num: any) => ({
        sid: num.sid,
        phoneNumber: num.phoneNumber,
        friendlyName: num.friendlyName,
        capabilities: num.capabilities,
      })),
    })
  } catch (error) {
    console.error("Error fetching Twilio numbers:", error)
    return NextResponse.json({ error: "Failed to fetch numbers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { areaCode, countryCode = "US" } = await request.json()

    // Search for available numbers
    const availableNumbers = await twilioClient.availablePhoneNumbers
      .get(countryCode)
      .local.list({ areaCode, limit: 5 })

    if (availableNumbers.length === 0) {
      return NextResponse.json({ error: "No numbers available" }, { status: 404 })
    }

    // Buy the first available number
    const phoneNumber = availableNumbers[0].phoneNumber
    const purchased = await twilioClient.incomingPhoneNumbers.create({
      phoneNumber,
      voiceUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/voice`,
      smsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio`,
      voiceFallbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/voice-fallback`,
      smsFallbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio`,
    })

    return NextResponse.json({
      success: true,
      number: purchased.phoneNumber,
      sid: purchased.sid,
    })
  } catch (error) {
    console.error("Error buying Twilio number:", error)
    return NextResponse.json({ error: "Failed to purchase number" }, { status: 500 })
  }
}
