
import { EvidenceActions } from "./evidence-actions/EvidenceActions"
import { EvidenceEditDialog } from "./EvidenceEditDialog"
import { DeleteConfirmationDialog } from "./evidence-actions/DeleteConfirmationDialog"
import { EvidenceItem } from "@/types/evidence"

interface EvidenceRowActionsProps {
  questionId: string
  questionContent: string
  answer: string
  isLoading: boolean
  isLoadingRemediation?: boolean
  isLoadingEvaluation?: boolean
  isLoadingFeedbackEvaluation?: boolean
  isLoadingFeedbackRemediation?: boolean
  isDeleting: boolean
  isAnyQuestionProcessing: boolean
  evidence: EvidenceItem
  onGetAnswer: (questionId: string, questionContent: string) => void
  onGetRemediation?: (questionId: string, questionContent: string) => void
  onGetEvaluation?: (questionId: string) => void
  onGetFeedbackEvaluation?: (questionId: string) => void
  onGetFeedbackRemediation?: (questionId: string) => void
  onDelete: (questionId: string) => void
  onUpdate: (updatedEvidence: EvidenceItem) => void
  hideEditButton?: boolean
}

export function EvidenceRowActions({
  questionId,
  questionContent,
  answer,
  isLoading,
  isLoadingRemediation = false,
  isLoadingEvaluation = false,
  isLoadingFeedbackEvaluation = false,
  isLoadingFeedbackRemediation = false,
  isDeleting,
  isAnyQuestionProcessing,
  evidence,
  onGetAnswer,
  onGetRemediation,
  onGetEvaluation,
  onGetFeedbackEvaluation,
  onGetFeedbackRemediation,
  onDelete,
  onUpdate,
  hideEditButton = false
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

      {!hideEditButton && (
        <EvidenceEditDialog
          evidence={evidence}
          onUpdate={onUpdate}
        />
      )}

      <DeleteConfirmationDialog
        questionId={questionId}
        isDeleting={isDeleting}
        isAnyQuestionProcessing={isAnyQuestionProcessing}
        onDelete={onDelete}
      />
    </div>
  )
}
