import { supabase } from "@/integrations/supabase/client"
import { AnswerData } from "@/types/evidence"
import { decodeFileName } from "@/utils/fileUtils"

interface AIResponse {
  result: string
  output?: string
}

interface RemediationResponse {
  controlEvaluation: string
  remediationGuidance: string
  rating?: string
}

interface EvaluationResponse {
  documentEvaluation: string
  rating?: string
}

interface FeedbackEvaluationResponse {
  result: string
}

interface FeedbackRemediationResponse {
  result: string
}

interface Customer {
  id: string
  email: string
  full_name: string
  status: string
}

export const getAnswerFromAI = async (questionContent: string, currentCustomer: Customer | null): Promise<AIResponse> => {
  // Use the current customer's email as userId, fallback to '001' if no customer
  const userId = currentCustomer?.email || '001'
  
  console.log('Getting answer from AI for user:', userId)
  
  const response = await fetch(
    `https://abilene.sparkminds.net/webhook/query?prompt=${encodeURIComponent(questionContent)}&userId=${encodeURIComponent(userId)}`,
    {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      }
    }
  )

  if (!response.ok) {
    throw new Error('Failed to get answer from API')
  }

  const result = await response.json()
  console.log('AI Response for user', userId, ':', result)
  
  return result
}

export const getRemediationFromAI = async (fromFieldAudit: string, iso_27001_control?: string, description?: string): Promise<RemediationResponse> => {
  const response = await fetch(
    'https://abilene.sparkminds.net/webhook/remediation',
    {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fromFieldAudit: fromFieldAudit,
        iso_27001_control: iso_27001_control,
        description: description
      })
    }
  )

  if (!response.ok) {
    throw new Error('Failed to get remediation from API')
  }

  const data = await response.json()
  console.log('Raw remediation API response:', data)
  
  // Handle the actual response format based on console logs
  if (Array.isArray(data) && data.length > 0) {
    const remediationData = data[0]
    if (remediationData.controlEvaluation && remediationData.remediationGuidance) {
      console.log('Extracted remediation data:', remediationData)
      return {
        controlEvaluation: remediationData.controlEvaluation,
        remediationGuidance: remediationData.remediationGuidance,
        rating: remediationData.rating
      }
    }
  }
  
  // Final fallback - log the entire response structure for debugging
  console.error('Invalid response format from remediation API. Full response:', JSON.stringify(data, null, 2))
  throw new Error('Invalid response format from remediation API')
}

export const getEvaluationFromAI = async (description: string, question: string, evidences: string, iso_27001_control?: string): Promise<EvaluationResponse> => {
  console.log('Calling evaluation API with:', { description, question, evidences, iso_27001_control })
  
  const response = await fetch(
    'https://abilene.sparkminds.net/webhook/evaluation',
    {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: description,
        question: question,
        evidences: evidences,
        iso_27001_control: iso_27001_control
      })
    }
  )

  if (!response.ok) {
    throw new Error('Failed to get evaluation from API')
  }

  const data = await response.json()
  console.log('Raw API response:', data)
  
  // Handle the newest response format with nested structure
  if (Array.isArray(data) && data.length > 0) {
    // First check the newest format: data[0].response.body[0].message.content
    if (data[0].response?.body && Array.isArray(data[0].response.body) && 
        data[0].response.body.length > 0 && data[0].response.body[0].message?.content) {
      const documentEvaluation = data[0].response.body[0].message.content
      console.log('Extracted documentEvaluation from newest format:', documentEvaluation)
      return {
        documentEvaluation: documentEvaluation,
        rating: data[0].rating
      }
    }
    
    // Fallback to previous format: data[0].message.content
    if (data[0].message?.content) {
      const documentEvaluation = data[0].message.content
      console.log('Extracted documentEvaluation from previous format:', documentEvaluation)
      return {
        documentEvaluation: documentEvaluation,
        rating: data[0].rating
      }
    }
  }
  
  // Final fallback - log the entire response structure for debugging
  console.error('Invalid response format from evaluation API. Full response:', JSON.stringify(data, null, 2))
  throw new Error('Invalid response format from evaluation API')
}

export const getFeedbackEvaluationFromAI = async (
  description: string, 
  question: string, 
  evidences: string, 
  feedbackEvaluation: string,
  id: string,
  staffEmail: string
): Promise<FeedbackEvaluationResponse> => {
  console.log('Calling feedback evaluation API with:', { description, question, evidences, feedbackEvaluation, id, staffEmail })
  
  const response = await fetch(
    'https://abilene.sparkminds.net/webhook/feedbackEvaluation',
    {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: description,
        question: question,
        evidences: evidences,
        feedbackEvaluation: feedbackEvaluation,
        id: id,
        staffEmail: staffEmail
      })
    }
  )

  if (!response.ok) {
    throw new Error('Failed to get feedback evaluation from API')
  }

  const data = await response.json()
  console.log('Raw feedback evaluation API response:', data)
  
  return {
    result: data.result || "Feedback evaluation completed"
  }
}

export const getFeedbackRemediationFromAI = async (
  fromFieldAudit: string,
  controlEvaluation: string,
  remediationGuidance: string,
  feedbackRemediation: string,
  id: string,
  staffEmail: string,
  controlRatingByAI?: string,
  feedbackForControlRating?: string
): Promise<FeedbackRemediationResponse> => {
  console.log('Calling feedback remediation API with:', { fromFieldAudit, controlEvaluation, remediationGuidance, feedbackRemediation, id, staffEmail, controlRatingByAI, feedbackForControlRating })
  
  const response = await fetch(
    'https://abilene.sparkminds.net/webhook/feedbackRemediation',
    {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fromFieldAudit: fromFieldAudit,
        controlEvaluation: controlEvaluation,
        remediationGuidance: remediationGuidance,
        feedbackRemediation: feedbackRemediation,
        id: id,
        staffEmail: staffEmail,
        control_rating_by_AI: controlRatingByAI,
        feedback_for_control_rating: feedbackForControlRating
      })
    }
  )

  if (!response.ok) {
    throw new Error('Failed to get feedback remediation from API')
  }

  const data = await response.json()
  console.log('Raw feedback remediation API response:', data)
  
  return {
    result: data.result || "Feedback remediation completed"
  }
}

export const processAIResponse = (data: AIResponse): { answer: string; evidence: string; source: string; answersToInsert: AnswerData[] } => {
  console.log('Processing AI Response:', data)
  
  // Extract result for answer column
  const answer = data.result || "--"
  
  // Parse evidence and source from output if result is "Yes"
  let evidence = "--"
  let source = "--"
  const answersToInsert: AnswerData[] = []
  
  // Handle when no evidence is found (result is "No")
  if (data.result === "No" && data.output === "No Data Found") {
    evidence = "No Evidence Found"
    source = "--"
    return { answer, evidence, source, answersToInsert }
  }
  
  if (data.result === "Yes" && data.output) {
    try {
      console.log('Raw output from API:', data.output)
      
      // Parse the JSON string from output
      const parsedOutput = JSON.parse(data.output)
      console.log('Parsed output:', parsedOutput)
      
      if (Array.isArray(parsedOutput)) {
        // Clear any existing evidence and rebuild from fresh API response only
        const evidenceList = parsedOutput
          .map((item: any) => item.pageContent)
          .filter((content: string) => content && content.trim().length > 0)
        evidence = evidenceList.length > 0 ? evidenceList.map(content => `• ${content}`).join('\n') : "--"
        
        // Extract file_name from metadata for source (as comma-separated list with decoded names)
        const sourceList = parsedOutput
          .map((item: any) => item.metadata?.file_name)
          .filter((fileName: string) => fileName && fileName.trim().length > 0)
          .map((fileName: string) => decodeFileName(fileName))
        source = sourceList.length > 0 ? [...new Set(sourceList)].join(', ') : "--"
        
        // Prepare answers to insert into answers table - only from this fresh API call
        parsedOutput.forEach((item: any) => {
          if (item.pageContent && item.metadata?.file_name) {
            answersToInsert.push({
              id: crypto.randomUUID(),
              question_id: '', // Will be set by caller
              page_content: item.pageContent,
              file_name: item.metadata.file_name
            })
          }
        })
        
        console.log('Fresh evidence extracted:', evidence)
        console.log('Fresh source extracted:', source)
        console.log('Fresh answers to insert:', answersToInsert)
      }
    } catch (parseError) {
      console.error('Error parsing output JSON:', parseError)
      console.log('Raw output that failed to parse:', data.output)
      
      // Fallback: try to extract data using regex if JSON parsing fails
      try {
        const pageContentMatches = data.output.match(/"pageContent"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/g)
        const fileNameMatches = data.output.match(/"file_name"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/g)
        
        if (pageContentMatches && fileNameMatches) {
          pageContentMatches.forEach((match: string, index: number) => {
            const content = match.match(/"pageContent"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/)?.[1]
            const fileName = fileNameMatches[index]?.match(/"file_name"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/)?.[1]
            
            if (content && fileName) {
              answersToInsert.push({
                id: crypto.randomUUID(),
                question_id: '', // Will be set by caller
                page_content: content.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"'),
                file_name: fileName
              })
            }
          })
          
          if (answersToInsert.length > 0) {
            evidence = answersToInsert.map(a => `• ${a.page_content}`).join('\n')
            source = [...new Set(answersToInsert.map(a => decodeFileName(a.file_name)))].join(', ')
          }
        }
        
        console.log('Fallback extracted evidence:', evidence)
        console.log('Fallback extracted source:', source)
      } catch (fallbackError) {
        console.error('Fallback extraction also failed:', fallbackError)
      }
    }
  }

  return { answer, evidence, source, answersToInsert }
}

export const saveAnswersToDatabase = async (answersToInsert: AnswerData[]): Promise<void> => {
  if (answersToInsert.length > 0) {
    console.log('Saving fresh answers to database:', answersToInsert)
    
    const { error: answersError } = await supabase
      .from('answers')
      .insert(answersToInsert.map(a => ({
        question_id: a.question_id,
        page_content: a.page_content,
        file_name: a.file_name
      })))

    if (answersError) {
      console.error('Error inserting answers:', answersError)
    } else {
      console.log('Successfully saved fresh answers to database')
    }
  }
}

export const updateQuestionInDatabase = async (
  questionId: string, 
  answer?: string | null, 
  evidence?: string | null, 
  source?: string | null,
  remediationGuidance?: string | null,
  controlEvaluationByAi?: string | null,
  documentEvaluationByAi?: string | null,
  controlRatingByAi?: string | null,
  fieldAuditFindings?: string | null
) => {
  const updateData: any = {}
  
  if (answer !== undefined) updateData.answer = answer
  if (evidence !== undefined) updateData.evidence = evidence
  if (source !== undefined) updateData.source = source
  if (remediationGuidance !== undefined) updateData.remediation_guidance = remediationGuidance
  if (controlEvaluationByAi !== undefined) updateData.control_evaluation_by_ai = controlEvaluationByAi
  if (documentEvaluationByAi !== undefined) updateData.document_evaluation_by_ai = documentEvaluationByAi
  if (controlRatingByAi !== undefined) updateData.control_rating_by_ai = controlRatingByAi
  if (fieldAuditFindings !== undefined) updateData.field_audit_findings = fieldAuditFindings

  console.log('Updating question with data:', updateData)

  const { error } = await supabase
    .from('questions')
    .update(updateData)
    .eq('id', questionId)

  if (error) {
    console.error('Error updating question:', error)
    throw error
  }

  console.log('Question updated successfully')
}
