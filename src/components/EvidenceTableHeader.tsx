
import { Button } from "@/components/ui/button"
import { Download, Trash2, MessageSquare } from "lucide-react"

interface EvidenceTableHeaderProps {
  evidenceCount: number
  isExportingPDF: boolean
  isDeletingAll: boolean
  isAnyQuestionProcessing: boolean
  isGettingAllEvidences?: boolean
  onExportPDF: () => void
  onDeleteAll: () => void
  onGetAllEvidences?: () => void
}

export function EvidenceTableHeader({
  evidenceCount,
  isExportingPDF,
  isDeletingAll,
  isAnyQuestionProcessing,
  isGettingAllEvidences = false,
  onExportPDF,
  onDeleteAll,
  onGetAllEvidences
}: EvidenceTableHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <span>Security Questions ({evidenceCount})</span>
      <div className="flex gap-2">
        {onGetAllEvidences && (
          <Button
            onClick={onGetAllEvidences}
            size="sm"
            variant="custom"
            disabled={isGettingAllEvidences || isAnyQuestionProcessing || evidenceCount === 0}
          >
            {isGettingAllEvidences ? (
              <>Loading...</>
            ) : (
              <>
                <MessageSquare className="h-4 w-4 mr-1" />
                Get All Evidences
              </>
            )}
          </Button>
        )}
        
        <Button
          onClick={onExportPDF}
          size="sm"
          variant="custom"
          disabled={isExportingPDF || isAnyQuestionProcessing || evidenceCount === 0}
        >
          {isExportingPDF ? (
            "Exporting..."
          ) : (
            <>
              <Download className="h-4 w-4 mr-1" />
              Export PDF
            </>
          )}
        </Button>
        
        <Button
          onClick={onDeleteAll}
          size="sm"
          variant="destructive"
          disabled={isDeletingAll || isAnyQuestionProcessing || evidenceCount === 0}
        >
          {isDeletingAll ? (
            "Deleting..."
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete All
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
