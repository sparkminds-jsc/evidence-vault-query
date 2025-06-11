
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { EvidenceItem, AnswerData } from "@/types/evidence"

export function useEvidenceData() {
  const [searchTerm, setSearchTerm] = useState("")
  const [evidenceData, setEvidenceData] = useState<EvidenceItem[]>([])
  const [filteredEvidence, setFilteredEvidence] = useState<EvidenceItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingAnswers, setLoadingAnswers] = useState<Set<string>>(new Set())
  const [deletingQuestions, setDeletingQuestions] = useState<Set<string>>(new Set())
  const [isDeletingAll, setIsDeletingAll] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchQuestionsFromDatabase()
  }, [])

  const fetchQuestionsFromDatabase = async () => {
    try {
      const { data: questions, error } = await supabase
        .from('questions')
        .select('*')
        .order('question_id', { ascending: true })

      if (error) {
        console.error('Error fetching questions:', error)
        return
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
              source: question.source || "--"
            }
          }

          // Generate source from unique file names
          const uniqueFileNames = [...new Set(answers?.map(a => a.file_name) || [])]
          const source = uniqueFileNames.length > 0 ? uniqueFileNames.join(', ') : question.source || "--"

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

      setEvidenceData(questionsWithAnswers)
      setFilteredEvidence(questionsWithAnswers)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetAnswer = async (questionId: string, questionContent: string) => {
    setLoadingAnswers(prev => new Set(prev).add(questionId))
    
    try {
      const response = await fetch(
        `https://abilene.sparkminds.net/webhook/query?prompt=${encodeURIComponent(questionContent)}&userId=001`,
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

      const data = await response.json()
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
            
            // Extract file_name from metadata for source (as comma-separated list)
            const sourceList = parsedOutput
              .map((item: any) => item.metadata?.file_name)
              .filter((fileName: string) => fileName && fileName.trim().length > 0)
            source = sourceList.length > 0 ? [...new Set(sourceList)].join(', ') : "--"
            
            // Prepare answers to insert into answers table
            parsedOutput.forEach((item: any) => {
              if (item.pageContent && item.metadata?.file_name) {
                answersToInsert.push({
                  id: crypto.randomUUID(),
                  question_id: questionId,
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
                    question_id: questionId,
                    page_content: content.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"'),
                    file_name: fileName
                  })
                }
              })
              
              if (answersToInsert.length > 0) {
                evidence = answersToInsert.map(a => `• ${a.page_content}`).join('\n')
                source = [...new Set(answersToInsert.map(a => a.file_name))].join(', ')
              }
            }
            
            console.log('Fallback extracted evidence:', evidence)
            console.log('Fallback extracted source:', source)
          } catch (fallbackError) {
            console.error('Fallback extraction also failed:', fallbackError)
          }
        }
      }

      // Insert answers into answers table
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

      // Update the question in the database
      const { error } = await supabase
        .from('questions')
        .update({ 
          answer: answer,
          evidence: evidence,
          source: source
        })
        .eq('id', questionId)

      if (error) {
        throw error
      }

      // Update local state
      setEvidenceData(prev => 
        prev.map(item => 
          item.id === questionId 
            ? { ...item, answer: answer, evidence: evidence, source: source }
            : item
        )
      )
      
      setFilteredEvidence(prev => 
        prev.map(item => 
          item.id === questionId 
            ? { ...item, answer: answer, evidence: evidence, source: source }
            : item
        )
      )

      toast({
        title: "Success!",
        description: "Answer retrieved and saved successfully",
      })
    } catch (error) {
      console.error('Error getting answer:', error)
      toast({
        title: "Error",
        description: "Failed to get answer. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoadingAnswers(prev => {
        const newSet = new Set(prev)
        newSet.delete(questionId)
        return newSet
      })
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    setDeletingQuestions(prev => new Set(prev).add(questionId))
    
    try {
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
      setDeletingQuestions(prev => {
        const newSet = new Set(prev)
        newSet.delete(questionId)
        return newSet
      })
    }
  }

  const handleDeleteAllQuestions = async () => {
    setIsDeletingAll(true)
    
    try {
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

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    const filtered = evidenceData.filter(
      item =>
        item.question_id.toLowerCase().includes(value.toLowerCase()) ||
        item.question.toLowerCase().includes(value.toLowerCase()) ||
        item.answer.toLowerCase().includes(value.toLowerCase()) ||
        item.evidence.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredEvidence(filtered)
  }

  return {
    searchTerm,
    evidenceData,
    filteredEvidence,
    isLoading,
    loadingAnswers,
    deletingQuestions,
    isDeletingAll,
    handleGetAnswer,
    handleDeleteQuestion,
    handleDeleteAllQuestions,
    handleSearch
  }
}
