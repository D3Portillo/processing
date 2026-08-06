import { NextResponse } from "next/server"
import { getToken, isSalesforceId, sfQuery, SF_API } from "@/app/lib/sf"

type FileSource = "content" | "attachment"

function getSource(value: string | null): FileSource | null {
  return value === "content" || value === "attachment" ? value : null
}

function contentDisposition(filename: string): string {
  const safeName = filename.replace(/[\r\n"\\]/g, "_") || "file"
  const asciiName = safeName.replace(/[^\x20-\x7e]/g, "_")
  return `inline; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`
}

function contentTypeFor(filename: string, fallback: string | null): string {
  if (fallback && fallback !== "application/octet-stream") return fallback

  const extension = filename.split(".").pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    csv: "text/csv",
    gif: "image/gif",
    heic: "image/heic",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    png: "image/png",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    txt: "text/plain",
    zip: "application/zip",
  }

  return mimeTypes[extension ?? ""] ?? fallback ?? "application/octet-stream"
}

interface SalesforceAttachmentMetadata {
  Id: string
  Name: string
  ContentType: string | null
  BodyLength: number | null
}

interface SalesforceContentVersionMetadata {
  Id: string
  Title: string | null
  FileExtension: string | null
  PathOnClient: string | null
  FileType: string | null
  ContentSizeLong: number | null
}

interface SalesforceFileMetadata {
  filename: string
  contentType: string | null
  contentLength: number | null
}

function filenameFromContentVersion(version: SalesforceContentVersionMetadata): string {
  const pathName = version.PathOnClient?.split(/[\\/]/).pop()?.trim()
  if (pathName && pathName.includes(".")) return pathName

  const title = version.Title?.trim() || "file"
  const extension = version.FileExtension?.trim().toLowerCase()
  return extension && !title.toLowerCase().endsWith(`.${extension}`)
    ? `${title}.${extension}`
    : title
}

function contentTypeFromFileType(fileType: string | null): string | null {
  const mimeTypes: Record<string, string> = {
    CSV: "text/csv",
    GIF: "image/gif",
    HEIC: "image/heic",
    JPEG: "image/jpeg",
    JPG: "image/jpeg",
    PDF: "application/pdf",
    PNG: "image/png",
    WORD: "application/msword",
    WORD_X: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    EXCEL: "application/vnd.ms-excel",
    EXCEL_X: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    TEXT: "text/plain",
    ZIP: "application/zip",
  }

  return mimeTypes[fileType ?? ""] ?? null
}

async function assertFileBelongsToLead(
  leadId: string,
  fileId: string,
  source: FileSource,
  token: string,
): Promise<SalesforceFileMetadata> {
  const soql = source === "attachment"
    ? `SELECT Id
FROM Attachment
WHERE Id = '${fileId}' AND ParentId = '${leadId}'`
    : `SELECT ContentDocumentId
FROM ContentDocumentLink
WHERE LinkedEntityId = '${leadId}' AND ContentDocument.LatestPublishedVersionId = '${fileId}'`
  const response = await fetch(
    `${SF_API}/query/?q=${encodeURIComponent(soql)}`,
    { headers: { Authorization: token }, cache: "no-store" },
  )

  if (!response.ok) {
    throw new Error(`SF file lookup failed (${response.status}): ${await response.text()}`)
  }

  const result = (await response.json()) as { records?: unknown[] }
  if (!result.records?.length) throw new Error("File not found for this lead")

  if (source === "attachment") {
    const [attachment] = await sfQuery<SalesforceAttachmentMetadata>(
      `SELECT Id, Name, ContentType, BodyLength
FROM Attachment
WHERE Id = '${fileId}' AND ParentId = '${leadId}'`,
      token,
    )
    if (!attachment) throw new Error("File not found for this lead")
    return {
      filename: attachment.Name,
      contentType: attachment.ContentType,
      contentLength: attachment.BodyLength,
    }
  }

  const [version] = await sfQuery<SalesforceContentVersionMetadata>(
    `SELECT Id, Title, FileExtension, PathOnClient, FileType, ContentSizeLong
FROM ContentVersion
WHERE Id = '${fileId}' AND IsLatest = true`,
    token,
  )
  if (!version) throw new Error("File not found for this lead")
  return {
    filename: filenameFromContentVersion(version),
    contentType: contentTypeFromFileType(version.FileType),
    contentLength: version.ContentSizeLong,
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ leadId: string; fileId: string }> },
) {
  const { leadId, fileId } = await params
  const source = getSource(new URL(request.url).searchParams.get("source"))

  if (!isSalesforceId(leadId) || !isSalesforceId(fileId) || !source) {
    return NextResponse.json({ error: "A valid lead, file, and source are required" }, { status: 400 })
  }

  try {
    const token = await getToken()
    const metadata = await assertFileBelongsToLead(leadId, fileId, source, token)

    const endpoint = source === "attachment"
      ? `${SF_API}/sobjects/Attachment/${fileId}/Body`
      : `${SF_API}/sobjects/ContentVersion/${fileId}/VersionData`
    const response = await fetch(endpoint, {
      headers: { Authorization: token },
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Unable to fetch Salesforce file (${response.status})` },
        { status: response.status === 404 ? 404 : 502 },
      )
    }

    const headers = new Headers()
    const contentType = contentTypeFor(
      metadata.filename,
      metadata.contentType ?? response.headers.get("content-type"),
    )
    const contentLength = response.headers.get("content-length")
    headers.set("Content-Type", contentType)
    if (contentLength || metadata.contentLength !== null) {
      headers.set("Content-Length", contentLength ?? String(metadata.contentLength))
    }
    headers.set(
      "Content-Disposition",
      contentDisposition(metadata.filename),
    )
    headers.set("Cache-Control", "private, no-store")

    return new NextResponse(response.body, { status: 200, headers })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to preview Salesforce file"
    const status = message === "File not found for this lead" ? 404 : 502
    return NextResponse.json({ error: message }, { status })
  }
}