
import { useState } from "react"
import { Upload, FileSpreadsheet, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import * as XLSX from 'xlsx'
import { CurrentCustomerDisplay } from "@/components/CurrentCustomerDisplay"
import { useCurrentCustomer } from "@/hooks/useCurrentCustomer"

export function UploadQuestions() {
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

  const parseExcelFile = async (file: File): Promise<Array<{id: string, content: string}>> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
          
          // Extract questions from both ID and Question columns, skip header row
          const questions = jsonData
            .slice(1) // Skip header
            .map((row: any) => {
              const id = row[0] // First column is ID
              const question = row[1] // Second column is Question
              return { id: String(id || ''), content: String(question || '') }
            })
            .filter((item: any) => item.id.trim().length > 0 && item.content.trim().length > 0)
            .map((item: any) => ({ id: item.id.trim(), content: item.content.trim() }))
          
          resolve(questions)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsArrayBuffer(file)
    })
  }

  const insertQuestionsToDatabase = async (questions: Array<{id: string, content: string}>) => {
    if (!currentCustomer) {
      throw new Error('No current customer selected')
    }

    const questionsData = questions.map(item => ({ 
      content: item.content,
      question_id: item.id,
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
        title: "No customer selected",
        description: "Please select a customer in the Manage Customer section first",
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Upload Security Questions</h2>
        <p className="text-muted-foreground mt-2">
          Upload an Excel file containing your security questions (Format: ID, Question columns)
        </p>
      </div>

      <CurrentCustomerDisplay currentCustomer={currentCustomer} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Excel File Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {file ? file.name : "Choose an Excel file"}
              </p>
              <p className="text-sm text-muted-foreground">
                Supports .xlsx and .xls formats (ID and Question columns)
              </p>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="excel-upload"
              />
              <label htmlFor="excel-upload">
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span>Select File</span>
                </Button>
              </label>
            </div>
          </div>

          {file && (
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              {isUploaded && (
                <Check className="h-5 w-5 text-green-600" />
              )}
            </div>
          )}

          <Button 
            onClick={handleUpload}
            disabled={!file || isUploading || isUploaded || !currentCustomer}
            className="w-full"
          >
            {isUploading ? "Processing..." : isUploaded ? "Questions Uploaded Successfully" : "Upload Questions"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
