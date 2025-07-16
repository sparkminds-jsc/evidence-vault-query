
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Trash2, MessageSquare } from "lucide-react"

interface Customer {
  id: string
  email: string
  full_name: string
  status: string
}

interface CurrentCustomerDisplayProps {
  currentCustomer: Customer | null
  evidenceCount?: number
  completedCount?: number
  isExportingPDF?: boolean
  isDeletingAll?: boolean
  isAnyQuestionProcessing?: boolean
  isGettingAllEvidences?: boolean
  onExportPDF?: () => void
  onDeleteAll?: () => void
  onGetAllEvidences?: () => void
  lastUpdate?: string
}

export function CurrentCustomerDisplay({ 
  currentCustomer, 
  evidenceCount = 0,
  completedCount = 0,
  isExportingPDF = false,
  isDeletingAll = false,
  isAnyQuestionProcessing = false,
  isGettingAllEvidences = false,
  onExportPDF,
  onDeleteAll,
  onGetAllEvidences,
  lastUpdate
}: CurrentCustomerDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Current Auditee</span>
          <span className="text-sm font-normal">Security Questions ({completedCount}/{evidenceCount})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6">
          {/* Left side - Action buttons */}
          <div className="flex flex-col gap-2 min-w-[200px]">
            {onGetAllEvidences && (
              <Button
                onClick={onGetAllEvidences}
                size="sm"
                variant="custom"
                disabled={isGettingAllEvidences || isAnyQuestionProcessing || evidenceCount === 0}
                className="w-full"
              >
                {isGettingAllEvidences ? (
                  <>Loading...</>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Get All Evidences
                  </>
                )}
              </Button>
            )}
            
            {onExportPDF && (
              <Button
                onClick={onExportPDF}
                size="sm"
                variant="custom"
                disabled={isExportingPDF || isAnyQuestionProcessing || evidenceCount === 0}
                className="w-full"
              >
                {isExportingPDF ? (
                  "Exporting..."
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </>
                )}
              </Button>
            )}
            
            {onDeleteAll && (
              <Button
                onClick={onDeleteAll}
                size="sm"
                variant="destructive"
                disabled={isDeletingAll || isAnyQuestionProcessing || evidenceCount === 0}
                className="w-full"
              >
                {isDeletingAll ? (
                  "Deleting..."
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Right side - Audit information */}
          <div className="flex-1">
            {currentCustomer ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Language:</p>
                  <p className="text-sm font-medium">🇬🇧 EN</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Code:</p>
                  <p className="text-sm font-medium">410</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Auditee name:</p>
                  <p className="text-sm font-medium">{currentCustomer.full_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Questions:</p>
                  <p className="text-sm font-medium">{completedCount}/{evidenceCount}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Last update:</p>
                  <p className="text-sm font-medium">{lastUpdate || new Date().toLocaleDateString('en-GB')}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div>
                  <p className="font-bold text-gray-600 text-xs">No auditee selected</p>
                  <p className="text-xs text-muted-foreground font-bold">Please select an auditee in the Auditees section</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
