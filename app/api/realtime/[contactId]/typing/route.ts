import { prisma } from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher-server"// Assuming your file is lib/pusher.server.ts
import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// Helper function to get session
async function getSession(request: NextRequest) {
  const sessionCookie = cookies()
  const sessionToken = (await sessionCookie).get("session")?.value
  if (!sessionToken) return null

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  })
  if (!session || session.expires < new Date()) return null
  return session
}

export async function POST(
  request: NextRequest,
  { params }: { params: { contactId: string } } // <-- This is the fix
) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 1. Get contactId from the URL params
    const { contactId } = params
    const { isTyping } = await request.json()

    // 2. Broadcast with the real user's name
    await pusherServer.trigger(`chat_${contactId}`, "typing", {
      userId: session.user.id,
      userName: session.user.name || "User",
      isTyping,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Typing error:", error)
    return NextResponse.json({ error: "Failed to send typing status" }, { status: 500 })
  }
}