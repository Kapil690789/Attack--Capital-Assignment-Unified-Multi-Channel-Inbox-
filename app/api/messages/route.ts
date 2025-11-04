/**
 * GET /api/messages/[contactId] - Fetch messages for a contact
 */
import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { contactId: string } }) {
  try {
    const messages = await prisma.message.findMany({
      where: {
        contactId: params.contactId,
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
