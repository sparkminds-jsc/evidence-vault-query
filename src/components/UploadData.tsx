
import { useState, useEffect } from "react"
import { Upload, FileText, File, Check, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface UploadedFile {
  name: string
  url: string
  size: number
  uploadedAt: string
  deleted?: boolean
}

export function UploadData() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [storedFiles, setStoredFiles] = useState<UploadedFile[]>([])
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set())
  const [deletedFiles, setDeletedFiles] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    fetchDeletedFiles()
  }, [])

  const fetchDeletedFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('deleted_files')
        .select('file_name')

      if (error) {
        console.error('Error fetching deleted files:', error)
        return
      }

      const deletedFileNames = new Set(data?.map(item => item.file_name) || [])
      setDeletedFiles(deletedFileNames)
      
      // Always fetch uploaded files after getting deleted files
      await fetchUploadedFiles(deletedFileNames)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const fetchUploadedFiles = async (deletedFileNames?: Set<string>) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .list('', {
          limit: 100,
          offset: 0
        })

      if (error) {
        console.error('Error fetching files:', error)
        return
      }

      // Use the provided deletedFileNames or the current state
      const filesToFilter = deletedFileNames || deletedFiles

      // Filter out .emptyFolderPlaceholder file and deleted files
      const filteredData = data.filter(file => 
        file.name !== '.emptyFolderPlaceholder' && !filesToFilter.has(file.name)
      )

      const filesWithUrls = filteredData.map(file => {
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(file.name)
        
        return {
          name: file.name,
          url: urlData.publicUrl,
          size: file.metadata?.size || 0,
          uploadedAt: file.created_at || new Date().toISOString(),
          deleted: filesToFilter.has(file.name)
        }
      })

      setStoredFiles(filesWithUrls)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

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

    setFile(selectedFile)
    setUploaded(false)
  }

  const uploadFileToStorage = async (file: File): Promise<string | null> => {
    const fileName = `${Date.now()}-${file.name}`
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
    console.log('Calling API with URL:', fileUrl)
    
    try {
      const response = await fetch('https://abilene.sparkminds.net/webhook/documents', {
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
    if (!file) return
    
    setIsUploading(true)
    
    try {
      console.log('Processing file:', file.name)
      
      // Upload to Supabase storage
      const fileUrl = await uploadFileToStorage(file)
      
      if (fileUrl) {
        console.log('File uploaded successfully, calling API...')
        
        // Add a small delay to ensure file is available
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Call API with file URL
        await callDocumentAPI(fileUrl)
        setUploaded(true)
        console.log('File processed successfully:', file.name)
      } else {
        throw new Error(`Failed to upload ${file.name}`)
      }
      
      await fetchUploadedFiles() // Refresh the list
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

  const handleDeleteFile = async (fileUrl: string, fileName: string) => {
    setDeletingFiles(prev => new Set(prev).add(fileName))
    
    try {
      console.log('Marking file as deleted:', fileName)
      console.log('File URL:', fileUrl)
      
      // Call the delete API first
      const response = await fetch('https://abilene.sparkminds.net/webhook/documents', {
        method: 'DELETE',
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
        const errorText = await response.text()
        console.error('API delete failed:', response.status, errorText)
        throw new Error('Failed to delete file from API')
      }

      console.log('API delete successful, saving to database...')

      // Save deleted file info to database
      const { error: dbError } = await supabase
        .from('deleted_files')
        .insert({
          file_name: fileName,
          file_url: fileUrl,
          user_id: '001'
        })

      if (dbError) {
        console.error('Database insert error:', dbError)
        throw new Error('Failed to save deleted file to database')
      }

      console.log('File marked as deleted in database successfully')

      // Update local state
      setDeletedFiles(prev => new Set(prev).add(fileName))
      setStoredFiles(prev => prev.filter(file => file.name !== fileName))

      toast({
        title: "Success!",
        description: "File deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting file:', error)
      toast({
        title: "Error",
        description: "Failed to delete file. Please try again.",
        variant: "destructive"
      })
    } finally {
      setDeletingFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(fileName)
        return newSet
      })
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Upload Data Files</h2>
        <p className="text-muted-foreground mt-2">
          Upload PDF or DOCX documents for analysis and evidence extraction (one file at a time)
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
                Choose a document to upload
              </p>
              <p className="text-sm text-muted-foreground">
                Supports PDF, DOCX formats • One file at a time
              </p>
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileChange}
                className="hidden"
                id="document-upload"
              />
              <label htmlFor="document-upload">
                <Button variant="outline" className="cursor-pointer" asChild>
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
            disabled={!file || isUploading}
            className="w-full"
          >
            {isUploading ? "Uploading and Processing..." : "Upload File"}
          </Button>
        </CardContent>
      </Card>

      {/* Uploaded Files Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Uploaded Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storedFiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No files uploaded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  storedFiles.map((file) => (
                    <TableRow key={file.name}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {file.name.endsWith('.pdf') ? (
                            <File className="h-4 w-4 text-red-600" />
                          ) : (
                            <FileText className="h-4 w-4 text-blue-600" />
                          )}
                          {file.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={deletingFiles.has(file.name)}
                            >
                              {deletingFiles.has(file.name) ? (
                                "Deleting..."
                              ) : (
                                <>
                                  <Trash className="h-4 w-4 mr-1" />
                                  Delete
                                </>
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete File</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{file.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteFile(file.url, file.name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {storedFiles.length > 0 && (
            <div className="text-sm text-muted-foreground mt-4">
              Showing {storedFiles.length} uploaded file{storedFiles.length !== 1 ? 's' : ''}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
