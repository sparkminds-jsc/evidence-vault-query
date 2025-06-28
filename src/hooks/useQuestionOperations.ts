
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { EvidenceItem } from "@/types/evidence"
import { 
  deleteQuestion, 
  deleteAllQuestions 
} from "@/services/questionService"
import { 
  getAnswerFromAI, 
  processAIResponse, 
  saveAnswersToDatabase, 
  updateQuestionInDatabase 
} from "@/services/aiService"

export function useQuestionOperations(
  evidenceData: EvidenceItem[],
  setEvidenceData: React.Dispatch<React.SetStateAction<EvidenceItem[]>>,
  setFilteredEvidence: React.Dispatch<React.SetStateAction<EvidenceItem[]>>
) {
  const [loadingAnswers, setLoadingAnswers] = useState<Set<string>>(new Set())
  const [deletingQuestions, setDeletingQuestions] = useState<Set<string>>(new Set())
  const [isDeletingAll, setIsDeletingAll] = useState(false)
  const { toast } = useToast()

  const handleGetAnswer = async (questionId: string, questionContent: string) => {
    setLoadingAnswers(prev => new Set(prev).add(questionId))
    
    try {
      const data = await getAnswerFromAI(questionContent)
      const { answer, evidence, source, answersToInsert } = processAIResponse(data)

      // Set question ID for answers to insert
      const answersWithQuestionId = answersToInsert.map(a => ({
        ...a,
        question_id: questionId
      }))

      // Insert answers into answers table
      await saveAnswersToDatabase(answersWithQuestionId)

      // Update the question in the database
      await updateQuestionInDatabase(questionId, answer, evidence, source)

      // Update local state
      const updateItem = (item: EvidenceItem) =>
        item.id === questionId 
          ? { ...item, answer, evidence, source }
          : item

      setEvidenceData(prev => prev.map(updateItem))
      setFilteredEvidence(prev => prev.map(updateItem))

      toast({
        title: "Success!",
        description: "Answer retrieved and saved successfully",
      })
    } catch (error) {
      console.error('Error getting answer:', error)
      toast({
        title: "Error",
        description: "Failed to get answer. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoadingAnswers(prev => {
        const newSet = new Set(prev)
        newSet.delete(questionId)
        return newSet
      })
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    setDeletingQuestions(prev => new Set(prev).add(questionId))
    
    try {
      await deleteQuestion(questionId)

      // Update local state to remove the deleted question
      setEvidenceData(prev => prev.filter(item => item.id !== questionId))
      setFilteredEvidence(prev => prev.filter(item => item.id !== questionId))

      toast({
        title: "Success!",
        description: "Question deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting question:', error)
      toast({
        title: "Error",
        description: "Failed to delete question. Please try again.",
        variant: "destructive"
      })
    } finally {
      setDeletingQuestions(prev => {
        const newSet = new Set(prev)
        newSet.delete(questionId)
        return newSet
      })
    }
  }

  const handleDeleteAllQuestions = async () => {
    setIsDeletingAll(true)
    
    try {
      await deleteAllQuestions()

      // Clear local state
      setEvidenceData([])
      setFilteredEvidence([])

      toast({
        title: "Success!",
        description: "All questions deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting all questions:', error)
      toast({
        title: "Error",
        description: "Failed to delete all questions. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsDeletingAll(false)
    }
  }

  return {
    loadingAnswers,
    deletingQuestions,
    isDeletingAll,
    handleGetAnswer,
    handleDeleteQuestion,
    handleDeleteAllQuestions
  }
}
