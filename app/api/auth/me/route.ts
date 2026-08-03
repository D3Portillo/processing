import { NextResponse } from "next/server"
import { getAppSession } from "@/app/lib/session"
import type { GoogleIdentity } from "@/app/lib/google-auth"

const DEV_USER: GoogleIdentity = {
  sub: "dev-alex-walker",
  name: "Alex Walker",
  email: "alex.walker@retentiongroup.org",
  hd: "retentiongroup.org",
}

export async function GET() {
  if (process.env.NODE_ENV === "development") {
    return NextResponse.json({ user: DEV_USER })
  }

  const session = await getAppSession()
  if (!session.google) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({ user: session.google })
}