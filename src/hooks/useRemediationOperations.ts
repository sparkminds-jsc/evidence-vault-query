
import { useToast } from "@/hooks/use-toast"
import { EvidenceItem } from "@/types/evidence"
import { 
  getRemediationFromAI,
  updateQuestionInDatabase 
} from "@/services/aiService"

export function useRemediationOperations(
  evidenceData: EvidenceItem[],
  setEvidenceData: React.Dispatch<React.SetStateAction<EvidenceItem[]>>,
  setFilteredEvidence: React.Dispatch<React.SetStateAction<EvidenceItem[]>>,
  addLoadingRemediation: (questionId: string) => void,
  removeLoadingRemediation: (questionId: string) => void
) {
  const { toast } = useToast()

  const handleGetRemediation = async (questionId: string, questionContent: string) => {
    addLoadingRemediation(questionId)
    
    try {
      // Find the current question to get the field audit findings, ISO control, and description
      const currentQuestion = evidenceData.find(item => item.id === questionId)
      const fromFieldAudit = currentQuestion?.field_audit_findings || ""
      const iso_27001_control = currentQuestion?.iso_27001_control || ""
      const description = currentQuestion?.description || ""
      
      // Call the remediation API
      const remediationResponse = await getRemediationFromAI(fromFieldAudit, iso_27001_control, description)
      
      // Update the question in the database - include rating if present
      await updateQuestionInDatabase(
        questionId, 
        undefined, // don't update answer
        undefined, // don't update evidence
        undefined, // don't update source
        remediationResponse.remediationGuidance,
        remediationResponse.controlEvaluation,
        undefined, // don't update document_evaluation_by_ai
        remediationResponse.rating // update rating if present
      )

      // Update local state - preserve all existing data including evidence
      const updateItem = (item: EvidenceItem) =>
        item.id === questionId 
          ? { 
              ...item, 
              remediation_guidance: remediationResponse.remediationGuidance,
              control_evaluation_by_ai: remediationResponse.controlEvaluation,
              control_rating_by_ai: remediationResponse.rating || item.control_rating_by_ai
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
      removeLoadingRemediation(questionId)
    }
  }

  return { handleGetRemediation }
}
