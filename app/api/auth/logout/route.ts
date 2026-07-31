import { NextResponse } from "next/server"
import { getAppSession } from "@/app/lib/session"

export async function POST() {
  const session = await getAppSession()
  session.destroy()
  return NextResponse.json({ ok: true })
}