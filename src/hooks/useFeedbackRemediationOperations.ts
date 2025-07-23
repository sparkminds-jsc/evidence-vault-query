
import { useState } from "react"
import { EvidenceItem } from "@/types/evidence"
import { getFeedbackRemediationFromAI } from "@/services/aiService"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"

export function useFeedbackRemediationOperations(
  evidenceData: EvidenceItem[],
  setEvidenceData: React.Dispatch<React.SetStateAction<EvidenceItem[]>>,
  setFilteredEvidence: React.Dispatch<React.SetStateAction<EvidenceItem[]>>,
  addLoadingFeedbackRemediation: (questionId: string) => void,
  removeLoadingFeedbackRemediation: (questionId: string) => void
) {
  const { toast } = useToast()
  const { user } = useAuth()

  const handleGetFeedbackRemediation = async (questionId: string, silent = false) => {
    try {
      addLoadingFeedbackRemediation(questionId)
      
      const question = evidenceData.find(q => q.id === questionId)
      if (!question) {
        throw new Error("Question not found")
      }

      // Get data from the question fields
      const fromFieldAudit = question.field_audit_findings || ""
      const controlEvaluation = question.control_evaluation_by_ai || ""
      const remediationGuidance = question.remediation_guidance || ""
      const feedbackRemediation = question.feedback_for_remediation || ""
      const id = question.id
      const staffEmail = user?.email || ""

      console.log('Getting feedback remediation for question:', questionId)
      console.log('Data:', { fromFieldAudit, controlEvaluation, remediationGuidance, feedbackRemediation, id, staffEmail })

      const response = await getFeedbackRemediationFromAI(
        fromFieldAudit,
        controlEvaluation,
        remediationGuidance,
        feedbackRemediation,
        id,
        staffEmail,
        question.control_rating_by_ai,
        question.feedback_for_control_rating
      )

      console.log('Feedback remediation response:', response)

      if (!silent) {
        toast({
          title: "Success!",
          description: "Feedback remediation completed successfully",
        })
      }

    } catch (error) {
      console.error('Error getting feedback remediation:', error)
      toast({
        title: "Error",
        description: "Failed to get feedback remediation. Please try again.",
        variant: "destructive"
      })
    } finally {
      removeLoadingFeedbackRemediation(questionId)
    }
  }

  return {
    handleGetFeedbackRemediation
  }
}
