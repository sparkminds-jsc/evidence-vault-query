
import { Button } from "@/components/ui/button"
import { MessageSquare, Trash, Wrench, FileText, MessageCircle, RefreshCw, Check } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { EvidenceEditDialog } from "./EvidenceEditDialog"
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
  // Check if buttons should be disabled (already completed)
  const isEvaluationCompleted = evidence.document_evaluation_by_ai && evidence.document_evaluation_by_ai !== "--"
  const isRemediationCompleted = evidence.remediation_guidance && evidence.remediation_guidance !== "--"
  const isFeedbackEvaluationCompleted = evidence.feedback_to_ai && evidence.feedback_to_ai !== "--"
  const isFeedbackRemediationCompleted = evidence.feedback_for_remediation && evidence.feedback_for_remediation !== "--"

  return (
    <div className="flex flex-col gap-1">
      <Button
        onClick={() => onGetAnswer(questionId, questionContent)}
        size="sm"
        variant="outline"
        disabled={isAnyQuestionProcessing || answer !== "--"}
        className="w-full"
      >
        {isLoading ? (
          "Loading..."
        ) : (
          <>
            <MessageSquare className="h-4 w-4 mr-1" />
            Get Evidence
          </>
        )}
      </Button>

      {onGetEvaluation && (
        <Button
          onClick={() => onGetEvaluation(questionId)}
          size="sm"
          variant="outline"
          disabled={isLoadingEvaluation || isEvaluationCompleted}
          className="w-full"
        >
          {isLoadingEvaluation ? (
            "Loading..."
          ) : isEvaluationCompleted ? (
            <>
              <Check className="h-4 w-4 mr-1 text-green-600" />
              Get Evaluation
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-1" />
              Get Evaluation
            </>
          )}
        </Button>
      )}

      {onGetFeedbackEvaluation && (
        <Button
          onClick={() => onGetFeedbackEvaluation(questionId)}
          size="sm"
          variant="outline"
          disabled={isLoadingFeedbackEvaluation || isFeedbackEvaluationCompleted}
          className="w-full"
        >
          {isLoadingFeedbackEvaluation ? (
            "Loading..."
          ) : isFeedbackEvaluationCompleted ? (
            <>
              <Check className="h-4 w-4 mr-1 text-green-600" />
              Feedback Evaluation
            </>
          ) : (
            <>
              <MessageCircle className="h-4 w-4 mr-1" />
              Feedback Evaluation
            </>
          )}
        </Button>
      )}

      {onGetRemediation && (
        <Button
          onClick={() => onGetRemediation(questionId, questionContent)}
          size="sm"
          variant="outline"
          disabled={isLoadingRemediation || isRemediationCompleted}
          className="w-full"
        >
          {isLoadingRemediation ? (
            "Loading..."
          ) : isRemediationCompleted ? (
            <>
              <Check className="h-4 w-4 mr-1 text-green-600" />
              Get Remediation
            </>
          ) : (
            <>
              <Wrench className="h-4 w-4 mr-1" />
              Get Remediation
            </>
          )}
        </Button>
      )}

      {onGetFeedbackRemediation && (
        <Button
          onClick={() => onGetFeedbackRemediation(questionId)}
          size="sm"
          variant="outline"
          disabled={isLoadingFeedbackRemediation || isFeedbackRemediationCompleted}
          className="w-full"
        >
          {isLoadingFeedbackRemediation ? (
            "Loading..."
          ) : isFeedbackRemediationCompleted ? (
            <>
              <Check className="h-4 w-4 mr-1 text-green-600" />
              Feedback Remediation
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-1" />
              Feedback Remediation
            </>
          )}
        </Button>
      )}

      <EvidenceEditDialog 
        evidence={evidence}
        onUpdate={onUpdate}
      />
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isDeleting || isAnyQuestionProcessing}
            className="w-full"
          >
            {isDeleting ? (
              "Deleting..."
            ) : (
              <>
                <Trash className="h-4 w-4 mr-1" />
                Delete
              </>
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(questionId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
