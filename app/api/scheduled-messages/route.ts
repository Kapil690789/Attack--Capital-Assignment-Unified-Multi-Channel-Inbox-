/**
 * GET - Fetch scheduled messages
 * POST - Create scheduled message
 */
import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const messages = await prisma.scheduledMessage.findMany({
      where: {
        userId: "user-id-from-session",
        status: { in: ["PENDING", "SENT"] },
      },
      orderBy: { scheduledFor: "desc" },
    })

    return NextResponse.json(messages)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch scheduled messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { contactId, channel, content, scheduledFor, isRecurring, recurringDays } = await request.json()

    const scheduledMessage = await prisma.scheduledMessage.create({
      data: {
        userId: "user-id-from-session",
        contactId,
        channel,
        content,
        scheduledFor: new Date(scheduledFor),
        isRecurring,
        recurringDays,
        status: "PENDING",
      },
    })

    return NextResponse.json(scheduledMessage, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create scheduled message" }, { status: 500 })
  }
}
