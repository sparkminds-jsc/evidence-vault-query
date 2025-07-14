
import { useState, useEffect } from "react"
import { EvidenceItem } from "@/types/evidence"
import { fetchQuestionsFromDatabase } from "@/services/questionService"
import { updateQuestionInDatabase } from "@/services/aiService"
import { useSearch } from "@/hooks/useSearch"
import { useQuestionOperations } from "@/hooks/useQuestionOperations"
import { useToast } from "@/hooks/use-toast"

interface Customer {
  id: string
  email: string
  full_name: string
  status: string
}

export function useEvidenceData(currentCustomer: Customer | null) {
  const [evidenceData, setEvidenceData] = useState<EvidenceItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Use the search hook
  const { searchTerm, filteredEvidence, handleSearch, setFilteredEvidence } = useSearch(evidenceData)

  // Use the question operations hook
  const {
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
  } = useQuestionOperations(evidenceData, setEvidenceData, setFilteredEvidence, currentCustomer)

  useEffect(() => {
    loadQuestions()
  }, [currentCustomer])

  const loadQuestions = async () => {
    setIsLoading(true)
    try {
      const questions = await fetchQuestionsFromDatabase(currentCustomer)
      setEvidenceData(questions)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateEvidence = (updatedEvidence: EvidenceItem) => {
    const updateItem = (item: EvidenceItem) =>
      item.id === updatedEvidence.id ? updatedEvidence : item

    setEvidenceData(prev => prev.map(updateItem))
    setFilteredEvidence(prev => prev.map(updateItem))
  }

  const handleUpdateControlRating = async (questionId: string, rating: string) => {
    try {
      await updateQuestionInDatabase(
        questionId,
        undefined, // don't update answer
        undefined, // don't update evidence
        undefined, // don't update source
        undefined, // don't update remediation_guidance
        undefined, // don't update control_evaluation_by_ai
        undefined, // don't update document_evaluation_by_ai
        rating     // update control_rating_by_ai
      )

      // Update local state
      const updateItem = (item: EvidenceItem) =>
        item.id === questionId 
          ? { ...item, control_rating_by_ai: rating }
          : item

      setEvidenceData(prev => prev.map(updateItem))
      setFilteredEvidence(prev => prev.map(updateItem))

      toast({
        title: "Success!",
        description: "Control rating updated successfully",
      })
    } catch (error) {
      console.error('Error updating control rating:', error)
      toast({
        title: "Error",
        description: "Failed to update control rating. Please try again.",
        variant: "destructive"
      })
    }
  }

  return {
    searchTerm,
    evidenceData,
    filteredEvidence,
    isLoading,
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
    handleDeleteAllQuestions,
    handleSearch,
    handleUpdateEvidence,
    handleUpdateControlRating
  }
}
