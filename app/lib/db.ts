import { createClient, type Client } from "@libsql/client";

let _client: Client | null = null;

export function getDb(): Client {
  if (_client) return _client;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (url && authToken) {
    _client = createClient({ url, authToken });
  } else if (url) {
    _client = createClient({ url });
  } else {
    // Local SQLite fallback for development
    _client = createClient({ url: "file:local.db" });
  }

  return _client;
}