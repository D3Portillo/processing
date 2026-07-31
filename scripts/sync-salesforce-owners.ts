import "dotenv/config"
import { writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { getActiveLeadOwners } from "../app/lib/sf-leads"

async function main() {
  const owners = await getActiveLeadOwners()
  const outputPath = resolve(process.cwd(), "data/salesforce-owners.json")

  await writeFile(outputPath, `${JSON.stringify(owners, null, 2)}\n`, "utf8")
  console.log(`Saved ${owners.length} Salesforce owners to ${outputPath}`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
