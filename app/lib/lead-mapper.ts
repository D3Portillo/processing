import type { MortgageFile, Stage } from "./types"
import { LENDERS } from "./lenders"
import { SALESFORCE_OWNERS } from "./sf-leads"
import type { SalesforceLead } from "./sf-leads"
import { colorFromString } from "./utils"

const STATUS_TO_STAGE: Record<string, Stage> = {
  "Retainer Agreement Signed": "Processing",
  Processing: "Processing",
  "W.E. SENT": "Submitted",
  "W.C. Complete": "Submitted",
  "TPA PENDING": "TPA Pending",
  "SUB PENDING": "Sub Pending",
  "QWR/RMA": "Escalation",
  "QWR ONLY": "Escalation",
  "Missing Documents": "Missing Documents",
  UNDERWRITING: "Underwriting",
  Escalation: "Escalation",
  "Approved Pending Docs": "Pending Approved",
  APPROVED: "Approved",
  DENIED: "Denied",
  "Non-Compliance": "Escalation",
  BK: "Escalation",
  Qualified: "Processing",
  Refunded: "Closed",
  UNRSPSV: "Processing",
  Unqualified: "Denied",
  "Non-Payment": "Denied",
  Closed: "Closed",
}

function mapStage(status: string): Stage {
  return STATUS_TO_STAGE[status] ?? "Processing"
}

function toIsoDate(value: string | null): string | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function mapSpecialist(id: string | null) {
  const owner = id ? SALESFORCE_OWNERS.find((item) => item.Id === id) : null

  return id
    ? {
        id,
        name: owner?.Name ?? `Owner ${id}`,
        email: owner?.Email ?? "",
        avatarColor: colorFromString(id),
      }
    : null
}

export function mapLeadToMortgageFile(lead: SalesforceLead): MortgageFile {
  const specialist = mapSpecialist(lead.OwnerId)
  const saleDate = lead.Sale_Date_On_Property__c
  const lenderPhone =
    lead.QWR_RMA_Lender_Phone_Number__c ??
    lead.Underwriting_Lender_Phone_Number__c
  const lenderId = lead.Lender__c ?? "unknown"
  const lender = LENDERS.find((item) => item.id === lenderId)

  return {
    id: lead.Id,
    borrower: {
      id: lead.Id,
      name: lead.Name,
      phone: lead.Phone ?? "",
      email: lead.Email ?? "",
      propertyAddress: "",
      loanNumber: lead.Loan_Number__c ?? "",
      monthlyPayment: 0,
      loanType: lead.What_type_of_loan_do_they_have__c,
    },
    specialist,
    lender: {
      id: lenderId,
      name: lender?.name ?? "Unknown lender",
      phone: lenderPhone ?? "",
      email: "",
    },
    poc: lenderPhone
      ? {
          id: `${lead.Id}-lender-contact`,
          department: "Lender Contact",
          name: null,
          phone: lenderPhone,
          email: "",
          lenderId,
        }
      : null,
    stage: mapStage(lead.Status),
    saleDate: toIsoDate(saleDate),
    createdAt: lead.CreatedDate,
    updatedAt: lead.LastModifiedDate,
    nextStatusUpdate: lead.Next_Status_Update__c,
    lastLenderCall: lead.Last_Lender_Call__c,
  }
}
