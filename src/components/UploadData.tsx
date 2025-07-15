
import { FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CurrentCustomerDisplay } from "@/components/CurrentCustomerDisplay"
import { FileUploadCard } from "@/components/FileUploadCard"
import { UploadedFilesTable } from "@/components/UploadedFilesTable"
import { useCurrentCustomer } from "@/hooks/useCurrentCustomer"
import { useCustomerFiles } from "@/hooks/useCustomerFiles"

export function UploadData() {
  const { currentCustomer } = useCurrentCustomer()
  const { files, isLoading, refetch } = useCustomerFiles(currentCustomer?.id)

  return (
    <div className="w-full space-y-6">
      <CurrentCustomerDisplay currentCustomer={currentCustomer} />

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Document Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FileUploadCard onUploadComplete={refetch} />
        </CardContent>
      </Card>

      {files && files.length > 0 && (
        <UploadedFilesTable 
          files={files} 
          isLoading={isLoading}
          onDeleteComplete={refetch}
        />
      )}
    </div>
  )
}
