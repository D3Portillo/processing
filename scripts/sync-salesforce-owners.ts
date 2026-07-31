import "dotenv/config"
import { readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { getActiveLeadOwners, type SalesforceOwner } from "../app/lib/sf-leads"

async function main() {
  const owners = await getActiveLeadOwners()
  const outputPath = resolve(process.cwd(), "data/salesforce-owners.json")
  let existingOwners: SalesforceOwner[] = []

  try {
    existingOwners = JSON.parse(await readFile(outputPath, "utf8")) as SalesforceOwner[]
  } catch {
    // Create the file if it does not exist yet.
  }

  const existingIds = new Set(existingOwners.map((owner) => owner.Id))
  const newOwners = owners.filter((owner) => !existingIds.has(owner.Id))
  const mergedOwners = [...existingOwners, ...newOwners]

  await writeFile(outputPath, `${JSON.stringify(mergedOwners, null, 2)}\n`, "utf8")
  console.log(`Added ${newOwners.length} new Salesforce owners; ${mergedOwners.length} total saved`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
