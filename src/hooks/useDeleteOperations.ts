
import { useToast } from "@/hooks/use-toast"
import { EvidenceItem } from "@/types/evidence"
import { 
  deleteQuestion, 
  deleteAllQuestions 
} from "@/services/questionService"
import { Customer } from "./types/questionOperationsTypes"

export function useDeleteOperations(
  setEvidenceData: React.Dispatch<React.SetStateAction<EvidenceItem[]>>,
  setFilteredEvidence: React.Dispatch<React.SetStateAction<EvidenceItem[]>>,
  currentCustomer: Customer | null,
  addDeletingQuestion: (questionId: string) => void,
  removeDeletingQuestion: (questionId: string) => void,
  setIsDeletingAll: (value: boolean) => void
) {
  const { toast } = useToast()

  const handleDeleteQuestion = async (questionId: string) => {
    addDeletingQuestion(questionId)
    
    try {
      await deleteQuestion(questionId)

      // Update local state to remove the deleted question
      setEvidenceData(prev => prev.filter(item => item.id !== questionId))
      setFilteredEvidence(prev => prev.filter(item => item.id !== questionId))

      toast({
        title: "Success!",
        description: "Question deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting question:', error)
      toast({
        title: "Error",
        description: "Failed to delete question. Please try again.",
        variant: "destructive"
      })
    } finally {
      removeDeletingQuestion(questionId)
    }
  }

  const handleDeleteAllQuestions = async () => {
    setIsDeletingAll(true)
    
    try {
      await deleteAllQuestions(currentCustomer)

      // Clear local state
      setEvidenceData([])
      setFilteredEvidence([])

      toast({
        title: "Success!",
        description: "All questions deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting all questions:', error)
      toast({
        title: "Error",
        description: "Failed to delete all questions. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsDeletingAll(false)
    }
  }

  return { handleDeleteQuestion, handleDeleteAllQuestions }
}
