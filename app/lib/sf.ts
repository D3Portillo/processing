export const SF_BASE =
  process.env.SF_BASE_URL ?? "https://force-energy-1679.my.salesforce.com"

export const SF_API = `${SF_BASE}/services/data/v66.0`

export const SF_LOGIN_URL =
  process.env.SF_LOGIN_URL ?? "https://login.salesforce.com"

export function isSalesforceId(value: string): boolean {
  return /^[a-zA-Z0-9]{15}(?:[a-zA-Z0-9]{3})?$/.test(value)
}

export function getSalesforceOAuthConfig() {
  const clientId = process.env.SF_OAUTH_CLIENT_ID
  const clientSecret = process.env.SF_OAUTH_CLIENT_SECRET
  const redirectUri = process.env.SF_OAUTH_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Missing Salesforce OAuth environment variables")
  }

  return { clientId, clientSecret, redirectUri }
}

export interface SalesforceIdentity {
  user_id: string
  username: string
  display_name: string
  email: string
  organization_id: string
}

let cachedToken: { value: string; expiresAt: number } | null = null

export async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.value
  }

  const clientId = process.env.SF_CLIENT_ID
  const clientSecret = process.env.SF_CLIENT_SECRET
  const password = process.env.SF_PASSWORD

  if (!clientId || !clientSecret || !password) {
    throw new Error("Missing Salesforce environment variables")
  }

  const res = await fetch(`${SF_BASE}/services/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      username: "brandon@pathwaymortgage.com",
      password,
    }).toString(),
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`SF auth failed (${res.status}): ${await res.text()}`)
  }

  const json = (await res.json()) as {
    access_token: string
    issued_at?: string
  }
  const issuedAt = json.issued_at ? Number(json.issued_at) : Date.now()

  cachedToken = {
    value: `Bearer ${json.access_token}`,
    expiresAt: issuedAt + 2 * 60 * 60 * 1000,
  }

  return cachedToken.value
}

export interface SFQueryResponse<T> {
  totalSize: number
  done: boolean
  records: T[]
  nextRecordsUrl?: string
}

export async function sfQuery<T>(soql: string, token?: string): Promise<T[]> {
  const authorization = token ?? (await getToken())
  let url: string | URL = `${SF_API}/query/?q=${encodeURIComponent(soql)}`
  const records: T[] = []

  while (url) {
    const res = await fetch(url, {
      headers: { Authorization: authorization },
      cache: "no-store",
    })

    if (!res.ok) {
      throw new Error(`SF query failed (${res.status}): ${await res.text()}`)
    }

    const data = (await res.json()) as SFQueryResponse<T>
    records.push(...data.records)
    url = data.nextRecordsUrl ? new URL(data.nextRecordsUrl, SF_BASE) : ""
  }

  return records
}
