
import { Button } from "@/components/ui/button"
import { FileText, FileDown, Trash2, Loader2 } from "lucide-react"
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

interface EvidenceTableHeaderProps {
  evidenceCount: number
  isExportingPDF: boolean
  isDeletingAll: boolean
  isAnyQuestionProcessing: boolean
  onExportPDF: () => void
  onDeleteAll: () => void
}

export function EvidenceTableHeader({
  evidenceCount,
  isExportingPDF,
  isDeletingAll,
  isAnyQuestionProcessing,
  onExportPDF,
  onDeleteAll
}: EvidenceTableHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Evidence Report
      </div>
      <div className="flex gap-2">
        <Button onClick={onExportPDF} variant="outline" size="sm" disabled={isExportingPDF}>
          {isExportingPDF ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4 mr-2" />
              Export PDF Report
            </>
          )}
        </Button>
        {evidenceCount > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeletingAll || isAnyQuestionProcessing}
              >
                {isDeletingAll ? (
                  "Deleting..."
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Questions
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete All Questions</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete all questions? This will permanently remove all {evidenceCount} questions and their associated answers. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDeleteAll}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  )
}
