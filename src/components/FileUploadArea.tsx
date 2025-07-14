
import { Upload, FileSpreadsheet, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploadAreaProps {
  file: File | null
  isUploaded: boolean
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function FileUploadArea({ file, isUploaded, onFileChange }: FileUploadAreaProps) {
  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <div className="space-y-2">
          <p className="text-base font-medium">
            {file ? file.name : "Choose an Excel file"}
          </p>
          <p className="text-sm text-muted-foreground">
            Supports .xlsx and .xls formats (Id, ISO 27001 Control, Description, Question, From Field Audit (findings) columns)
          </p>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={onFileChange}
            className="hidden"
            id="excel-upload"
          />
          <label htmlFor="excel-upload">
            <Button variant="outline" className="cursor-pointer text-sm" asChild>
              <span>Select File</span>
            </Button>
          </label>
        </div>
      </div>

      {file && (
        <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
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
    </div>
  )
}
