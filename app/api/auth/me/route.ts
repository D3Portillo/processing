import { NextResponse } from "next/server"
import { getAppSession } from "@/app/lib/session"

export async function GET() {
  const session = await getAppSession()
  if (!session.google) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({ user: session.google })
}