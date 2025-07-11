
import { Button } from "@/components/ui/button"
import { FileDown, Trash2 } from "lucide-react"
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
      <span>Audit ({evidenceCount} questions)</span>
      <div className="flex gap-2">
        <Button
          onClick={onExportPDF}
          disabled={isExportingPDF || isAnyQuestionProcessing || evidenceCount === 0}
          size="sm"
          variant="outline"
        >
          <FileDown className="h-4 w-4 mr-2" />
          {isExportingPDF ? "Exporting..." : "Export PDF"}
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isDeletingAll || isAnyQuestionProcessing || evidenceCount === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeletingAll ? "Deleting..." : "Delete All"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete All Questions</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete all questions? This action cannot be undone and will remove all {evidenceCount} questions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDeleteAll}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete All Questions
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
