/**
 * PUT - Update scheduled message
 * DELETE - Cancel scheduled message
 */
import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { scheduledFor, content, channel } = await request.json()

    const updated = await prisma.scheduledMessage.update({
      where: { id: params.id },
      data: {
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
        content,
        channel,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update scheduled message" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.scheduledMessage.update({
      where: { id: params.id },
      data: { status: "CANCELLED" },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to cancel scheduled message" }, { status: 500 })
  }
}
