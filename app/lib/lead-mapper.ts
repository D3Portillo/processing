import type { MortgageFile, Stage } from "./types"
import type { SalesforceLead } from "./sf-leads"

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

function emptySpecialist(id: string | null) {
  return id ? { id, name: id, email: "", avatarColor: "#64748b" } : null
}

export function mapLeadToMortgageFile(lead: SalesforceLead): MortgageFile {
  const specialist = emptySpecialist(lead.OwnerId)
  const saleDate = lead.Sale_Date_On_Property__c

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
    },
    specialist,
    lender: {
      id: lead.Lender__c ?? "unknown",
      name: lead.Lender__c ?? "Unknown lender",
      phone:
        lead.QWR_RMA_Lender_Phone_Number__c ??
        lead.Underwriting_Lender_Phone_Number__c ??
        "",
      email: "",
    },
    poc: null,
    stage: mapStage(lead.Status),
    saleDate: saleDate ? new Date(saleDate).toISOString() : null,
    createdAt: lead.CreatedDate,
    updatedAt:
      lead.Last_Lender_Call__c ??
      lead.Next_Status_Update__c ??
      lead.CreatedDate,
  }
}
