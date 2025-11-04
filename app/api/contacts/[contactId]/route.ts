import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { contactId: string } }
) {
  try {
    const { contactId } = params
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    })
    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }
    return NextResponse.json(contact)
  } catch (error) {
    console.error("Get contact error:", error)
    return NextResponse.json({ error: "Failed to fetch contact" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { contactId: string } }
) {
  try {
    const { contactId } = params
    const body = await request.json()
    const contact = await prisma.contact.update({
      where: { id: contactId },
      data: {
        name: body.name,
        email: body.email,
        phoneNumber: body.phoneNumber,
        whatsapp: body.whatsapp,
        notes: body.notes,
        status: body.status,
      },
    })
    return NextResponse.json(contact)
  } catch (error) {
    console.error("Update contact error:", error)
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { contactId: string } }
) {
  try {
    const { contactId } = params
    await prisma.contact.delete({
      where: { id: contactId },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete contact error:", error)
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 })
  }
}