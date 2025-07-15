
import { FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CurrentCustomerDisplay } from "@/components/CurrentCustomerDisplay"
import { FileUploadCard } from "@/components/FileUploadCard"
import { UploadedFilesTable } from "@/components/UploadedFilesTable"
import { useCurrentCustomer } from "@/hooks/useCurrentCustomer"
import { useCustomerFiles } from "@/hooks/useCustomerFiles"

export function UploadData() {
  const { currentCustomer } = useCurrentCustomer()
  const { storedFiles, refreshFiles } = useCustomerFiles(currentCustomer)

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
          deletingFiles={new Set()}
          isDeletingAll={false}
          onDeleteFile={async () => {}}
          onDeleteAllFiles={async () => {}}
        />
      )}
    </div>
  )
}
