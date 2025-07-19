
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import * as XLSX from 'xlsx'
import { useCurrentCustomer } from "@/hooks/useCurrentCustomer"

interface QuestionData {
  id: string
  iso_27001_control: string
  description: string
}

export function useQuestionUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isUploaded, setIsUploaded] = useState(false)
  const { toast } = useToast()
  const { currentCustomer } = useCurrentCustomer()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
          selectedFile.type === "application/vnd.ms-excel") {
        setFile(selectedFile)
        setIsUploaded(false)
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an Excel file (.xlsx or .xls)",
          variant: "destructive"
        })
      }
    }
  }

  const parseExcelFile = async (file: File): Promise<QuestionData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
          
          // Extract questions from 3 columns: Id, ISO 27001 Control, Description
          const questions = jsonData
            .slice(1) // Skip header
            .map((row: any) => {
              const id = row[0] // First column is Id
              const iso_27001_control = row[1] // Second column is ISO 27001 Control
              const description = row[2] // Third column is Description
              return { 
                id: String(id || '').trim(), 
                iso_27001_control: String(iso_27001_control || '').trim(),
                description: String(description || '').trim()
              }
            })
            .filter((item: any) => item.id.length > 0 && item.description.length > 0)
          
          resolve(questions)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsArrayBuffer(file)
    })
  }

  const insertQuestionsToDatabase = async (questions: QuestionData[]) => {
    if (!currentCustomer) {
      throw new Error('No current customer selected')
    }

    const questionsData = questions.map(item => ({ 
      content: item.description, // Use description for both content and description
      question_id: item.id,
      iso_27001_control: item.iso_27001_control || null,
      description: item.description || null,
      customer_id: currentCustomer.id
    }))
    
    const { error } = await supabase
      .from('questions')
      .insert(questionsData)
    
    if (error) {
      console.error('Database insert error:', error)
      throw error
    }
  }

  const handleUpload = async () => {
    if (!file) return

    if (!currentCustomer) {
      toast({
        title: "No auditee selected",
        description: "Please select an auditee in the Auditees section first",
        variant: "destructive"
      })
      return
    }
    
    setIsUploading(true)
    
    try {
      console.log('Parsing Excel file...')
      const questions = await parseExcelFile(file)
      console.log('Extracted questions:', questions)
      
      if (questions.length === 0) {
        throw new Error('No valid questions found in the Excel file')
      }
      
      console.log('Inserting questions to database...')
      await insertQuestionsToDatabase(questions)
      
      setIsUploaded(true)
      toast({
        title: "Success!",
        description: `${questions.length} security questions uploaded successfully for ${currentCustomer.email}`,
      })
    } catch (error) {
      console.error('Upload process failed:', error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error processing your file. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  return {
    file,
    isUploading,
    isUploaded,
    currentCustomer,
    handleFileChange,
    handleUpload
  }
}
