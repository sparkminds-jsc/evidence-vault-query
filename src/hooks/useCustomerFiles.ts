
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

interface UploadedFile {
  name: string
  url: string
  size: number
  uploadedAt: string
  customer_id?: string
  deleted?: boolean
}

interface Customer {
  id: string
  email: string
  full_name: string
  status: string
}

export function useCustomerFiles(currentCustomer: Customer | null) {
  const [storedFiles, setStoredFiles] = useState<UploadedFile[]>([])
  const [deletedFiles, setDeletedFiles] = useState<Set<string>>(new Set())

  const fetchDeletedFiles = async () => {
    if (!currentCustomer) return

    console.log('🔍 Fetching deleted files for customer:', currentCustomer.email)

    try {
      const { data, error } = await supabase
        .from('deleted_files')
        .select('file_name')
        .eq('user_id', currentCustomer.email)

      if (error) {
        console.error('Error fetching deleted files:', error)
        return
      }

      console.log('📋 Deleted files:', data)
      const deletedFileNames = new Set(data?.map(item => item.file_name) || [])
      setDeletedFiles(deletedFileNames)
      
      // Always fetch uploaded files after getting deleted files
      await fetchUploadedFiles(deletedFileNames)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const fetchUploadedFiles = async (deletedFileNames?: Set<string>) => {
    if (!currentCustomer) {
      setStoredFiles([])
      return
    }

    console.log('📁 Fetching uploaded files for customer:', currentCustomer.email)

    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .list(currentCustomer.email, {
          limit: 100,
          offset: 0
        })

      if (error) {
        console.error('Error fetching files:', error)
        return
      }

      console.log('📂 Raw files from storage:', data)

      // Use the provided deletedFileNames or the current state
      const filesToFilter = deletedFileNames || deletedFiles

      // Filter files and exclude deleted files
      const filteredData = data.filter(file => 
        file.name !== '.emptyFolderPlaceholder' && 
        !filesToFilter.has(file.name)
      )

      console.log('✅ Filtered files:', filteredData)

      const filesWithUrls = filteredData.map(file => {
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(`${currentCustomer.email}/${file.name}`)
        
        return {
          name: file.name,
          url: urlData.publicUrl,
          size: file.metadata?.size || 0,
          uploadedAt: file.created_at || new Date().toISOString(),
          customer_id: currentCustomer.id,
          deleted: filesToFilter.has(file.name)
        }
      })

      console.log('🔗 Files with URLs:', filesWithUrls)
      setStoredFiles(filesWithUrls)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  useEffect(() => {
    if (currentCustomer) {
      fetchDeletedFiles()
    } else {
      setStoredFiles([])
      setDeletedFiles(new Set())
    }
  }, [currentCustomer])

  const refreshFiles = () => {
    console.log('🔄 Refreshing files for customer:', currentCustomer?.email)
    if (currentCustomer) {
      fetchDeletedFiles()
    }
  }

  const markFileAsDeleted = (fileName: string) => {
    setDeletedFiles(prev => new Set(prev).add(fileName))
    setStoredFiles(prev => prev.filter(file => file.name !== fileName))
  }

  const markAllFilesAsDeleted = () => {
    const allFileNames = new Set(storedFiles.map(file => file.name))
    setDeletedFiles(prev => new Set([...prev, ...allFileNames]))
    setStoredFiles([])
  }

  return {
    storedFiles,
    deletedFiles,
    refreshFiles,
    markFileAsDeleted,
    markAllFilesAsDeleted
  }
}
