
import { supabase } from "@/integrations/supabase/client"

export interface CorrectAnswerData {
  staffEmail: string
  question: string
  evidence: string
  correctAnswer: string
  correctId: string
}

export const saveCorrectAnswer = async (data: CorrectAnswerData): Promise<void> => {
  const { error } = await supabase
    .from('correct_answers')
    .insert({
      staff_email: data.staffEmail,
      question: data.question,
      evidence: data.evidence,
      correct_answer: data.correctAnswer,
      correct_id: data.correctId
    })

  if (error) {
    throw error
  }
}

export const submitCorrectAnswerToAPI = async (data: CorrectAnswerData): Promise<void> => {
  const response = await fetch('https://abilene.sparkminds.net/webhook/correct', {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Origin': window.location.origin
    },
    body: JSON.stringify({
      staffEmail: data.staffEmail,
      question: data.question,
      evidence: data.evidence,
      correctAnswer: data.correctAnswer,
      correctId: data.correctId
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('API Error:', response.status, errorText)
    throw new Error(`Failed to submit correct answer to API: ${response.status} ${response.statusText}`)
  }
}
