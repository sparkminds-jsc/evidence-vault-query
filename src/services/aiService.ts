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
}

interface EvaluationResponse {
  documentEvaluation: string
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
  const userId = currentCustomer?.email || '001'
  
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

  return await response.json()
}

export const getRemediationFromAI = async (fromFieldAudit: string): Promise<RemediationResponse> => {
  const response = await fetch(
    'https://abilene.sparkminds.net/webhook/remediation',
    {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fromFieldAudit: fromFieldAudit
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
        remediationGuidance: remediationData.remediationGuidance
      }
    }
  }
  
  // Final fallback - log the entire response structure for debugging
  console.error('Invalid response format from remediation API. Full response:', JSON.stringify(data, null, 2))
  throw new Error('Invalid response format from remediation API')
}

export const getEvaluationFromAI = async (description: string, question: string, evidences: string): Promise<EvaluationResponse> => {
  console.log('Calling evaluation API with:', { description, question, evidences })
  
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
        evidences: evidences
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
        documentEvaluation: documentEvaluation
      }
    }
    
    // Fallback to previous format: data[0].message.content
    if (data[0].message?.content) {
      const documentEvaluation = data[0].message.content
      console.log('Extracted documentEvaluation from previous format:', documentEvaluation)
      return {
        documentEvaluation: documentEvaluation
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
  staffEmail: string
): Promise<FeedbackRemediationResponse> => {
  console.log('Calling feedback remediation API with:', { fromFieldAudit, controlEvaluation, remediationGuidance, feedbackRemediation, id, staffEmail })
  
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
        staffEmail: staffEmail
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
  console.log('API Response:', data)
  
  // Extract result for answer column
  const answer = data.result || "--"
  
  // Parse evidence and source from output if result is "Yes"
  let evidence = "--"
  let source = "--"
  const answersToInsert: AnswerData[] = []
  
  if (data.result === "Yes" && data.output) {
    try {
      console.log('Raw output from API:', data.output)
      
      // Parse the JSON string from output
      const parsedOutput = JSON.parse(data.output)
      console.log('Parsed output:', parsedOutput)
      
      if (Array.isArray(parsedOutput)) {
        // Extract pageContent for evidence (as bullet list)
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
        
        // Prepare answers to insert into answers table
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
        
        console.log('Extracted evidence:', evidence)
        console.log('Extracted source:', source)
        console.log('Answers to insert:', answersToInsert)
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
    const { error: answersError } = await supabase
      .from('answers')
      .insert(answersToInsert.map(a => ({
        question_id: a.question_id,
        page_content: a.page_content,
        file_name: a.file_name
      })))

    if (answersError) {
      console.error('Error inserting answers:', answersError)
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
  documentEvaluationByAi?: string | null
) => {
  const updateData: any = {}
  
  if (answer !== undefined) updateData.answer = answer
  if (evidence !== undefined) updateData.evidence = evidence
  if (source !== undefined) updateData.source = source
  if (remediationGuidance !== undefined) updateData.remediation_guidance = remediationGuidance
  if (controlEvaluationByAi !== undefined) updateData.control_evaluation_by_ai = controlEvaluationByAi
  if (documentEvaluationByAi !== undefined) updateData.document_evaluation_by_ai = documentEvaluationByAi

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
