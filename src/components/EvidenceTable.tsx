
import { useState } from "react"
import { Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { EvidenceViewDialog } from "./EvidenceViewDialog"
import { EvidenceTableHeader } from "./EvidenceTableHeader"
import { EvidenceRowActions } from "./EvidenceRowActions"
import { MarkdownRenderer } from "./MarkdownRenderer"
import { useEvidenceData } from "@/hooks/useEvidenceData"
import { generatePDFReport } from "@/utils/pdfGenerator"
import { CurrentCustomerDisplay } from "@/components/CurrentCustomerDisplay"
import { useCurrentCustomer } from "@/hooks/useCurrentCustomer"
import { EvidenceItem } from "@/types/evidence"
import { ScrollArea } from "@/components/ui/scroll-area"

export function EvidenceTable() {
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  const { toast } = useToast()
  const { currentCustomer } = useCurrentCustomer()

  const {
    searchTerm,
    evidenceData,
    filteredEvidence,
    isLoading,
    loadingAnswers,
    loadingRemediations,
    loadingEvaluations,
    loadingFeedbackEvaluations,
    loadingFeedbackRemediations,
    deletingQuestions,
    isDeletingAll,
    handleGetAnswer,
    handleGetRemediation,
    handleGetEvaluation,
    handleGetFeedbackEvaluation,
    handleGetFeedbackRemediation,
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

  // Set first question as selected by default
  const selectedQuestion = selectedQuestionId 
    ? filteredEvidence.find(item => item.id === selectedQuestionId)
    : filteredEvidence[0]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Audit Results</h2>
          <p className="text-muted-foreground mt-2">
            Review extracted evidence matching your security questions (one answer at a time)
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
  const isAnyQuestionProcessing = loadingAnswers.size > 0 || loadingRemediations.size > 0 || loadingEvaluations.size > 0 || loadingFeedbackEvaluations.size > 0 || loadingFeedbackRemediations.size > 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Audit Results</h2>
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
        <CardContent className="p-0">
          {filteredEvidence.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground p-6">
              {!currentCustomer 
                ? "Please select an auditee in the Auditees section first."
                : searchTerm 
                ? "No evidence found matching your search." 
                : "No questions found for the current auditee. Upload security questions to get started."}
            </div>
          ) : (
            <div className="flex h-[800px]">
              {/* Left Sidebar - Questions List */}
              <div className="w-80 border-r bg-muted/20">
                <div className="p-4 border-b">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search questions..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <ScrollArea className="h-[calc(800px-80px)]">
                  <div className="p-2">
                    {filteredEvidence.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-md cursor-pointer mb-1 transition-colors ${
                          selectedQuestion?.id === item.id 
                            ? "opacity-100" 
                            : "hover:bg-muted"
                        }`}
                        style={selectedQuestion?.id === item.id ? {
                          backgroundColor: 'rgba(224, 238, 255, 1)',
                          color: 'rgba(25, 103, 195, 1)'
                        } : {}}
                        onClick={() => setSelectedQuestionId(item.id)}
                      >
                        <div className="font-medium">{item.question_id}</div>
                        <div className="text-sm opacity-80 truncate mt-1">
                          {item.question}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Right Content - Question Details */}
              <div className="flex-1 flex flex-col">
                {selectedQuestion ? (
                  <>
                    {/* Actions Header */}
                    <div className="p-4 border-b bg-background">
                      <h3 className="font-semibold mb-3">Actions</h3>
                      <EvidenceRowActions
                        questionId={selectedQuestion.id}
                        questionContent={selectedQuestion.question}
                        answer={selectedQuestion.answer}
                        isLoading={loadingAnswers.has(selectedQuestion.id)}
                        isLoadingRemediation={loadingRemediations.has(selectedQuestion.id)}
                        isLoadingEvaluation={loadingEvaluations.has(selectedQuestion.id)}
                        isLoadingFeedbackEvaluation={loadingFeedbackEvaluations.has(selectedQuestion.id)}
                        isLoadingFeedbackRemediation={loadingFeedbackRemediations.has(selectedQuestion.id)}
                        isDeleting={deletingQuestions.has(selectedQuestion.id)}
                        isAnyQuestionProcessing={isAnyQuestionProcessing}
                        evidence={selectedQuestion}
                        onGetAnswer={handleGetAnswer}
                        onGetRemediation={handleGetRemediation}
                        onGetEvaluation={handleGetEvaluation}
                        onGetFeedbackEvaluation={handleGetFeedbackEvaluation}
                        onGetFeedbackRemediation={handleGetFeedbackRemediation}
                        onDelete={handleDeleteQuestion}
                        onUpdate={handleUpdateEvidence}
                      />
                    </div>

                    {/* Scrollable Content */}
                    <ScrollArea className="flex-1">
                      <div className="p-6 space-y-6">
                        <div>
                          <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                            ISO 27001 Control
                          </h4>
                          <div className="text-sm">
                            {selectedQuestion.iso_27001_control || "--"}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                            Description
                          </h4>
                          <div className="text-sm">
                            {selectedQuestion.description || "--"}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                            Question
                          </h4>
                          <div className="text-sm font-medium">
                            {selectedQuestion.question}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                            From provided documentation
                          </h4>
                          <div className="text-sm">
                            {selectedQuestion.evidence !== "--" ? (
                              <EvidenceViewDialog 
                                questionId={selectedQuestion.id}
                                questionDisplayId={selectedQuestion.question_id}
                              />
                            ) : (
                              <span className="text-muted-foreground">No evidence</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                            Document evaluation by AI
                          </h4>
                          <div className="text-sm">
                            <MarkdownRenderer content={selectedQuestion.document_evaluation_by_ai || "--"} />
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                            Feedback to AI for future evaluation
                          </h4>
                          <div className="text-sm">
                            {selectedQuestion.feedback_to_ai || "--"}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                            From Field Audit (findings)
                          </h4>
                          <div className="text-sm">
                            {selectedQuestion.field_audit_findings || "--"}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                            Control Evaluation by AI
                          </h4>
                          <div className="text-sm">
                            <MarkdownRenderer content={selectedQuestion.control_evaluation_by_ai || "--"} />
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                            Remediation Guidance
                          </h4>
                          <div className="text-sm">
                            <MarkdownRenderer content={selectedQuestion.remediation_guidance || "--"} />
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                            Feedback to AI for future remediation
                          </h4>
                          <div className="text-sm">
                            {selectedQuestion.feedback_for_remediation || "--"}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                            Source
                          </h4>
                          <div className="text-sm text-muted-foreground">
                            {selectedQuestion.source}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    Select a question from the left to view details
                  </div>
                )}
              </div>
            </div>
          )}

          {filteredEvidence.length > 0 && (
            <div className="text-sm text-muted-foreground p-4 border-t">
              Showing {filteredEvidence.length} of {evidenceData.length} questions
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
