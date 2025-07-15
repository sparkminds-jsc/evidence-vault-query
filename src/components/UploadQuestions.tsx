
import { FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CurrentCustomerDisplay } from "@/components/CurrentCustomerDisplay"
import { FileUploadArea } from "@/components/FileUploadArea"
import { useQuestionUpload } from "@/hooks/useQuestionUpload"

export function UploadQuestions() {
  const {
    file,
    isUploading,
    isUploaded,
    currentCustomer,
    handleFileChange,
    handleUpload
  } = useQuestionUpload()

  return (
    <div className="w-full space-y-6">
      <CurrentCustomerDisplay currentCustomer={currentCustomer} />

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileSpreadsheet className="h-5 w-5" />
            Excel File Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUploadArea
            file={file}
            isUploaded={isUploaded}
            onFileChange={handleFileChange}
          />

          <Button 
            onClick={handleUpload}
            disabled={!file || isUploading || isUploaded || !currentCustomer}
            className="w-full text-sm"
          >
            {isUploading ? "Processing..." : isUploaded ? "Questions Uploaded Successfully" : "Upload Questions"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
