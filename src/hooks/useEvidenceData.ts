
import { useState, useEffect } from "react"
import { EvidenceItem } from "@/types/evidence"
import { fetchQuestionsFromDatabase } from "@/services/questionService"
import { useSearch } from "@/hooks/useSearch"
import { useQuestionOperations } from "@/hooks/useQuestionOperations"

interface Customer {
  id: string
  email: string
  full_name: string
  status: string
}

export function useEvidenceData(currentCustomer: Customer | null) {
  const [evidenceData, setEvidenceData] = useState<EvidenceItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Use the search hook
  const { searchTerm, filteredEvidence, handleSearch, setFilteredEvidence } = useSearch(evidenceData)

  // Use the question operations hook
  const {
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

  return {
    searchTerm,
    evidenceData,
    filteredEvidence,
    isLoading,
    loadingAnswers,
    loadingRemediations,
    loadingEvaluations,
    deletingQuestions,
    isDeletingAll,
    handleGetAnswer,
    handleGetRemediation,
    handleGetEvaluation,
    handleDeleteQuestion,
    handleDeleteAllQuestions,
    handleSearch,
    handleUpdateEvidence
  }
}
