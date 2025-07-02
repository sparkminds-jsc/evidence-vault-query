
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Upload Security Questions</h2>
        <p className="text-muted-foreground mt-2">
          Upload an Excel file containing your security questions (Format: Id, ISO 27001 Control, Description, Question columns)
        </p>
      </div>

      <CurrentCustomerDisplay currentCustomer={currentCustomer} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
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
            className="w-full"
          >
            {isUploading ? "Processing..." : isUploaded ? "Questions Uploaded Successfully" : "Upload Questions"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
