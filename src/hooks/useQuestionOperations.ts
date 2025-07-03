
import { EvidenceItem } from "@/types/evidence"
import { useLoadingStates } from "./useLoadingStates"
import { useAnswerOperations } from "./useAnswerOperations"
import { useRemediationOperations } from "./useRemediationOperations"
import { useEvaluationOperations } from "./useEvaluationOperations"
import { useDeleteOperations } from "./useDeleteOperations"
import { Customer, QuestionOperationsReturn } from "./types/questionOperationsTypes"

export function useQuestionOperations(
  evidenceData: EvidenceItem[],
  setEvidenceData: React.Dispatch<React.SetStateAction<EvidenceItem[]>>,
  setFilteredEvidence: React.Dispatch<React.SetStateAction<EvidenceItem[]>>,
  currentCustomer: Customer | null
): QuestionOperationsReturn {
  const {
    loadingAnswers,
    loadingRemediations,
    loadingEvaluations,
    deletingQuestions,
    isDeletingAll,
    setIsDeletingAll,
    addLoadingAnswer,
    removeLoadingAnswer,
    addLoadingRemediation,
    removeLoadingRemediation,
    addLoadingEvaluation,
    removeLoadingEvaluation,
    addDeletingQuestion,
    removeDeletingQuestion
  } = useLoadingStates()

  const { handleGetAnswer } = useAnswerOperations(
    setEvidenceData,
    setFilteredEvidence,
    currentCustomer,
    addLoadingAnswer,
    removeLoadingAnswer
  )

  const { handleGetRemediation } = useRemediationOperations(
    evidenceData,
    setEvidenceData,
    setFilteredEvidence,
    addLoadingRemediation,
    removeLoadingRemediation
  )

  const { handleGetEvaluation } = useEvaluationOperations(
    evidenceData,
    setEvidenceData,
    setFilteredEvidence,
    addLoadingEvaluation,
    removeLoadingEvaluation
  )

  const { handleDeleteQuestion, handleDeleteAllQuestions } = useDeleteOperations(
    setEvidenceData,
    setFilteredEvidence,
    currentCustomer,
    addDeletingQuestion,
    removeDeletingQuestion,
    setIsDeletingAll
  )

  return {
    loadingAnswers,
    loadingRemediations,
    loadingEvaluations,
    deletingQuestions,
    isDeletingAll,
    handleGetAnswer,
    handleGetRemediation,
    handleGetEvaluation,
    handleDeleteQuestion,
    handleDeleteAllQuestions
  }
}
