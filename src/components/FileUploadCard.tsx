
import { useState } from "react"
import { Upload, FileText, File, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface Customer {
  id: string
  email: string
  full_name: string
  status: string
}

interface FileUploadCardProps {
  currentCustomer: Customer | null
  onFileUploaded: () => void
}

export function FileUploadCard({ currentCustomer, onFileUploaded }: FileUploadCardProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    // File type validation
    const isPdf = selectedFile.type === "application/pdf"
    const isDocx = selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    const isDoc = selectedFile.type === "application/msword"

    if (!isPdf && !isDocx && !isDoc) {
      toast({
        title: "Invalid file type",
        description: "Please upload only PDF or DOCX files",
        variant: "destructive"
      })
      return
    }

    // File size validation (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload files smaller than 10MB",
        variant: "destructive"
      })
      return
    }

    setFile(selectedFile)
    setUploaded(false)
  }

  const uploadFileToStorage = async (file: File): Promise<string | null> => {
    if (!currentCustomer) {
      throw new Error('No customer selected')
    }

    const { supabase } = await import("@/integrations/supabase/client")
    const fileName = `${currentCustomer.email}-${Date.now()}-${file.name}`
    console.log('Uploading file:', fileName)
    
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, file)

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    console.log('Upload successful:', data)

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName)

    console.log('Public URL:', urlData.publicUrl)
    return urlData.publicUrl
  }

  const callDocumentAPI = async (fileUrl: string) => {
    if (!currentCustomer) {
      throw new Error('No customer selected')
    }

    console.log('Calling API with URL:', fileUrl)
    console.log('Using customer email as userId:', currentCustomer.email)
    
    try {
      const response = await fetch('https://abilene.sparkminds.net/webhook/documents', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentCustomer.email,
          fileUrl: fileUrl
        })
      })

      console.log('API Response status:', response.status)
      
      const responseText = await response.text()
      console.log('API Response body:', responseText)

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} - ${responseText}`)
      }

      return JSON.parse(responseText)
    } catch (error) {
      console.error('API call error:', error)
      throw error
    }
  }

  const handleUpload = async () => {
    if (!file || !currentCustomer) {
      if (!currentCustomer) {
        toast({
          title: "No customer selected",
          description: "Please select a customer first in the Manage Customer section",
          variant: "destructive"
        })
      }
      return
    }
    
    setIsUploading(true)
    
    try {
      console.log('Processing file:', file.name)
      console.log('For customer:', currentCustomer.email)
      
      // Upload to Supabase storage
      const fileUrl = await uploadFileToStorage(file)
      
      if (fileUrl) {
        console.log('File uploaded successfully, calling API...')
        
        // Add a small delay to ensure file is available
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Call API with file URL and customer email
        await callDocumentAPI(fileUrl)
        setUploaded(true)
        console.log('File processed successfully:', file.name)
      } else {
        throw new Error(`Failed to upload ${file.name}`)
      }
      
      onFileUploaded() // Refresh the list
      
      // Clear the selected file after successful upload
      setFile(null)
      setUploaded(false)
      
      toast({
        title: "Success!",
        description: "File uploaded and processed successfully",
      })
    } catch (error) {
      console.error('Upload process failed:', error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error uploading your file. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    setUploaded(false)
  }

  const getFileIcon = (file: File) => {
    if (file.type === "application/pdf") {
      return <File className="h-5 w-5 text-red-600" />
    }
    return <FileText className="h-5 w-5 text-blue-600" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              Choose a document to upload
            </p>
            <p className="text-sm text-muted-foreground">
              Supports PDF, DOCX formats • One file at a time • Max 10MB
            </p>
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileChange}
              className="hidden"
              id="document-upload"
              disabled={!currentCustomer}
            />
            <label htmlFor="document-upload">
              <Button 
                variant="outline" 
                className="cursor-pointer" 
                asChild
                disabled={!currentCustomer}
              >
                <span>Select File</span>
              </Button>
            </label>
          </div>
        </div>

        {file && (
          <div className="space-y-2">
            <h4 className="font-medium">Selected File</h4>
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                {getFileIcon(file)}
                <div>
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {uploaded && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  disabled={isUploading}
                >
                  ✕
                </Button>
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={handleUpload}
          disabled={!file || isUploading || !currentCustomer}
          className="w-full"
        >
          {isUploading ? "Uploading and Processing..." : "Upload File"}
        </Button>
      </CardContent>
    </Card>
  )
}
