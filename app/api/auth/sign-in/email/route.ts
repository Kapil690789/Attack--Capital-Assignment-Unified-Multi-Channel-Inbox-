import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const passwordMatch = await compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Create session
    const sessionToken = Math.random().toString(36).substr(2)
    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    return NextResponse.json(
      { success: true, user: { id: user.id, email: user.email, name: user.name } },
      {
        status: 200,
        headers: {
          "Set-Cookie": `session=${sessionToken}; Path=/; HttpOnly; Max-Age=${30 * 24 * 60 * 60}`,
        },
      },
    )
  } catch (error) {
    console.error("Sign in error:", error)
    return NextResponse.json({ error: "Failed to sign in" }, { status: 500 })
  }
}
