/**
 * Twilio message handler
 */
import { twilioClient } from "@/lib/twilio"
import { prisma } from "@/lib/prisma"
import { pusher } from "@/lib/pusher-server"
import type { MessageChannel } from "@prisma/client"

export async function handleInboundMessage(from: string, body: string, channel: MessageChannel, mediaUrl?: string) {
  try {
    // Normalize phone number
    const phoneNumber = from.replace(/^\+1/, "").replace(/[^\d]/g, "")

    // Find or create contact
    let contact = await prisma.contact.findFirst({
      where: {
        OR: [{ phoneNumber: from }, { phoneNumber: `+1${phoneNumber}` }, { whatsapp: from }],
      },
    })

    if (!contact) {
      // Create new contact - in production, assign to correct team/user
      contact = await prisma.contact.create({
        data: {
          name: from,
          phoneNumber: channel === "SMS" ? from : undefined,
          whatsapp: channel === "WHATSAPP" ? from : undefined,
          teamId: "default-team",
          userId: "default-user",
        },
      })
    }

    // Save inbound message
    const message = await prisma.message.create({
      data: {
        teamId: contact.teamId,
        userId: contact.userId,
        contactId: contact.id,
        channel,
        content: body,
        mediaUrl,
        direction: "INBOUND",
        status: "DELIVERED",
        conversationId: `conv-${contact.id}`,
      },
    })

    // Update contact's last message time
    await prisma.contact.update({
      where: { id: contact.id },
      data: { lastMessageAt: new Date() },
    })

    // Trigger Pusher event for new message
    await pusher.trigger(`private-team-${contact.teamId}`, "new-message", {
      message,
      contact,
    })

    return message
  } catch (error) {
    console.error("Error handling inbound message:", error)
    throw error
  }
}

export async function sendTwilioMessage(to: string, body: string, channel: "SMS" | "WHATSAPP", mediaUrl?: string) {
  try {
    const from =
      channel === "WHATSAPP" ? `whatsapp:${process.env.TWILIO_PHONE_NUMBER}` : process.env.TWILIO_PHONE_NUMBER

    const toNumber = channel === "WHATSAPP" ? `whatsapp:${to}` : to

    const response = await twilioClient.messages.create({
      from,
      to: toNumber,
      body,
      mediaUrl: mediaUrl ? [mediaUrl] : undefined,
    })

    return response
  } catch (error) {
    console.error("Error sending Twilio message:", error)
    throw error
  }
}
