
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { CurrentCustomerDisplay } from "./CurrentCustomerDisplay"
import { FileUploadCard } from "./FileUploadCard"
import { UploadedFilesTable } from "./UploadedFilesTable"
import { useCurrentCustomer } from "@/hooks/useCurrentCustomer"
import { useCustomerFiles } from "@/hooks/useCustomerFiles"

export function UploadData() {
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set())
  const [isDeletingAll, setIsDeletingAll] = useState(false)
  const { toast } = useToast()
  const { currentCustomer } = useCurrentCustomer()
  const { storedFiles, refreshFiles, markFileAsDeleted, markAllFilesAsDeleted } = useCustomerFiles(currentCustomer)

  const handleDeleteFile = async (fileUrl: string, fileName: string) => {
    if (!currentCustomer) return

    setDeletingFiles(prev => new Set(prev).add(fileName))
    
    try {
      console.log('Marking file as deleted:', fileName)
      console.log('File URL:', fileUrl)
      console.log('Using customer email as userId:', currentCustomer.email)
      
      // Call the delete API first
      const response = await fetch('https://abilene.sparkminds.net/webhook/documents', {
        method: 'DELETE',
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
          user_id: currentCustomer.email
        })

      if (dbError) {
        console.error('Database insert error:', dbError)
        throw new Error('Failed to save deleted file to database')
      }

      console.log('File marked as deleted in database successfully')

      // Update local state
      markFileAsDeleted(fileName)

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

  const handleDeleteAllFiles = async () => {
    if (!currentCustomer) return

    setIsDeletingAll(true)
    
    try {
      console.log('Deleting all files for customer:', currentCustomer.email)
      
      // Call the delete all files API
      const response = await fetch(`https://abilene.sparkminds.net/webhook/documents/delete-user?userId=${encodeURIComponent(currentCustomer.email)}`, {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API delete all failed:', response.status, errorText)
        throw new Error('Failed to delete all files from API')
      }

      console.log('API delete all successful')

      // Mark all current files as deleted in the database
      const filesToMarkDeleted = storedFiles.map(file => ({
        file_name: file.name,
        file_url: file.url,
        user_id: currentCustomer.email
      }))

      if (filesToMarkDeleted.length > 0) {
        const { error: dbError } = await supabase
          .from('deleted_files')
          .insert(filesToMarkDeleted)

        if (dbError) {
          console.error('Database insert error:', dbError)
        }
      }

      // Update local state to mark all files as deleted
      markAllFilesAsDeleted()

      toast({
        title: "Success!",
        description: "All files deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting all files:', error)
      toast({
        title: "Error",
        description: "Failed to delete all files. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsDeletingAll(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Upload Data Files</h2>
        <p className="text-muted-foreground mt-2">
          Upload PDF or DOCX documents for analysis and evidence extraction (one file at a time, max 10MB)
        </p>
      </div>

      <CurrentCustomerDisplay currentCustomer={currentCustomer} />

      <FileUploadCard 
        currentCustomer={currentCustomer} 
        onFileUploaded={refreshFiles}
      />

      <UploadedFilesTable
        storedFiles={storedFiles}
        currentCustomer={currentCustomer}
        deletingFiles={deletingFiles}
        isDeletingAll={isDeletingAll}
        onDeleteFile={handleDeleteFile}
        onDeleteAllFiles={handleDeleteAllFiles}
      />
    </div>
  )
}
