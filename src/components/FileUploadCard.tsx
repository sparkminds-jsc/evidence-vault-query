
import { useState } from "react"
import { Upload, FileText, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface FileUploadCardProps {
  currentCustomer: any
  onFileUploaded: () => void
}

export function FileUploadCard({ currentCustomer, onFileUploaded }: FileUploadCardProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isUploaded, setIsUploaded] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file || !currentCustomer) return

    setIsUploading(true)

    try {
      // Upload the file to Supabase storage
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(`${currentCustomer.email}/${file.name}`, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error("Error uploading file:", error)
        toast({
          title: "Error",
          description: "Failed to upload file. Please try again.",
          variant: "destructive"
        })
        return
      }

      console.log("File uploaded successfully:", data)

      // Get public URL of the uploaded file
      const fileUrl = supabase.storage
        .from('documents')
        .getPublicUrl(`${currentCustomer.email}/${file.name}`).data.publicUrl

      // Call the webhook API
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

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API call failed:', response.status, errorText)
        throw new Error('API call failed')
      }

      console.log('API call successful')

      setIsUploaded(true)
      toast({
        title: "Success!",
        description: "File uploaded successfully",
      })
      onFileUploaded()
    } catch (error) {
      console.error("Error during upload process:", error)
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Document Upload</h3>
      </div>
      
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <div className="space-y-2">
          <p className="font-medium" style={{ fontSize: '16px' }}>
            {file ? file.name : "Choose a document to upload"}
          </p>
          <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
            Supports PDF, DOCX formats • One file at a time • Max 10MB
          </p>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
            id="document-upload"
          />
          <label htmlFor="document-upload">
            <Button variant="primary" className="cursor-pointer" style={{ fontSize: '14px' }} asChild>
              <span>Select File</span>
            </Button>
          </label>
        </div>
      </div>

      {file && (
        <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-green-600" />
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
        style={{ fontSize: '14px' }}
      >
        {isUploading ? "Uploading..." : isUploaded ? "Document Uploaded Successfully" : "Upload Document"}
      </Button>
    </div>
  )
}
