import { useState, useRef } from "react"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { EvidenceViewDialog } from "./EvidenceViewDialog"
import { EvidenceTableHeader } from "./EvidenceTableHeader"
import { EvidenceRowActions } from "./EvidenceRowActions"
import { MarkdownRenderer } from "./MarkdownRenderer"
import { InlineEvidenceEdit } from "./InlineEvidenceEdit"
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
  const savePromiseRef = useRef<Promise<void> | null>(null)

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

  // Get current question index for navigation
  const currentIndex = selectedQuestion 
    ? filteredEvidence.findIndex(item => item.id === selectedQuestion.id)
    : 0

  const saveCurrentEvidence = async () => {
    if (selectedQuestion) {
      const saveFunction = (window as any)[`saveEvidence_${selectedQuestion.id}`]
      if (saveFunction) {
        savePromiseRef.current = saveFunction()
        await savePromiseRef.current
      }
    }
  }

  const callFeedbackAPIs = async (questionId: string) => {
    const question = filteredEvidence.find(q => q.id === questionId)
    if (!question) return

    // Check if feedback evaluation should be called
    const hasEvaluationData = question.document_evaluation_by_ai && question.document_evaluation_by_ai !== "--"
    if (hasEvaluationData) {
      try {
        await handleGetFeedbackEvaluation(questionId)
      } catch (error) {
        console.error('Error calling feedback evaluation:', error)
      }
    }

    // Check if feedback remediation should be called
    const hasRemediationData = question.remediation_guidance && question.remediation_guidance !== "--"
    if (hasRemediationData) {
      try {
        await handleGetFeedbackRemediation(questionId)
      } catch (error) {
        console.error('Error calling feedback remediation:', error)
      }
    }
  }

  const handlePrevious = async () => {
    if (currentIndex > 0) {
      await saveCurrentEvidence()
      const currentQuestionId = selectedQuestion?.id
      if (currentQuestionId) {
        await callFeedbackAPIs(currentQuestionId)
      }
      setSelectedQuestionId(filteredEvidence[currentIndex - 1].id)
    }
  }

  const handleNext = async () => {
    if (currentIndex < filteredEvidence.length - 1) {
      await saveCurrentEvidence()
      const currentQuestionId = selectedQuestion?.id
      if (currentQuestionId) {
        await callFeedbackAPIs(currentQuestionId)
      }
      setSelectedQuestionId(filteredEvidence[currentIndex + 1].id)
    }
  }

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
                        hideEditButton={true}
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

                        {/* Inline Edit Form */}
                        <InlineEvidenceEdit
                          evidence={selectedQuestion}
                          onUpdate={handleUpdateEvidence}
                        />

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
            <div className="flex items-center justify-between text-sm text-muted-foreground p-4 border-t">
              <span>Showing {filteredEvidence.length} of {evidenceData.length} questions</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={currentIndex === filteredEvidence.length - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
