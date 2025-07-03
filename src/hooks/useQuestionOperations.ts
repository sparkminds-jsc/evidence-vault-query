
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { EvidenceItem } from "@/types/evidence"
import { 
  deleteQuestion, 
  deleteAllQuestions 
} from "@/services/questionService"
import { 
  getAnswerFromAI, 
  getRemediationFromAI,
  processAIResponse, 
  saveAnswersToDatabase, 
  updateQuestionInDatabase 
} from "@/services/aiService"

interface Customer {
  id: string
  email: string
  full_name: string
  status: string
}

export function useQuestionOperations(
  evidenceData: EvidenceItem[],
  setEvidenceData: React.Dispatch<React.SetStateAction<EvidenceItem[]>>,
  setFilteredEvidence: React.Dispatch<React.SetStateAction<EvidenceItem[]>>,
  currentCustomer: Customer | null
) {
  const [loadingAnswers, setLoadingAnswers] = useState<Set<string>>(new Set())
  const [loadingRemediations, setLoadingRemediations] = useState<Set<string>>(new Set())
  const [deletingQuestions, setDeletingQuestions] = useState<Set<string>>(new Set())
  const [isDeletingAll, setIsDeletingAll] = useState(false)
  const { toast } = useToast()

  const handleGetAnswer = async (questionId: string, questionContent: string) => {
    setLoadingAnswers(prev => new Set(prev).add(questionId))
    
    try {
      const data = await getAnswerFromAI(questionContent, currentCustomer)
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
        description: "Evaluation retrieved and saved successfully",
      })
    } catch (error) {
      console.error('Error getting answer:', error)
      toast({
        title: "Error",
        description: "Failed to get evaluation. Please try again.",
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

  const handleGetRemediation = async (questionId: string, questionContent: string) => {
    setLoadingRemediations(prev => new Set(prev).add(questionId))
    
    try {
      // Find the current question to get the field audit findings
      const currentQuestion = evidenceData.find(item => item.id === questionId)
      const fromFieldAudit = currentQuestion?.field_audit_findings || ""
      
      // Call the remediation API
      const remediationResponse = await getRemediationFromAI(fromFieldAudit)
      
      // Update the question in the database with both values
      await updateQuestionInDatabase(
        questionId, 
        null, 
        null, 
        null, 
        remediationResponse.remediationGuidance,
        remediationResponse.controlEvaluation
      )

      // Update local state
      const updateItem = (item: EvidenceItem) =>
        item.id === questionId 
          ? { 
              ...item, 
              remediation_guidance: remediationResponse.remediationGuidance,
              control_evaluation_by_ai: remediationResponse.controlEvaluation
            }
          : item

      setEvidenceData(prev => prev.map(updateItem))
      setFilteredEvidence(prev => prev.map(updateItem))

      toast({
        title: "Success!",
        description: "Remediation guidance and control evaluation retrieved successfully",
      })
    } catch (error) {
      console.error('Error getting remediation:', error)
      toast({
        title: "Error",
        description: "Failed to get remediation guidance. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoadingRemediations(prev => {
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
      await deleteAllQuestions(currentCustomer)

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
    loadingRemediations,
    deletingQuestions,
    isDeletingAll,
    handleGetAnswer,
    handleGetRemediation,
    handleDeleteQuestion,
    handleDeleteAllQuestions
  }
}
