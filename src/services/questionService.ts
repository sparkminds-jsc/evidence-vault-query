
import { supabase } from "@/integrations/supabase/client"
import { EvidenceItem, AnswerData } from "@/types/evidence"
import { decodeFileName } from "@/utils/fileUtils"

export const fetchQuestionsFromDatabase = async (): Promise<EvidenceItem[]> => {
  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .order('question_id', { ascending: true })

  if (error) {
    console.error('Error fetching questions:', error)
    return []
  }

  // Fetch answers for each question
  const questionsWithAnswers = await Promise.all(
    questions.map(async (question) => {
      const { data: answers, error: answersError } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', question.id)

      if (answersError) {
        console.error('Error fetching answers for question:', question.id, answersError)
        return {
          id: question.id,
          question_id: question.question_id || "--",
          question: question.content,
          answer: question.answer || "--",
          evidence: question.evidence || "--",
          source: question.source === "api" ? "--" : (question.source || "--")
        }
      }

      // Generate source from unique file names with decoded names
      const uniqueFileNames = [...new Set(answers?.map(a => decodeFileName(a.file_name)) || [])]
      let source = question.source || "--"
      
      if (uniqueFileNames.length > 0) {
        source = uniqueFileNames.join(', ')
      } else if (question.source === "api") {
        source = "--"
      }

      return {
        id: question.id,
        question_id: question.question_id || "--",
        question: question.content,
        answer: question.answer || "--",
        evidence: question.evidence || "--",
        source: source
      }
    })
  )

  return questionsWithAnswers
}

export const deleteQuestion = async (questionId: string): Promise<void> => {
  // Delete answers first (they should cascade, but let's be explicit)
  const { error: answersError } = await supabase
    .from('answers')
    .delete()
    .eq('question_id', questionId)

  if (answersError) {
    console.error('Error deleting answers:', answersError)
  }

  // Delete the question
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId)

  if (error) {
    throw error
  }
}

export const deleteAllQuestions = async (): Promise<void> => {
  // Delete all answers first
  const { error: answersError } = await supabase
    .from('answers')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records

  if (answersError) {
    console.error('Error deleting all answers:', answersError)
  }

  // Delete all questions
  const { error } = await supabase
    .from('questions')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records

  if (error) {
    throw error
  }
}
