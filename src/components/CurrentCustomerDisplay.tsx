
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Trash2, MessageSquare, Settings } from "lucide-react"
import { useNavigate } from "react-router-dom"

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
  const navigate = useNavigate()

  const handleChangeAuditee = () => {
    navigate('/manage-customer')
  }
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Current Auditee
          </CardTitle>
          <Button
            onClick={handleChangeAuditee}
            size="sm"
            variant="outline"
            className="ml-auto"
          >
            <Settings className="h-4 w-4 mr-2" />
            Change Auditee
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6">
          {/* Left side - Action buttons */}
          <div className="flex flex-row gap-2 min-w-[200px]">
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
          <div className="flex-1 flex justify-end">
            {currentCustomer ? (
              <div className="flex items-center gap-6 text-right">
                 <div>
                   <p className="text-xs mb-1" style={{ color: '#4E6993', fontSize: '12px' }}>Language:</p>
                   <p className="text-sm flex items-center gap-1" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                     <img 
                       src="data:image/svg+xml,%3c?xml%20version=%271.0%27%20encoding=%27iso-8859-1%27?%3e%3c!--%20Uploaded%20to:%20SVG%20Repo,%20www.svgrepo.com,%20Generator:%20SVG%20Repo%20Mixer%20Tools%20--%3e%3csvg%20height=%27800px%27%20width=%27800px%27%20version=%271.1%27%20id=%27Layer_1%27%20xmlns=%27http://www.w3.org/2000/svg%27%20xmlns:xlink=%27http://www.w3.org/1999/xlink%27%20viewBox=%270%200%20512%20512%27%20xml:space=%27preserve%27%3e%3ccircle%20style=%27fill:%23F0F0F0;%27%20cx=%27256%27%20cy=%27256%27%20r=%27256%27/%3e%3cg%3e%3cpath%20style=%27fill:%230052B4;%27%20d=%27M52.92,100.142c-20.109,26.163-35.272,56.318-44.101,89.077h133.178L52.92,100.142z%27/%3e%3cpath%20style=%27fill:%230052B4;%27%20d=%27M503.181,189.219c-8.829-32.758-23.993-62.913-44.101-89.076l-89.075,89.076H503.181z%27/%3e%3cpath%20style=%27fill:%230052B4;%27%20d=%27M8.819,322.784c8.83,32.758,23.993,62.913,44.101,89.075l89.074-89.075L8.819,322.784L8.819,322.784%20z%27/%3e%3cpath%20style=%27fill:%230052B4;%27%20d=%27M411.858,52.921c-26.163-20.109-56.317-35.272-89.076-44.102v133.177L411.858,52.921z%27/%3e%3cpath%20style=%27fill:%230052B4;%27%20d=%27M100.142,459.079c26.163,20.109,56.318,35.272,89.076,44.102V370.005L100.142,459.079z%27/%3e%3cpath%20style=%27fill:%230052B4;%27%20d=%27M189.217,8.819c-32.758,8.83-62.913,23.993-89.075,44.101l89.075,89.075V8.819z%27/%3e%3cpath%20style=%27fill:%230052B4;%27%20d=%27M322.783,503.181c32.758-8.83,62.913-23.993,89.075-44.101l-89.075-89.075V503.181z%27/%3e%3cpath%20style=%27fill:%230052B4;%27%20d=%27M370.005,322.784l89.075,89.076c20.108-26.162,35.272-56.318,44.101-89.076H370.005z%27/%3e%3c/g%3e%3cg%3e%3cpath%20style=%27fill:%23D80027;%27%20d=%27M509.833,222.609h-220.44h-0.001V2.167C278.461,0.744,267.317,0,256,0%20c-11.319,0-22.461,0.744-33.391,2.167v220.44v0.001H2.167C0.744,233.539,0,244.683,0,256c0,11.319,0.744,22.461,2.167,33.391%20h220.44h0.001v220.442C233.539,511.256,244.681,512,256,512c11.317,0,22.461-0.743,33.391-2.167v-220.44v-0.001h220.442%20C511.256,278.461,512,267.319,512,256C512,244.683,511.256,233.539,509.833,222.609z%27/%3e%3cpath%20style=%27fill:%23D80027;%27%20d=%27M322.783,322.784L322.783,322.784L437.019,437.02c5.254-5.252,10.266-10.743,15.048-16.435%20l-97.802-97.802h-31.482V322.784z%27/%3e%3cpath%20style=%27fill:%23D80027;%27%20d=%27M189.217,322.784h-0.002L74.98,437.019c5.252,5.254,10.743,10.266,16.435,15.048l97.802-97.804%20V322.784z%27/%3e%3cpath%20style=%27fill:%23D80027;%27%20d=%27M189.217,189.219v-0.002L74.981,74.98c-5.254,5.252-10.266,10.743-15.048,16.435l97.803,97.803%20H189.217z%27/%3e%3cpath%20style=%27fill:%23D80027;%27%20d=%27M322.783,189.219L322.783,189.219L437.02,74.981c-5.252-5.254-10.743-10.266-16.435-15.047%20l-97.802,97.803V189.219z%27/%3e%3c/g%3e%3c/svg%3e"
                       alt="UK Flag"
                       className="w-4 h-4"
                     />
                     EN
                   </p>
                 </div>
                 <div>
                   <p className="text-xs mb-1" style={{ color: '#4E6993', fontSize: '12px' }}>Code:</p>
                   <p className="text-sm" style={{ fontSize: '14px', fontWeight: 'bold' }}>410</p>
                 </div>
                 <div>
                   <p className="text-xs mb-1" style={{ color: '#4E6993', fontSize: '12px' }}>Auditee name:</p>
                   <p className="text-sm" style={{ fontSize: '14px', fontWeight: 'bold' }}>{currentCustomer.full_name}</p>
                 </div>
                 <div>
                   <p className="text-xs mb-1" style={{ color: '#4E6993', fontSize: '12px' }}>Questions:</p>
                   <p className="text-sm" style={{ fontSize: '14px', fontWeight: 'bold' }}>{completedCount}/{evidenceCount}</p>
                 </div>
                 <div>
                   <p className="text-xs mb-1" style={{ color: '#4E6993', fontSize: '12px' }}>Last update:</p>
                   <p className="text-sm" style={{ fontSize: '14px', fontWeight: 'bold' }}>{lastUpdate || new Date().toLocaleDateString('en-GB')}</p>
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
