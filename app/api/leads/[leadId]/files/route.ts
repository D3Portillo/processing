import { NextResponse } from "next/server"
import { getToken, isSalesforceId, sfQuery } from "@/app/lib/sf"
import type { SalesforceLeadFile } from "@/app/lib/types"

interface SalesforceContentDocumentLink {
  ContentDocumentId: string
}

interface SalesforceContentVersionRecord {
  Id: string
  ContentDocumentId: string
  Title: string | null
  FileExtension: string | null
  FileType: string | null
  ContentSize: number | null
  ContentSizeLong: number | null
  Description: string | null
  PathOnClient: string | null
  VersionNumber: string | null
  CreatedDate: string
  LastModifiedDate: string
}

function extensionFromPath(path: string | null): string | null {
  const filename = path?.split(/[\\/]/).pop()?.trim() ?? ""
  const extension = filename.includes(".") ? filename.split(".").pop() : null
  return extension?.toLowerCase() || null
}

function contentTypeFromExtension(extension: string | null): string | null {
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

  return mimeTypes[extension ?? ""] ?? null
}

interface SalesforceAttachmentRecord {
  Id: string
  Name: string
  ContentType: string | null
  BodyLength: number | null
  CreatedDate: string
  LastModifiedDate: string
}

function previewUrl(leadId: string, fileId: string, source: "content" | "attachment"): string {
  return `/api/leads/${encodeURIComponent(leadId)}/files/${encodeURIComponent(fileId)}?source=${source}`
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const { leadId } = await params

  if (!isSalesforceId(leadId)) {
    return NextResponse.json({ error: "A valid Lead ID is required" }, { status: 400 })
  }

  try {
    const token = await getToken()
    const [links, attachments] = await Promise.all([
      sfQuery<SalesforceContentDocumentLink>(
        `SELECT ContentDocumentId
FROM ContentDocumentLink
WHERE LinkedEntityId = '${leadId}'`,
        token,
      ),
      sfQuery<SalesforceAttachmentRecord>(
        `SELECT Id, Name, ContentType, BodyLength, CreatedDate, LastModifiedDate
FROM Attachment
WHERE ParentId = '${leadId}'
ORDER BY LastModifiedDate DESC`,
        token,
      ),
    ])

    const contentDocumentIds = links.map((link) => link.ContentDocumentId)
    const versions = contentDocumentIds.length
      ? await sfQuery<SalesforceContentVersionRecord>(
          `SELECT Id, ContentDocumentId, Title, FileExtension, FileType, ContentSize, ContentSizeLong, Description, PathOnClient, VersionNumber, CreatedDate, LastModifiedDate
FROM ContentVersion
WHERE IsLatest = true AND ContentDocumentId IN (${contentDocumentIds.map((id) => `'${id}'`).join(",")})
ORDER BY LastModifiedDate DESC`,
          token,
        )
      : []

    const files: SalesforceLeadFile[] = [
      ...versions.flatMap((version) => {
        if (version.FileType === "SNOTE") return []

        const pathName = version.PathOnClient?.split(/[\\/]/).pop()?.trim() || null
        const pathExtension = extensionFromPath(pathName)
        const extension = version.FileExtension?.trim().toLowerCase() || pathExtension
        const title = pathName || version.Title?.trim() || "Untitled file"
        const name = extension && !title.toLowerCase().endsWith(`.${extension}`)
          ? `${title}.${extension}`
          : title

        return [{
          id: version.ContentDocumentId,
          contentDocumentId: version.ContentDocumentId,
          versionId: version.Id,
          name,
          extension,
          fileType: version.FileType,
          contentType: contentTypeFromExtension(extension),
          description: version.Description,
          pathOnClient: version.PathOnClient,
          versionNumber: version.VersionNumber,
          fileSize: version.ContentSizeLong ?? version.ContentSize,
          createdAt: version.CreatedDate,
          updatedAt: version.LastModifiedDate,
          source: "content" as const,
          previewUrl: previewUrl(leadId, version.Id, "content"),
        }]
      }),
      ...attachments.map((attachment) => {
        const extension = attachment.Name.includes(".")
          ? attachment.Name.split(".").pop()?.toLowerCase() ?? null
          : null

        return {
          id: attachment.Id,
          contentDocumentId: null,
          versionId: null,
          name: attachment.Name,
          extension,
          fileType: null,
          contentType: attachment.ContentType,
          description: null,
          pathOnClient: attachment.Name,
          versionNumber: null,
          fileSize: attachment.BodyLength,
          createdAt: attachment.CreatedDate,
          updatedAt: attachment.LastModifiedDate,
          source: "attachment" as const,
          previewUrl: previewUrl(leadId, attachment.Id, "attachment"),
        }
      }),
    ].sort(
      (left, right) =>
        new Date(right.updatedAt || right.createdAt).getTime() -
        new Date(left.updatedAt || left.createdAt).getTime(),
    )

    return NextResponse.json(files)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch lead files"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}