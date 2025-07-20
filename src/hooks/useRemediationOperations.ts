
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
      // First auto-save to ensure any pending changes are saved
      const saveFunction = (window as any)[`saveEvidence_${questionId}`]
      if (saveFunction) {
        await saveFunction()
        // Wait for save to complete and state to update
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      // Get updated data from the state after save
      const currentQuestion = evidenceData.find(item => item.id === questionId)
      const fromFieldAuditInput = currentQuestion?.field_audit_findings || ""
      const iso_27001_control = currentQuestion?.iso_27001_control || ""
      const description = currentQuestion?.description || ""
      
      console.log('Current question field_audit_findings:', fromFieldAuditInput)
      console.log('Is field audit empty?', !fromFieldAuditInput || fromFieldAuditInput.trim() === "" || fromFieldAuditInput === "--")
      
      // Check if field audit findings is empty (only check actual empty values, not "--")
      if (!fromFieldAuditInput || fromFieldAuditInput.trim() === "" || fromFieldAuditInput === "--") {
        toast({
          title: "Missing Information",
          description: "Please input From Field Audit (findings).",
          variant: "destructive"
        })
        removeLoadingRemediation(questionId)
        return
      }
      
      // Call the remediation API with the saved data
      const remediationResponse = await getRemediationFromAI(fromFieldAuditInput, iso_27001_control, description)
      
      // Update the question in the database - include rating but preserve current field audit findings
      await updateQuestionInDatabase(
        questionId, 
        undefined, // don't update answer
        undefined, // don't update evidence
        undefined, // don't update source
        remediationResponse.remediationGuidance,
        remediationResponse.controlEvaluation,
        undefined, // don't update document_evaluation_by_ai
        remediationResponse.rating // update rating if present
        // Don't pass field_audit_findings to preserve current user input
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
