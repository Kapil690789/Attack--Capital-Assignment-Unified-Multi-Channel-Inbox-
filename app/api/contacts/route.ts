import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = await cookies()
    const sessionToken = sessionCookie.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken },
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contacts = await prisma.contact.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(contacts)
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = await cookies()
    const sessionToken = sessionCookie.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken },
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, email, phoneNumber, whatsapp } = await request.json()

    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phoneNumber,
        whatsapp,
        teamId: "default-team",
        userId: session.userId,
      },
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error("Error creating contact:", error)
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 })
  }
}
