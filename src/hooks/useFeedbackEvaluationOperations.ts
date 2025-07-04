
import { useState } from "react"
import { EvidenceItem } from "@/types/evidence"
import { getFeedbackEvaluationFromAI } from "@/services/aiService"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"

export function useFeedbackEvaluationOperations(
  evidenceData: EvidenceItem[],
  setEvidenceData: React.Dispatch<React.SetStateAction<EvidenceItem[]>>,
  setFilteredEvidence: React.Dispatch<React.SetStateAction<EvidenceItem[]>>,
  addLoadingFeedbackEvaluation: (questionId: string) => void,
  removeLoadingFeedbackEvaluation: (questionId: string) => void
) {
  const { toast } = useToast()
  const { user } = useAuth()

  const handleGetFeedbackEvaluation = async (questionId: string) => {
    try {
      addLoadingFeedbackEvaluation(questionId)
      
      const question = evidenceData.find(q => q.id === questionId)
      if (!question) {
        throw new Error("Question not found")
      }

      // Get evidence from the evidence field
      const evidences = question.evidence || ""
      const description = question.description || ""
      const questionText = question.question || ""
      const feedbackEvaluation = question.feedback_to_ai || ""
      const id = question.id
      const staffEmail = user?.email || ""

      console.log('Getting feedback evaluation for question:', questionId)
      console.log('Data:', { description, questionText, evidences, feedbackEvaluation, id, staffEmail })

      const response = await getFeedbackEvaluationFromAI(
        description,
        questionText,
        evidences,
        feedbackEvaluation,
        id,
        staffEmail
      )

      console.log('Feedback evaluation response:', response)

      toast({
        title: "Success!",
        description: "Feedback evaluation completed successfully",
      })

    } catch (error) {
      console.error('Error getting feedback evaluation:', error)
      toast({
        title: "Error",
        description: "Failed to get feedback evaluation. Please try again.",
        variant: "destructive"
      })
    } finally {
      removeLoadingFeedbackEvaluation(questionId)
    }
  }

  return {
    handleGetFeedbackEvaluation
  }
}
