
export interface EvidenceItem {
  id: string
  question_id: string
  question: string
  answer: string
  evidence: string
  source: string
}

export interface AnswerData {
  id: string
  question_id: string
  page_content: string
  file_name: string
}
