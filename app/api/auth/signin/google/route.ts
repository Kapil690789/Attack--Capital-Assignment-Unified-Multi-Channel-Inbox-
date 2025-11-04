import { NextResponse } from "next/server"

export async function GET() {
  // If Google OAuth is not configured, redirect to login with message
  return NextResponse.json(
    {
      error: "Google Sign-In not available. Please use email and password instead.",
      redirectTo: "/auth/login",
    },
    { status: 400 },
  )
}
