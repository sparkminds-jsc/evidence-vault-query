import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Eye, FileText, Edit, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { CorrectAnswerForm } from "./CorrectAnswerForm"
import { useAuth } from "@/contexts/AuthContext"

interface EvidenceViewDialogProps {
  questionId: string
  questionDisplayId: string
}

interface AnswerData {
  id: string
  page_content: string
  file_name: string
}

interface CorrectAnswerData {
  id: string
  staff_email: string
  correct_answer: string
  created_at: string
}

const decodeFileName = (fileName: string): string => {
  return decodeURIComponent(fileName.replace(/%20/g, ' '))
}

export function EvidenceViewDialog({ questionId, questionDisplayId }: EvidenceViewDialogProps) {
  const [answers, setAnswers] = useState<AnswerData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [correctingAnswerId, setCorrectingAnswerId] = useState<string | null>(null)
  const [questionContent, setQuestionContent] = useState("")
  const [correctAnswers, setCorrectAnswers] = useState<{[key: string]: CorrectAnswerData[]}>({})
  const { user } = useAuth()

  const fetchAnswers = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', questionId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching answers:', error)
        return
      }

      setAnswers(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchQuestionContent = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('content')
        .eq('id', questionId)
        .single()

      if (error) {
        console.error('Error fetching question:', error)
        return
      }

      setQuestionContent(data?.content || "")
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const fetchCorrectAnswers = async () => {
    if (!user?.email || !questionContent) return
    
    try {
      // Only fetch correct answers for the current user's evidence
      const { data, error } = await supabase
        .from('correct_answers')
        .select('*')
        .eq('question', questionContent)
        .eq('staff_email', user.email)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching correct answers:', error)
        return
      }

      // Group correct answers by evidence, but only for current user
      const groupedAnswers: {[key: string]: CorrectAnswerData[]} = {}
      data?.forEach(answer => {
        if (!groupedAnswers[answer.evidence]) {
          groupedAnswers[answer.evidence] = []
        }
        groupedAnswers[answer.evidence].push(answer)
      })

      setCorrectAnswers(groupedAnswers)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  useEffect(() => {
    if (questionId) {
      fetchAnswers()
      fetchQuestionContent()
    }
  }, [questionId])

  useEffect(() => {
    if (questionContent && user?.email) {
      fetchCorrectAnswers()
    }
  }, [questionContent, user?.email])

  const getDialogTitle = () => {
    if (answers.length > 0) {
      const decodedFileName = decodeFileName(answers[0].file_name)
      return `Evidence ${questionDisplayId}: ${decodedFileName}`
    }
    return `Evidence ${questionDisplayId}: No evidence available`
  }

  const handleCorrectClick = (answerId: string) => {
    setCorrectingAnswerId(answerId)
  }

  const handleCorrectCancel = () => {
    setCorrectingAnswerId(null)
  }

  const handleCorrectSuccess = () => {
    setCorrectingAnswerId(null)
    // Refresh correct answers after successful submission
    fetchCorrectAnswers()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            Detailed evidence extracted from documents for this security question
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[70vh] w-full">
          <div className="p-4 space-y-6">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Loading evidence...</p>
              </div>
            ) : answers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No evidence available</p>
                <p className="text-sm">No supporting evidence was found for this question.</p>
              </div>
            ) : (
              answers.map((answer, index) => {
                const decodedFileName = decodeFileName(answer.file_name)
                const isCorrectingThis = correctingAnswerId === answer.id
                const answersForEvidence = correctAnswers[answer.page_content] || []
                
                return (
                  <div key={answer.id} className="border rounded-lg p-4 bg-muted/20">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-sm text-primary">
                          Evidence {index + 1}: {decodedFileName}
                        </h3>
                      </div>
                      {!isCorrectingThis && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCorrectClick(answer.id)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Correct Answer
                        </Button>
                      )}
                    </div>
                    <div className="text-sm leading-relaxed text-foreground bg-background/50 p-3 rounded border-l-4 border-l-primary/30">
                      {answer.page_content}
                    </div>
                    
                    {/* Show correct answers for this evidence - only from current user */}
                    {answersForEvidence.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="font-medium text-sm flex items-center gap-2 text-green-700">
                          <CheckCircle className="h-4 w-4" />
                          Your Correct Answer{answersForEvidence.length > 1 ? 's' : ''}:
                        </h4>
                        {answersForEvidence.map((correctAnswer) => (
                          <div key={correctAnswer.id} className="bg-green-50 border border-green-200 rounded p-3">
                            <p className="text-sm text-green-800 leading-relaxed">
                              {correctAnswer.correct_answer}
                            </p>
                            <div className="mt-2 text-xs text-green-600">
                              Submitted by: {correctAnswer.staff_email} • {new Date(correctAnswer.created_at).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {isCorrectingThis && (
                      <CorrectAnswerForm
                        question={questionContent}
                        evidence={answer.page_content}
                        onCancel={handleCorrectCancel}
                        onSuccess={handleCorrectSuccess}
                      />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
