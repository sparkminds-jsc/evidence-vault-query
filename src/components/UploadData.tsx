
import { useState } from "react"
import { Upload, FileText, File, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

export function UploadData() {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    const validFiles = selectedFiles.filter(file => {
      const isPdf = file.type === "application/pdf"
      const isDocx = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      const isDoc = file.type === "application/msword"
      return isPdf || isDocx || isDoc
    })

    if (validFiles.length !== selectedFiles.length) {
      toast({
        title: "Invalid file type",
        description: "Please upload only PDF or DOCX files",
        variant: "destructive"
      })
    }

    setFiles(prev => [...prev, ...validFiles])
  }

  const uploadFileToStorage = async (file: File): Promise<string | null> => {
    const fileName = `${Date.now()}-${file.name}`
    
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, file)

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  }

  const callDocumentAPI = async (fileUrl: string) => {
    try {
      const response = await fetch('https://n8n.sparkminds.net/webhook/documents', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: "001",
          fileUrl: fileUrl
        })
      })

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API call error:', error)
      throw error
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    
    setIsUploading(true)
    const newUploadedFiles = new Set<string>()
    
    try {
      for (const file of files) {
        // Upload to Supabase storage
        const fileUrl = await uploadFileToStorage(file)
        
        if (fileUrl) {
          // Call API with file URL
          await callDocumentAPI(fileUrl)
          newUploadedFiles.add(file.name)
        } else {
          throw new Error(`Failed to upload ${file.name}`)
        }
      }
      
      setUploadedFiles(newUploadedFiles)
      toast({
        title: "Success!",
        description: `${files.length} file(s) uploaded and processed successfully`,
      })
    } catch (error) {
      console.error('Upload process failed:', error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (file: File) => {
    if (file.type === "application/pdf") {
      return <File className="h-5 w-5 text-red-600" />
    }
    return <FileText className="h-5 w-5 text-blue-600" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Upload Data Files</h2>
        <p className="text-muted-foreground mt-2">
          Upload PDF or DOCX documents for analysis and evidence extraction
        </p>
      </div>

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
                Choose documents to upload
              </p>
              <p className="text-sm text-muted-foreground">
                Supports PDF, DOCX formats • Multiple files allowed
              </p>
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileChange}
                multiple
                className="hidden"
                id="document-upload"
              />
              <label htmlFor="document-upload">
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span>Select Files</span>
                </Button>
              </label>
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Selected Files ({files.length})</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
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
                      {uploadedFiles.has(file.name) && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={isUploading}
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button 
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
            className="w-full"
          >
            {isUploading ? "Uploading and Processing..." : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
