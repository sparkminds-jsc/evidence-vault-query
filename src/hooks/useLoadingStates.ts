
import { useState } from "react"

export function useLoadingStates() {
  const [loadingAnswers, setLoadingAnswers] = useState<Set<string>>(new Set())
  const [loadingRemediations, setLoadingRemediations] = useState<Set<string>>(new Set())
  const [loadingEvaluations, setLoadingEvaluations] = useState<Set<string>>(new Set())
  const [deletingQuestions, setDeletingQuestions] = useState<Set<string>>(new Set())
  const [isDeletingAll, setIsDeletingAll] = useState(false)

  const addLoadingAnswer = (questionId: string) => {
    setLoadingAnswers(prev => new Set(prev).add(questionId))
  }

  const removeLoadingAnswer = (questionId: string) => {
    setLoadingAnswers(prev => {
      const newSet = new Set(prev)
      newSet.delete(questionId)
      return newSet
    })
  }

  const addLoadingRemediation = (questionId: string) => {
    setLoadingRemediations(prev => new Set(prev).add(questionId))
  }

  const removeLoadingRemediation = (questionId: string) => {
    setLoadingRemediations(prev => {
      const newSet = new Set(prev)
      newSet.delete(questionId)
      return newSet
    })
  }

  const addLoadingEvaluation = (questionId: string) => {
    setLoadingEvaluations(prev => new Set(prev).add(questionId))
  }

  const removeLoadingEvaluation = (questionId: string) => {
    setLoadingEvaluations(prev => {
      const newSet = new Set(prev)
      newSet.delete(questionId)
      return newSet
    })
  }

  const addDeletingQuestion = (questionId: string) => {
    setDeletingQuestions(prev => new Set(prev).add(questionId))
  }

  const removeDeletingQuestion = (questionId: string) => {
    setDeletingQuestions(prev => {
      const newSet = new Set(prev)
      newSet.delete(questionId)
      return newSet
    })
  }

  return {
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
  }
}
