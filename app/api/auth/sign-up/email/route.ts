import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: new Date(),
      },
    })

    // Create session
    const sessionToken = Math.random().toString(36).substr(2)
    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })

    return NextResponse.json(
      { success: true, user: { id: user.id, email: user.email, name: user.name } },
      {
        status: 201,
        headers: {
          "Set-Cookie": `session=${sessionToken}; Path=/; HttpOnly; Max-Age=${30 * 24 * 60 * 60}`,
        },
      },
    )
  } catch (error) {
    console.error("Sign up error:", error)
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}
