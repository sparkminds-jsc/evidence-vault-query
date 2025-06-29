
import { useState } from "react"
import { FileText, File, Trash, Trash2 } from "lucide-react"
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
import { decodeFileName } from "@/utils/fileUtils"

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

interface UploadedFilesTableProps {
  storedFiles: UploadedFile[]
  currentCustomer: Customer | null
  deletingFiles: Set<string>
  isDeletingAll: boolean
  onDeleteFile: (fileUrl: string, fileName: string) => Promise<void>
  onDeleteAllFiles: () => Promise<void>
}

export function UploadedFilesTable({
  storedFiles,
  currentCustomer,
  deletingFiles,
  isDeletingAll,
  onDeleteFile,
  onDeleteAllFiles
}: UploadedFilesTableProps) {
  const handleFileNameClick = (fileUrl: string) => {
    window.open(fileUrl, '_blank')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Uploaded Files
            {currentCustomer && (
              <span className="text-sm text-muted-foreground">
                for {currentCustomer.email}
              </span>
            )}
          </div>
          {storedFiles.length > 0 && currentCustomer && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isDeletingAll}
                >
                  {isDeletingAll ? (
                    "Deleting..."
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete All Files
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete All Files</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete all {storedFiles.length} files for {currentCustomer.email}? This will permanently remove all uploaded files and their data from the system. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDeleteAllFiles}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete All Files
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
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
              {!currentCustomer ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Please select a customer first to view files.
                  </TableCell>
                </TableRow>
              ) : storedFiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No files uploaded yet for {currentCustomer.email}.
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
                        <button
                          onClick={() => handleFileNameClick(file.url)}
                          className="text-primary hover:underline cursor-pointer text-left"
                        >
                          {decodeFileName(file.name).replace(`${currentCustomer.email}-`, '').replace(/^\d+-/, '')}
                        </button>
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
                              Are you sure you want to delete "{decodeFileName(file.name).replace(`${currentCustomer.email}-`, '').replace(/^\d+-/, '')}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteFile(file.url, file.name)}
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
        {storedFiles.length > 0 && currentCustomer && (
          <div className="text-sm text-muted-foreground mt-4">
            Showing {storedFiles.length} uploaded file{storedFiles.length !== 1 ? 's' : ''} for {currentCustomer.email}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
