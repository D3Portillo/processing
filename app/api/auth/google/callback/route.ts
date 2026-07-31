import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { exchangeGoogleCode } from "@/app/lib/google-auth"
import { getAppSession } from "@/app/lib/session"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const cookieStore = await cookies()
  const expectedState = cookieStore.get("google_oauth_state")?.value

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.json({ error: "Invalid Google OAuth callback" }, { status: 400 })
  }

  try {
    const google = await exchangeGoogleCode(code)
    const session = await getAppSession()
    session.google = google
    await session.save()

    const response = NextResponse.redirect(new URL("/", request.url))
    response.cookies.delete("google_oauth_state")
    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google sign-in failed"
    return NextResponse.json({ error: message }, { status: 403 })
  }
}