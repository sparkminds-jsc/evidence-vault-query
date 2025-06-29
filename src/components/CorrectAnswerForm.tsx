
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { saveCorrectAnswer, submitCorrectAnswerToAPI, CorrectAnswerData } from "@/services/correctAnswerService"
import { Check, X } from "lucide-react"

interface CorrectAnswerFormProps {
  question: string
  evidence: string
  onCancel: () => void
  onSuccess: () => void
}

export function CorrectAnswerForm({ question, evidence, onCancel, onSuccess }: CorrectAnswerFormProps) {
  const [correctAnswer, setCorrectAnswer] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleSubmit = async () => {
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
        description: "Staff email not found",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      // Generate unique correctId
      const correctId = `correct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const data: CorrectAnswerData = {
        staffEmail: user.email,
        question,
        evidence,
        correctAnswer: correctAnswer.trim(),
        correctId
      }

      // Save to database first
      await saveCorrectAnswer(data)

      // Then submit to external API
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
    <div className="space-y-4 mt-4 p-4 border rounded-lg bg-muted/20">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Correct Answer</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Textarea
        placeholder="Enter the correct answer for this evidence..."
        value={correctAnswer}
        onChange={(e) => setCorrectAnswer(e.target.value)}
        disabled={isSubmitting}
        rows={3}
      />
      
      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !correctAnswer.trim()}
          size="sm"
        >
          {isSubmitting ? (
            "Submitting..."
          ) : (
            <>
              <Check className="h-4 w-4 mr-1" />
              Submit
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          size="sm"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
