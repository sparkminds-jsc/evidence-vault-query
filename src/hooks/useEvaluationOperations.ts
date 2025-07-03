
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
    addLoadingEvaluation(questionId)
    
    try {
      // Find the current question to get the required data
      const currentQuestion = evidenceData.find(item => item.id === questionId)
      if (!currentQuestion) {
        throw new Error('Question not found')
      }

      const description = currentQuestion.description || ""
      const question = currentQuestion.question || ""
      const evidences = currentQuestion.evidence || ""
      
      // Call the evaluation API
      const evaluationResponse = await getEvaluationFromAI(description, question, evidences)
      
      // Update the question in the database
      await updateQuestionInDatabase(
        questionId, 
        null, 
        null, 
        null,
        null,
        null,
        evaluationResponse.documentEvaluation
      )

      // Update local state
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
        description: "Failed to get document evaluation. Please try again.",
        variant: "destructive"
      })
    } finally {
      removeLoadingEvaluation(questionId)
    }
  }

  return { handleGetEvaluation }
}
