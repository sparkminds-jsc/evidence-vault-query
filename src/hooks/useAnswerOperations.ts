
import { useToast } from "@/hooks/use-toast"
import { EvidenceItem } from "@/types/evidence"
import { 
  getAnswerFromAI, 
  processAIResponse, 
  saveAnswersToDatabase, 
  updateQuestionInDatabase 
} from "@/services/aiService"
import { supabase } from "@/integrations/supabase/client"
import { Customer } from "./types/questionOperationsTypes"

export function useAnswerOperations(
  setEvidenceData: React.Dispatch<React.SetStateAction<EvidenceItem[]>>,
  setFilteredEvidence: React.Dispatch<React.SetStateAction<EvidenceItem[]>>,
  currentCustomer: Customer | null,
  addLoadingAnswer: (questionId: string) => void,
  removeLoadingAnswer: (questionId: string) => void
) {
  const { toast } = useToast()

  const handleGetAnswer = async (questionId: string, questionContent: string) => {
    addLoadingAnswer(questionId)
    
    try {
      console.log('Getting fresh evidence for question:', questionId, 'Customer:', currentCustomer?.email)
      
      // First, delete any existing answers for this question to ensure fresh data
      const { error: deleteError } = await supabase
        .from('answers')
        .delete()
        .eq('question_id', questionId)

      if (deleteError) {
        console.error('Error deleting existing answers:', deleteError)
      } else {
        console.log('Cleared existing answers for question:', questionId)
      }

      // Get fresh answer from AI
      const data = await getAnswerFromAI(questionContent, currentCustomer)
      const { answer, evidence, source, answersToInsert } = processAIResponse(data)

      // Set question ID for answers to insert
      const answersWithQuestionId = answersToInsert.map(a => ({
        ...a,
        question_id: questionId
      }))

      // Insert fresh answers into answers table
      await saveAnswersToDatabase(answersWithQuestionId)

      // Update the question in the database with fresh data
      await updateQuestionInDatabase(questionId, answer, evidence, source)

      // Update local state with fresh data
      const updateItem = (item: EvidenceItem) =>
        item.id === questionId 
          ? { ...item, answer, evidence, source }
          : item

      setEvidenceData(prev => prev.map(updateItem))
      setFilteredEvidence(prev => prev.map(updateItem))

      toast({
        title: "Success!",
        description: "Fresh evidence retrieved and saved successfully",
      })
    } catch (error) {
      console.error('Error getting fresh evidence:', error)
      toast({
        title: "Error",
        description: "Failed to get fresh evidence. Please try again.",
        variant: "destructive"
      })
    } finally {
      removeLoadingAnswer(questionId)
    }
  }

  return { handleGetAnswer }
}
