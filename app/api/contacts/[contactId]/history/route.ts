/**
 * GET - Fetch contact activity history
 */
import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { contactId: string } }) {
  try {
    // Get all messages for this contact
    const messages = await prisma.message.findMany({
      where: { contactId: params.contactId },
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    // Get internal notes for this contact
    const notes = await prisma.internalNote.findMany({
      where: { contactId: params.contactId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    })

    // Combine and sort
    const history = [
      ...messages.map((msg) => ({
        id: msg.id,
        type: "message",
        action: `${msg.direction === "INBOUND" ? "Received" : "Sent"} ${msg.channel}`,
        content: msg.content,
        createdAt: msg.createdAt,
      })),
      ...notes.map((note) => ({
        id: note.id,
        type: "note",
        action: `Note added by ${note.user.name}`,
        content: note.content,
        createdAt: note.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(history)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}
