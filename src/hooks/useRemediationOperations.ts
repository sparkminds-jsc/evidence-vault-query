
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
      // Get form data directly from window state without auto-saving first
      const formDataGetter = (window as any)[`getFormData_${questionId}`]
      let fromFieldAuditInput = ""
      
      if (formDataGetter) {
        const formData = formDataGetter()
        fromFieldAuditInput = formData.field_audit_findings || ""
      }
      
      // Fallback: get from current evidenceData state
      if (!fromFieldAuditInput || fromFieldAuditInput === "--") {
        const currentQuestion = evidenceData.find(item => item.id === questionId)
        fromFieldAuditInput = currentQuestion?.field_audit_findings || ""
      }
      
      console.log('From Field Audit input value:', fromFieldAuditInput)
      
      // Check if field audit findings is empty
      if (!fromFieldAuditInput || fromFieldAuditInput.trim() === "" || fromFieldAuditInput === "--") {
        toast({
          title: "Missing Information",
          description: "Please input From Field Audit (findings).",
          variant: "destructive"
        })
        removeLoadingRemediation(questionId)
        return
      }
      // Get ISO control and description from current question
      const currentQuestion = evidenceData.find(item => item.id === questionId)
      const iso_27001_control = currentQuestion?.iso_27001_control || ""
      const description = currentQuestion?.description || ""
      
      // Auto-save the form data silently before API call
      const saveFunction = (window as any)[`saveEvidence_${questionId}`]
      if (saveFunction) {
        // Save silently without showing toast
        const originalToast = (window as any).toast
        ;(window as any).toast = () => {} // temporarily disable toast
        try {
          await saveFunction()
        } finally {
          ;(window as any).toast = originalToast // restore toast
        }
      }
      
      // Call the remediation API
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
