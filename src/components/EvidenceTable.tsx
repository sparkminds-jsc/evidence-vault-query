import { useState } from "react"
import { Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { EvidenceViewDialog } from "./EvidenceViewDialog"
import { EvidenceTableHeader } from "./EvidenceTableHeader"
import { EvidenceRowActions } from "./EvidenceRowActions"
import { useEvidenceData } from "@/hooks/useEvidenceData"
import { generatePDFReport } from "@/utils/pdfGenerator"
import { CurrentCustomerDisplay } from "@/components/CurrentCustomerDisplay"
import { useCurrentCustomer } from "@/hooks/useCurrentCustomer"
import { EvidenceItem } from "@/types/evidence"

export function EvidenceTable() {
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const { toast } = useToast()
  const { currentCustomer } = useCurrentCustomer()

  const {
    searchTerm,
    evidenceData,
    filteredEvidence,
    isLoading,
    loadingAnswers,
    loadingRemediations,
    deletingQuestions,
    isDeletingAll,
    handleGetAnswer,
    handleGetRemediation,
    handleDeleteQuestion,
    handleDeleteAllQuestions,
    handleSearch,
    handleUpdateEvidence
  } = useEvidenceData(currentCustomer)

  const handleExportPDF = async () => {
    setIsExportingPDF(true)
    try {
      await generatePDFReport(filteredEvidence)
      toast({
        title: "Success!",
        description: "PDF report has been generated and downloaded",
      })
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsExportingPDF(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Evidence Analysis</h2>
          <p className="text-muted-foreground mt-2">
            Review extracted evidence matching your security questions
          </p>
        </div>
        <CurrentCustomerDisplay currentCustomer={currentCustomer} />
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Loading questions...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if any question is currently being processed
  const isAnyQuestionProcessing = loadingAnswers.size > 0 || loadingRemediations.size > 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Evidence Analysis</h2>
        <p className="text-muted-foreground mt-2">
          Review extracted evidence matching your security questions (one answer at a time)
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          <strong>Note:</strong> The AI Agent will randomly select 3 items from the database (files) that match the question to serve as evidence.
        </p>
      </div>

      <CurrentCustomerDisplay currentCustomer={currentCustomer} />

      <Card>
        <CardHeader>
          <CardTitle>
            <EvidenceTableHeader
              evidenceCount={evidenceData.length}
              isExportingPDF={isExportingPDF}
              isDeletingAll={isDeletingAll}
              isAnyQuestionProcessing={isAnyQuestionProcessing}
              onExportPDF={handleExportPDF}
              onDeleteAll={handleDeleteAllQuestions}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions, answers, or evidence..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Id</TableHead>
                  <TableHead className="w-[150px]">ISO 27001 Control</TableHead>
                  <TableHead className="w-[200px]">Description</TableHead>
                  <TableHead className="w-[250px]">Question</TableHead>
                  <TableHead className="w-[120px]">Document evaluation by AI</TableHead>
                  <TableHead className="w-[150px]">From provided documentation</TableHead>
                  <TableHead className="w-[180px]">Feedback to AI for future evaluation</TableHead>
                  <TableHead className="w-[150px]">From Field Audit (findings)</TableHead>
                  <TableHead className="w-[150px]">Control Evaluation by AI</TableHead>
                  <TableHead className="w-[150px]">Remediation Guidance</TableHead>
                  <TableHead className="w-[180px]">Feedback to AI for future remediation</TableHead>
                  <TableHead className="w-[120px]">Source</TableHead>
                  <TableHead className="w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvidence.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                      {!currentCustomer 
                        ? "Please select a customer in the Manage Customer section first."
                        : searchTerm 
                        ? "No evidence found matching your search." 
                        : "No questions found for the current customer. Upload security questions to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvidence.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.question_id}</TableCell>
                      <TableCell className="text-sm">{item.iso_27001_control || "--"}</TableCell>
                      <TableCell className="text-sm">{item.description || "--"}</TableCell>
                      <TableCell className="font-medium">{item.question}</TableCell>
                      <TableCell>
                        {item.answer === "Yes" ? (
                          <span className="font-bold text-green-700">Yes</span>
                        ) : item.answer === "No" ? (
                          <span className="font-bold text-red-700">No</span>
                        ) : (
                          <span>{item.answer}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.evidence !== "--" ? (
                          <EvidenceViewDialog 
                            questionId={item.id}
                            questionDisplayId={item.question_id}
                          />
                        ) : (
                          <span className="text-muted-foreground">No evidence</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{item.feedback_to_ai || "--"}</TableCell>
                      <TableCell className="text-sm">{item.field_audit_findings || "--"}</TableCell>
                      <TableCell className="text-sm">{item.control_evaluation_by_ai || "--"}</TableCell>
                      <TableCell className="text-sm">{item.remediation_guidance || "--"}</TableCell>
                      <TableCell className="text-sm">{item.feedback_for_remediation || "--"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.source}</TableCell>
                      <TableCell>
                        <EvidenceRowActions
                          questionId={item.id}
                          questionContent={item.question}
                          answer={item.answer}
                          isLoading={loadingAnswers.has(item.id)}
                          isLoadingRemediation={loadingRemediations.has(item.id)}
                          isDeleting={deletingQuestions.has(item.id)}
                          isAnyQuestionProcessing={isAnyQuestionProcessing}
                          evidence={item}
                          onGetAnswer={handleGetAnswer}
                          onGetRemediation={handleGetRemediation}
                          onDelete={handleDeleteQuestion}
                          onUpdate={handleUpdateEvidence}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredEvidence.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Showing {filteredEvidence.length} of {evidenceData.length} questions
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
