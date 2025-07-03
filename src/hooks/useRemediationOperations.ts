
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
      removeLoadingRemediation(questionId)
    }
  }

  return { handleGetRemediation }
}
