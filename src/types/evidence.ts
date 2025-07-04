
export interface EvidenceItem {
  id: string
  question_id: string
  question: string
  answer: string
  evidence: string
  source: string
  iso_27001_control: string
  description: string
  feedback_to_ai: string
  field_audit_findings: string
  control_evaluation_by_ai: string
  remediation_guidance: string
  feedback_for_remediation: string
  document_evaluation_by_ai?: string // Add the new field
}

export interface AnswerData {
  id: string
  question_id: string
  page_content: string
  file_name: string
}
