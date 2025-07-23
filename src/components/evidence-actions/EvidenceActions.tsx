
import { MessageSquare, FileText, Wrench, Check } from "lucide-react"
import { ActionButton } from "./ActionButton"
import { EvidenceItem } from "@/types/evidence"

interface EvidenceActionsProps {
  questionId: string
  questionContent: string
  answer: string
  isLoading: boolean
  isAnyQuestionProcessing: boolean
  evidence: EvidenceItem
  onGetAnswer: (questionId: string, questionContent: string) => void
  isLoadingRemediation?: boolean
  onGetRemediation?: (questionId: string, questionContent: string) => void
  isLoadingEvaluation?: boolean
  onGetEvaluation?: (questionId: string) => void
  isLoadingFeedbackEvaluation?: boolean
  onGetFeedbackEvaluation?: (questionId: string) => void
  isLoadingFeedbackRemediation?: boolean
  onGetFeedbackRemediation?: (questionId: string) => void
}

export function EvidenceActions({
  questionId,
  questionContent,
  answer,
  isLoading,
  isAnyQuestionProcessing,
  evidence,
  onGetAnswer,
  isLoadingRemediation = false,
  onGetRemediation,
  isLoadingEvaluation = false,
  onGetEvaluation,
  isLoadingFeedbackEvaluation = false,
  onGetFeedbackEvaluation,
  isLoadingFeedbackRemediation = false,
  onGetFeedbackRemediation
}: EvidenceActionsProps) {
  // Check if buttons should be disabled (already completed)
  const isEvaluationCompleted = evidence.document_evaluation_by_ai && evidence.document_evaluation_by_ai !== "--"
  const isRemediationCompleted = evidence.remediation_guidance && evidence.remediation_guidance !== "--"
  
  // Check if required data exists for enabling buttons
  const hasProvidedDocumentation = evidence.evidence && evidence.evidence !== "--"
  const hasFieldAuditFindings = evidence.field_audit_findings && evidence.field_audit_findings !== "--"

  return (
    <div className="flex flex-wrap gap-2">
      <ActionButton
        onClick={() => onGetAnswer(questionId, questionContent)}
        disabled={isAnyQuestionProcessing || answer !== "--"}
        isLoading={isLoading}
        icon={MessageSquare}
      >
        Get Evidence
      </ActionButton>

      {onGetEvaluation && (
        <ActionButton
          onClick={() => onGetEvaluation(questionId)}
          disabled={isLoadingEvaluation || isEvaluationCompleted || !hasProvidedDocumentation}
          isLoading={isLoadingEvaluation}
          isCompleted={isEvaluationCompleted}
          icon={isEvaluationCompleted ? Check : FileText}
        >
          Doc Evaluation
        </ActionButton>
      )}

      {onGetRemediation && (
        <ActionButton
          onClick={() => onGetRemediation(questionId, questionContent)}
          disabled={isLoadingRemediation || isRemediationCompleted}
          isLoading={isLoadingRemediation}
          isCompleted={isRemediationCompleted}
          icon={isRemediationCompleted ? Check : Wrench}
        >
          Control Evaluation
        </ActionButton>
      )}
    </div>
  )
}
