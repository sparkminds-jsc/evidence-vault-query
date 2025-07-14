
import { EvidenceEditDialog } from "./EvidenceEditDialog"
import { EvidenceActions } from "./evidence-actions/EvidenceActions"
import { DeleteConfirmationDialog } from "./evidence-actions/DeleteConfirmationDialog"
import { EvidenceItem } from "@/types/evidence"

interface EvidenceRowActionsProps {
  questionId: string
  questionContent: string
  answer: string
  isLoading: boolean
  isDeleting: boolean
  isAnyQuestionProcessing: boolean
  evidence: EvidenceItem
  onGetAnswer: (questionId: string, questionContent: string) => void
  onDelete: (questionId: string) => void
  onUpdate: (updatedEvidence: EvidenceItem) => void
  isLoadingRemediation?: boolean
  onGetRemediation?: (questionId: string, questionContent: string) => void
  isLoadingEvaluation?: boolean
  onGetEvaluation?: (questionId: string) => void
  isLoadingFeedbackEvaluation?: boolean
  onGetFeedbackEvaluation?: (questionId: string) => void
  isLoadingFeedbackRemediation?: boolean
  onGetFeedbackRemediation?: (questionId: string) => void
}

export function EvidenceRowActions({
  questionId,
  questionContent,
  answer,
  isLoading,
  isDeleting,
  isAnyQuestionProcessing,
  evidence,
  onGetAnswer,
  onDelete,
  onUpdate,
  isLoadingRemediation = false,
  onGetRemediation,
  isLoadingEvaluation = false,
  onGetEvaluation,
  isLoadingFeedbackEvaluation = false,
  onGetFeedbackEvaluation,
  isLoadingFeedbackRemediation = false,
  onGetFeedbackRemediation
}: EvidenceRowActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <EvidenceActions
        questionId={questionId}
        questionContent={questionContent}
        answer={answer}
        isLoading={isLoading}
        isAnyQuestionProcessing={isAnyQuestionProcessing}
        evidence={evidence}
        onGetAnswer={onGetAnswer}
        isLoadingRemediation={isLoadingRemediation}
        onGetRemediation={onGetRemediation}
        isLoadingEvaluation={isLoadingEvaluation}
        onGetEvaluation={onGetEvaluation}
        isLoadingFeedbackEvaluation={isLoadingFeedbackEvaluation}
        onGetFeedbackEvaluation={onGetFeedbackEvaluation}
        isLoadingFeedbackRemediation={isLoadingFeedbackRemediation}
        onGetFeedbackRemediation={onGetFeedbackRemediation}
      />
      
      <EvidenceEditDialog 
        evidence={evidence}
        onUpdate={onUpdate}
      />
      
      <DeleteConfirmationDialog
        questionId={questionId}
        isDeleting={isDeleting}
        isAnyQuestionProcessing={isAnyQuestionProcessing}
        onDelete={onDelete}
      />
    </div>
  )
}
