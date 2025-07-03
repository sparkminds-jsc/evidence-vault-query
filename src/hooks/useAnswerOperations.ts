
import { useToast } from "@/hooks/use-toast"
import { EvidenceItem } from "@/types/evidence"
import { 
  getAnswerFromAI, 
  processAIResponse, 
  saveAnswersToDatabase, 
  updateQuestionInDatabase 
} from "@/services/aiService"
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
      const data = await getAnswerFromAI(questionContent, currentCustomer)
      const { answer, evidence, source, answersToInsert } = processAIResponse(data)

      // Set question ID for answers to insert
      const answersWithQuestionId = answersToInsert.map(a => ({
        ...a,
        question_id: questionId
      }))

      // Insert answers into answers table
      await saveAnswersToDatabase(answersWithQuestionId)

      // Update the question in the database
      await updateQuestionInDatabase(questionId, answer, evidence, source)

      // Update local state
      const updateItem = (item: EvidenceItem) =>
        item.id === questionId 
          ? { ...item, answer, evidence, source }
          : item

      setEvidenceData(prev => prev.map(updateItem))
      setFilteredEvidence(prev => prev.map(updateItem))

      toast({
        title: "Success!",
        description: "Evaluation retrieved and saved successfully",
      })
    } catch (error) {
      console.error('Error getting answer:', error)
      toast({
        title: "Error",
        description: "Failed to get evaluation. Please try again.",
        variant: "destructive"
      })
    } finally {
      removeLoadingAnswer(questionId)
    }
  }

  return { handleGetAnswer }
}
