import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

// Helper function to get session
async function getSession(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value 
  if (!sessionToken) return null

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  })
  if (!session || session.expires < new Date()) return null
  return session
}

export async function GET(
  request: NextRequest,
  { params }: { params: { contactId: string } }
) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { contactId } = params
    const messages = await prisma.message.findMany({
      where: {
        contactId: contactId,
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 50,
    })
    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { contactId: string } }
) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { contactId } = params
    const { content, channel } = await request.json()
    const message = await prisma.message.create({
      data: {
        contactId: contactId,
        userId: session.userId,
        teamId: "default-team",
        conversationId: contactId,
        channel: channel || "SMS",
        content,
        direction: "OUTBOUND",
        status: "SENT",
      },
    })
    await prisma.contact.update({
      where: { id: contactId },
      data: { lastMessageAt: new Date() },
    })
    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}