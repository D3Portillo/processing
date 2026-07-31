import { cookies } from "next/headers"
import { createHash } from "node:crypto"
import { getIronSession, type SessionOptions } from "iron-session"
import type { GoogleIdentity } from "./google-auth"

export type AppSession = {
  google?: GoogleIdentity
}

function getSessionOptions(): SessionOptions {
  const configuredSecret = process.env.GOOGLE_SESSION_SECRET
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
  const password =
    configuredSecret ??
    (googleClientSecret
      ? createHash("sha256").update(googleClientSecret).digest("hex")
      : undefined)

  if (!password || password.length < 32) {
    throw new Error(
      "Set GOOGLE_SESSION_SECRET to a random value of at least 32 characters",
    )
  }

  return {
    password,
    ttl: 8 * 60 * 60,
    cookieName: "sf_session",
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 8 * 60 * 60,
      path: "/",
    },
  }
}

export async function getAppSession() {
  return getIronSession<AppSession>(await cookies(), getSessionOptions())
}
