import { prisma } from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher-server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData()
    const from = body.get("From") as string
    const content = body.get("Body") as string

    if (!from || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    // 1. Find the contact by their phone number
    const contact = await prisma.contact.findUnique({
      where: { phoneNumber: from },
    })

    if (!contact) {
      console.warn(`Message from unknown number: ${from}`)
      return new Response("<Response></Response>", {
        headers: { "Content-Type": "text/xml" },
      })
    }

    // 2. Create the new message
    const message = await prisma.message.create({
      data: {
        contactId: contact.id,
        teamId: contact.teamId,
        userId: contact.userId, 
        conversationId: contact.id,
        channel: "SMS",
        content,
        direction: "INBOUND",
        status: "DELIVERED",
      },
    })

    // 3. Update the contact's last message time
    await prisma.contact.update({
      where: { id: contact.id },
      data: { lastMessageAt: new Date() },
    })

    // 4. Trigger Pusher to update the UI
    await pusherServer.trigger(`chat_${contact.id}`, "new-message", message)
    await pusherServer.trigger(`conversations_${contact.userId}`, "new-message", message)

    // 5. Respond to Twilio
    return new Response("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    })
  } catch (error) {
    console.error("Twilio webhook error:", error)
    return new Response("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    })
  }
}