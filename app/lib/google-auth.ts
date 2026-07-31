import { OAuth2Client } from "google-auth-library"

export interface GoogleIdentity {
  sub: string
  email: string
  name: string
  picture?: string
  hd?: string
}

const DEV_EMAIL = "d3portillo@gmail.com"
const WORKSPACE_DOMAIN = "retentiongroup.org"

export function getAllowedGoogleIdentity(identity: GoogleIdentity): GoogleIdentity {
  if (identity.email === DEV_EMAIL) {
    return {
      ...identity,
      name: "Alex Walker",
      email: "alex.walker@retentiongroup.org",
      hd: WORKSPACE_DOMAIN,
    }
  }

  return identity
}

function getGoogleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Missing Google OAuth environment variables")
  }

  return { clientId, clientSecret, redirectUri }
}

function getAllowedDomain(): string {
  return (process.env.GOOGLE_WORKSPACE_DOMAIN ?? WORKSPACE_DOMAIN).toLowerCase()
}

export function getGoogleOAuthClient() {
  const { clientId, clientSecret, redirectUri } = getGoogleConfig()
  return new OAuth2Client(clientId, clientSecret, redirectUri)
}

export function getGoogleLoginUrl(state: string): string {
  return getGoogleOAuthClient().generateAuthUrl({
    access_type: "offline",
    prompt: "select_account",
    scope: ["openid", "email", "profile"],
    state,
  })
}

export async function exchangeGoogleCode(code: string): Promise<GoogleIdentity> {
  const client = getGoogleOAuthClient()
  const { tokens } = await client.getToken(code)

  if (!tokens.id_token) throw new Error("Google did not return an ID token")

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  })
  const payload = ticket.getPayload()

  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    throw new Error("Google account does not have a verified email")
  }

  const email = payload.email.toLowerCase()
  const allowedDomain = getAllowedDomain()

  if (
    email !== DEV_EMAIL &&
    (payload.hd?.toLowerCase() !== allowedDomain ||
      !email.endsWith(`@${allowedDomain}`))
  ) {
    throw new Error("Google account is not part of the allowed Workspace")
  }

  return getAllowedGoogleIdentity({
    sub: payload.sub,
    email,
    name: payload.name ?? email,
    picture: payload.picture,
    hd: payload.hd,
  })
}