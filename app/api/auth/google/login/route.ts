import { NextResponse } from "next/server"
import { randomBytes } from "node:crypto"
import { getGoogleLoginUrl } from "@/app/lib/google-auth"

export async function GET() {
  const state = randomBytes(32).toString("hex")
  const response = NextResponse.redirect(getGoogleLoginUrl(state))

  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60,
    path: "/",
  })

  return response
}