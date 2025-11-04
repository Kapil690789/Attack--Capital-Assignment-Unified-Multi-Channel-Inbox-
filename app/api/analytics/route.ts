/**
 * GET /api/analytics - Fetch analytics data
 */
import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"
import { startOfDay, endOfDay } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const userId = "user-id-from-session"
    const today = new Date()

    // Get messages sent/received today
    const messageStats = await prisma.message.groupBy({
      by: ["direction", "channel"],
      where: {
        userId,
        createdAt: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
      _count: true,
    })

    // Get unique contacts reached
    const contactsReached = await prisma.message.findMany({
      where: {
        userId,
        direction: "OUTBOUND",
        createdAt: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
      distinct: ["contactId"],
    })

    const analytics = {
      messagesSent: messageStats.filter((s) => s.direction === "OUTBOUND").reduce((acc, s) => acc + s._count, 0),
      messagesReceived: messageStats.filter((s) => s.direction === "INBOUND").reduce((acc, s) => acc + s._count, 0),
      contactsReached: contactsReached.length,
      channels: messageStats,
    }

    return NextResponse.json(analytics)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
