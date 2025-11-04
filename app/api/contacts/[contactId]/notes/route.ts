/**
 * GET - Fetch internal notes for a contact
 * POST - Create internal note
 */
import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { contactId: string } }) {
  try {
    const notes = await prisma.internalNote.findMany({
      where: { contactId: params.contactId },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(notes)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { contactId: string } }) {
  try {
    const { content, isPrivate, mentions } = await request.json()

    const note = await prisma.internalNote.create({
      data: {
        contactId: params.contactId,
        userId: "user-id-from-session",
        content,
        isPrivate,
        mentions: mentions || [],
      },
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 })
  }
}
