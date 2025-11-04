/**
 * POST /api/messages/send - Send a message
 */
import { prisma } from "@/lib/prisma"
import { sendSMS, sendWhatsApp } from "@/lib/twilio"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { contactId, content, channel } = await request.json()

    // Fetch contact details
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    })

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    // Send message via Twilio
    let twilioResponse
    if (channel === "SMS" && contact.phoneNumber) {
      twilioResponse = await sendSMS(contact.phoneNumber, content)
    } else if (channel === "WHATSAPP" && contact.whatsapp) {
      twilioResponse = await sendWhatsApp(contact.whatsapp, content)
    }

    // Save message to database
    const message = await prisma.message.create({
      data: {
        teamId: contact.teamId,
        userId: contact.userId,
        contactId,
        channel: channel as any,
        content,
        direction: "OUTBOUND",
        status: "SENT",
        conversationId: `conv-${contactId}`,
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
