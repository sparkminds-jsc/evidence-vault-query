
import { useToast } from "@/hooks/use-toast"
import { EvidenceItem } from "@/types/evidence"
import { 
  getEvaluationFromAI,
  updateQuestionInDatabase 
} from "@/services/aiService"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

export function useEvaluationOperations(
  evidenceData: EvidenceItem[],
  setEvidenceData: React.Dispatch<React.SetStateAction<EvidenceItem[]>>,
  setFilteredEvidence: React.Dispatch<React.SetStateAction<EvidenceItem[]>>,
  addLoadingEvaluation: (questionId: string) => void,
  removeLoadingEvaluation: (questionId: string) => void
) {
  const { toast } = useToast()
  const { user } = useAuth()

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

      // Get AI command for evaluation
      let aiCommandGetEvaluation = ""
      if (user) {
        try {
          const { data: aiCommands } = await supabase
            .from('ai_commands')
            .select('evaluation_command')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          
          aiCommandGetEvaluation = aiCommands?.evaluation_command || ""
        } catch (error) {
          console.error('Error fetching AI commands:', error)
        }
      }

      const description = currentQuestion.description || ""
      const question = currentQuestion.question || ""
      const evidences = currentQuestion.evidence || ""
      const iso_27001_control = currentQuestion.iso_27001_control || ""
      
      console.log('Calling evaluation API with:', { description, question, evidences, iso_27001_control, aiCommandGetEvaluation })
      
      // Call the evaluation API
      const evaluationResponse = await getEvaluationFromAI(description, question, evidences, iso_27001_control, aiCommandGetEvaluation)
      
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
