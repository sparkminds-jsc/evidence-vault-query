
import { useState, useEffect } from "react"
import { EvidenceItem } from "@/types/evidence"
import { fetchQuestionsFromDatabase } from "@/services/questionService"
import { useSearch } from "@/hooks/useSearch"
import { useQuestionOperations } from "@/hooks/useQuestionOperations"

export function useEvidenceData() {
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
  } = useQuestionOperations(evidenceData, setEvidenceData, setEvidenceData)

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    try {
      const questions = await fetchQuestionsFromDatabase()
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
