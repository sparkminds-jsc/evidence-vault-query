
import { Button } from "@/components/ui/button"
import { MessageSquare, Trash, Wrench, FileText, MessageCircle } from "lucide-react"
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
  onGetFeedbackEvaluation
}: EvidenceRowActionsProps) {
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
          disabled={isLoadingEvaluation}
          className="w-full"
        >
          {isLoadingEvaluation ? (
            "Loading..."
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
          disabled={isLoadingFeedbackEvaluation}
          className="w-full"
        >
          {isLoadingFeedbackEvaluation ? (
            "Loading..."
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
          disabled={isLoadingRemediation}
          className="w-full"
        >
          {isLoadingRemediation ? (
            "Loading..."
          ) : (
            <>
              <Wrench className="h-4 w-4 mr-1" />
              Get Remediation
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
