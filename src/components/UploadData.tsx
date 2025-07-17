
import { useState } from "react"
import { FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CurrentCustomerDisplay } from "@/components/CurrentCustomerDisplay"
import { FileUploadCard } from "@/components/FileUploadCard"
import { UploadedFilesTable } from "@/components/UploadedFilesTable"
import { useCurrentCustomer } from "@/hooks/useCurrentCustomer"
import { useCustomerFiles } from "@/hooks/useCustomerFiles"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function UploadData() {
  const { currentCustomer } = useCurrentCustomer()
  const { storedFiles, refreshFiles, markFileAsDeleted, markAllFilesAsDeleted } = useCustomerFiles(currentCustomer)
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set())
  const [isDeletingAll, setIsDeletingAll] = useState(false)
  const { toast } = useToast()

  const handleDeleteFile = async (fileUrl: string, fileName: string) => {
    if (!currentCustomer) return

    setDeletingFiles(prev => new Set(prev).add(fileName))

    try {
      // Delete from Supabase storage
      const { error } = await supabase.storage
        .from('documents')
        .remove([`${currentCustomer.email}/${fileName}`])

      if (error) {
        console.error('Error deleting file:', error)
        toast({
          title: "Error",
          description: "Failed to delete file. Please try again.",
          variant: "destructive"
        })
        return
      }

      // Add to deleted_files table
      await supabase
        .from('deleted_files')
        .insert({
          file_name: fileName,
          file_url: fileUrl,
          user_id: currentCustomer.email
        })

      // Update local state
      markFileAsDeleted(fileName)

      toast({
        title: "Success",
        description: "File deleted successfully",
      })
    } catch (error) {
      console.error('Error:', error)
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
    if (!currentCustomer || storedFiles.length === 0) return

    setIsDeletingAll(true)

    try {
      // Delete all files from Supabase storage
      const filePaths = storedFiles.map(file => `${currentCustomer.email}/${file.name}`)
      const { error } = await supabase.storage
        .from('documents')
        .remove(filePaths)

      if (error) {
        console.error('Error deleting files:', error)
        toast({
          title: "Error",
          description: "Failed to delete some files. Please try again.",
          variant: "destructive"
        })
        return
      }

      // Add all files to deleted_files table
      const deletedFileRecords = storedFiles.map(file => ({
        file_name: file.name,
        file_url: file.url,
        user_id: currentCustomer.email
      }))

      await supabase
        .from('deleted_files')
        .insert(deletedFileRecords)

      // Update local state
      markAllFilesAsDeleted()

      toast({
        title: "Success",
        description: `All ${storedFiles.length} files deleted successfully`,
      })
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Failed to delete files. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsDeletingAll(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <CurrentCustomerDisplay currentCustomer={currentCustomer} />

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">
            {/* Removed the FileText icon */}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FileUploadCard 
            currentCustomer={currentCustomer} 
            onFileUploaded={refreshFiles} 
          />
        </CardContent>
      </Card>

      {storedFiles && storedFiles.length > 0 && (
        <UploadedFilesTable 
          storedFiles={storedFiles}
          currentCustomer={currentCustomer}
          deletingFiles={deletingFiles}
          isDeletingAll={isDeletingAll}
          onDeleteFile={handleDeleteFile}
          onDeleteAllFiles={handleDeleteAllFiles}
        />
      )}
    </div>
  )
}
