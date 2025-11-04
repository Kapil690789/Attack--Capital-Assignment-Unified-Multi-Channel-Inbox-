/**
 * Updated import to use pusher-server
 */
import { pusher } from "@/lib/pusher-server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { contactId, isTyping } = await request.json()

    // Broadcast typing status to all users viewing this contact
    await pusher.trigger(`contact-${contactId}`, "user-typing", {
      userId: "current-user-id",
      userName: "Current User",
      isTyping,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to broadcast typing status" }, { status: 500 })
  }
}
