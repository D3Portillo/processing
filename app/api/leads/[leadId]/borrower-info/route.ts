import { NextResponse } from "next/server"
import { getToken, isSalesforceId, sfQuery } from "@/app/lib/sf"

interface SalesforceAddress {
  street: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  country: string | null
}

interface SalesforceLeadBorrowerFields {
  Id: string
  Co_Borrower_Phone__c: string | null
  Co_Borrower_s_Email__c: string | null
  Co_Borrower_s_Name__c: string | null
  SSN__c: string | null
  DOB__c: string | null
  Address: SalesforceAddress | null
  Has_a_source_of_income__c: boolean | null
}

export interface LeadBorrowerInfo {
  cob_phone: string | null
  cob_email: string | null
  cob_name: string | null
  ssn: string | null
  address: string | null
  birth_date: string | null
  has_income: boolean | null
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const { leadId } = await params

  if (!isSalesforceId(leadId)) {
    return NextResponse.json(
      { error: "A valid Lead ID is required" },
      { status: 400 },
    )
  }

  try {
    const token = await getToken()
    const rows = await sfQuery<SalesforceLeadBorrowerFields>(
      `SELECT Id, Co_Borrower_Phone__c, Co_Borrower_s_Email__c, Co_Borrower_s_Name__c, SSN__c, DOB__c, Address, Has_a_source_of_income__c
FROM Lead
WHERE Id = '${leadId}'`,
      token,
    )

    const row = rows[0]
    if (!row) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    const address = row.Address
    const addressString = address
      ? [address.street, address.city, address.state, address.postalCode]
          .filter(Boolean)
          .join(", ")
      : null

    const info: LeadBorrowerInfo = {
      cob_phone: row.Co_Borrower_Phone__c ?? null,
      cob_email: row.Co_Borrower_s_Email__c ?? null,
      cob_name: row.Co_Borrower_s_Name__c ?? null,
      ssn: row.SSN__c ?? null,
      address: addressString,
      birth_date: row.DOB__c ?? null,
      has_income: row.Has_a_source_of_income__c ?? null,
    }

    return NextResponse.json(info)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to fetch lead borrower info"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
