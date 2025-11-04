import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ session: null }, { status: 200 })
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    })

    if (!session || session.expires < new Date()) {
      return NextResponse.json({ session: null }, { status: 200 })
    }

    return NextResponse.json(
      {
        session: {
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
          },
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Get session error:", error)
    return NextResponse.json({ error: "Failed to get session" }, { status: 500 })
  }
}
