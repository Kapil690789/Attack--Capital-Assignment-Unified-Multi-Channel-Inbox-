import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = await cookies()
    const sessionToken = sessionCookie.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken },
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contacts = await prisma.contact.findMany({
      where: { userId: session.userId },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    })

    const conversations = contacts.map((contact) => ({
      id: contact.id,
      contactName: contact.name,
      lastMessage: contact.messages[0]?.content || "No messages",
      channel: contact.messages[0]?.channel || "SMS",
      lastMessageTime: contact.lastMessageAt || new Date().toISOString(),
      unreadCount: 0,
    }))

    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}
