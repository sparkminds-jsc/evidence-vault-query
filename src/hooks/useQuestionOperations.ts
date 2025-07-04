import { EvidenceItem } from "@/types/evidence"
import { useLoadingStates } from "./useLoadingStates"
import { useAnswerOperations } from "./useAnswerOperations"
import { useRemediationOperations } from "./useRemediationOperations"
import { useEvaluationOperations } from "./useEvaluationOperations"
import { useFeedbackEvaluationOperations } from "./useFeedbackEvaluationOperations"
import { useFeedbackRemediationOperations } from "./useFeedbackRemediationOperations"
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
    loadingFeedbackEvaluations,
    loadingFeedbackRemediations,
    deletingQuestions,
    isDeletingAll,
    setIsDeletingAll,
    addLoadingAnswer,
    removeLoadingAnswer,
    addLoadingRemediation,
    removeLoadingRemediation,
    addLoadingEvaluation,
    removeLoadingEvaluation,
    addLoadingFeedbackEvaluation,
    removeLoadingFeedbackEvaluation,
    addLoadingFeedbackRemediation,
    removeLoadingFeedbackRemediation,
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

  const { handleGetFeedbackEvaluation } = useFeedbackEvaluationOperations(
    evidenceData,
    setEvidenceData,
    setFilteredEvidence,
    addLoadingFeedbackEvaluation,
    removeLoadingFeedbackEvaluation
  )

  const { handleGetFeedbackRemediation } = useFeedbackRemediationOperations(
    evidenceData,
    setEvidenceData,
    setFilteredEvidence,
    addLoadingFeedbackRemediation,
    removeLoadingFeedbackRemediation
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
    loadingFeedbackEvaluations,
    loadingFeedbackRemediations,
    deletingQuestions,
    isDeletingAll,
    handleGetAnswer,
    handleGetRemediation,
    handleGetEvaluation,
    handleGetFeedbackEvaluation,
    handleGetFeedbackRemediation,
    handleDeleteQuestion,
    handleDeleteAllQuestions
  }
}
