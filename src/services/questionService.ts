
import { supabase } from "@/integrations/supabase/client"
import { EvidenceItem, AnswerData } from "@/types/evidence"
import { decodeFileName } from "@/utils/fileUtils"

interface Customer {
  id: string
  email: string
  full_name: string
  status: string
}

export const fetchQuestionsFromDatabase = async (currentCustomer: Customer | null): Promise<EvidenceItem[]> => {
  if (!currentCustomer) {
    return []
  }

  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .eq('customer_id', currentCustomer.id)
    .order('question_id', { ascending: true })

  if (error) {
    console.error('Error fetching questions:', error)
    return []
  }

  if (!questions) {
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
          source: question.source === "api" ? "--" : (question.source || "--"),
          iso_27001_control: question.iso_27001_control || "--",
          description: question.description || "--",
          feedback_to_ai: question.feedback_to_ai || "--",
          field_audit_findings: question.field_audit_findings || "--",
          control_evaluation_by_ai: question.control_evaluation_by_ai || "--",
          remediation_guidance: question.remediation_guidance || "--",
          feedback_for_remediation: question.feedback_for_remediation || "--",
          document_evaluation_by_ai: question.document_evaluation_by_ai || "--"
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
        source: source,
        iso_27001_control: question.iso_27001_control || "--",
        description: question.description || "--",
        feedback_to_ai: question.feedback_to_ai || "--",
        field_audit_findings: question.field_audit_findings || "--",
        control_evaluation_by_ai: question.control_evaluation_by_ai || "--",
        remediation_guidance: question.remediation_guidance || "--",
        feedback_for_remediation: question.feedback_for_remediation || "--",
        document_evaluation_by_ai: question.document_evaluation_by_ai || "--"
      }
    })
  )

  return questionsWithAnswers
}

export const deleteQuestion = async (questionId: string): Promise<void> => {
  // Delete correct answers first
  const { error: correctAnswersError } = await supabase
    .from('correct_answers')
    .delete()
    .eq('correct_id', questionId)

  if (correctAnswersError) {
    console.error('Error deleting correct answers:', correctAnswersError)
  }

  // Delete answers
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

export const deleteAllQuestions = async (currentCustomer: Customer | null): Promise<void> => {
  if (!currentCustomer) {
    return
  }

  // Get all question IDs for the current customer
  const { data: questions, error: fetchError } = await supabase
    .from('questions')
    .select('id')
    .eq('customer_id', currentCustomer.id)

  if (fetchError) {
    console.error('Error fetching questions for deletion:', fetchError)
    throw fetchError
  }

  const questionIds = questions?.map(q => q.id) || []

  if (questionIds.length === 0) {
    return
  }

  // Delete all correct answers for these questions
  const { error: correctAnswersError } = await supabase
    .from('correct_answers')
    .delete()
    .in('correct_id', questionIds)

  if (correctAnswersError) {
    console.error('Error deleting all correct answers:', correctAnswersError)
  }

  // Delete all answers for these questions
  const { error: answersError } = await supabase
    .from('answers')
    .delete()
    .in('question_id', questionIds)

  if (answersError) {
    console.error('Error deleting all answers:', answersError)
  }

  // Delete all questions for the current customer
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('customer_id', currentCustomer.id)

  if (error) {
    throw error
  }
}
