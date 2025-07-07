
import { useToast } from "@/hooks/use-toast"
import { EvidenceItem } from "@/types/evidence"
import { 
  getEvaluationFromAI,
  updateQuestionInDatabase 
} from "@/services/aiService"

export function useEvaluationOperations(
  evidenceData: EvidenceItem[],
  setEvidenceData: React.Dispatch<React.SetStateAction<EvidenceItem[]>>,
  setFilteredEvidence: React.Dispatch<React.SetStateAction<EvidenceItem[]>>,
  addLoadingEvaluation: (questionId: string) => void,
  removeLoadingEvaluation: (questionId: string) => void
) {
  const { toast } = useToast()

  const handleGetEvaluation = async (questionId: string) => {
    console.log('Starting evaluation for question:', questionId)
    addLoadingEvaluation(questionId)
    
    try {
      // Find the current question to get the required data
      const currentQuestion = evidenceData.find(item => item.id === questionId)
      if (!currentQuestion) {
        throw new Error('Question not found')
      }

      console.log('Current question data:', currentQuestion)

      const description = currentQuestion.description || ""
      const question = currentQuestion.question || ""
      const evidences = currentQuestion.evidence || ""
      
      console.log('Calling evaluation API with:', { description, question, evidences })
      
      // Call the evaluation API
      const evaluationResponse = await getEvaluationFromAI(description, question, evidences)
      
      console.log('Evaluation response received:', evaluationResponse)
      
      // Update the question in the database - only update document_evaluation_by_ai field
      await updateQuestionInDatabase(
        questionId, 
        undefined, // don't update answer
        undefined, // don't update evidence
        undefined, // don't update source
        undefined, // don't update remediation_guidance
        undefined, // don't update control_evaluation_by_ai
        evaluationResponse.documentEvaluation // only update document_evaluation_by_ai
      )

      // Update local state - preserve all existing data including evidence
      const updateItem = (item: EvidenceItem) =>
        item.id === questionId 
          ? { 
              ...item, 
              document_evaluation_by_ai: evaluationResponse.documentEvaluation
            }
          : item

      setEvidenceData(prev => prev.map(updateItem))
      setFilteredEvidence(prev => prev.map(updateItem))

      toast({
        title: "Success!",
        description: "Document evaluation retrieved successfully",
      })
    } catch (error) {
      console.error('Error getting evaluation:', error)
      toast({
        title: "Error",
        description: `Failed to get document evaluation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      })
    } finally {
      removeLoadingEvaluation(questionId)
    }
  }

  return { handleGetEvaluation }
}
