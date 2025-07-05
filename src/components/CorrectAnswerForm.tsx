
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { saveCorrectAnswer, submitCorrectAnswerToAPI, CorrectAnswerData } from "@/services/correctAnswerService"

interface CorrectAnswerFormProps {
  question: string
  evidence: string
  answerId: string
  onCancel: () => void
  onSuccess: () => void
}

export function CorrectAnswerForm({ question, evidence, answerId, onCancel, onSuccess }: CorrectAnswerFormProps) {
  const [correctAnswer, setCorrectAnswer] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!correctAnswer.trim()) {
      toast({
        title: "Error",
        description: "Please enter a correct answer",
        variant: "destructive"
      })
      return
    }

    if (!user?.email) {
      toast({
        title: "Error",
        description: "User email not found",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const correctId = crypto.randomUUID()
      
      const data: CorrectAnswerData = {
        staffEmail: user.email,
        question: question,
        evidence: evidence,
        correctAnswer: correctAnswer.trim(),
        correctId: correctId,
        answerId: answerId
      }

      // Save to database
      await saveCorrectAnswer(data)

      // Submit to API
      await submitCorrectAnswerToAPI(data)

      toast({
        title: "Success!",
        description: "Correct answer submitted successfully",
      })

      onSuccess()
    } catch (error) {
      console.error('Error submitting correct answer:', error)  
      toast({
        title: "Error",
        description: "Failed to submit correct answer. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
      <h4 className="font-medium text-sm text-blue-800 mb-3">
        Provide Correct Answer
      </h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          placeholder="Enter the correct answer for this evidence..."
          className="min-h-[100px] bg-white"
          disabled={isSubmitting}
        />
        <div className="flex gap-2">
          <Button 
            type="submit" 
            size="sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
