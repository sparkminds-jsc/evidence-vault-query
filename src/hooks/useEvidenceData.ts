
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
  const { searchTerm, filteredEvidence, handleSearch } = useSearch(evidenceData)

  // Use the question operations hook
  const {
    loadingAnswers,
    deletingQuestions,
    isDeletingAll,
    handleGetAnswer,
    handleDeleteQuestion,
    handleDeleteAllQuestions
  } = useQuestionOperations(evidenceData, setEvidenceData, setEvidenceData, currentCustomer)

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

  return {
    searchTerm,
    evidenceData,
    filteredEvidence,
    isLoading,
    loadingAnswers,
    deletingQuestions,
    isDeletingAll,
    handleGetAnswer,
    handleDeleteQuestion,
    handleDeleteAllQuestions,
    handleSearch
  }
}
