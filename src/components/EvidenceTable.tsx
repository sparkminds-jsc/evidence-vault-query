
import { useState, useRef } from "react"
import { ChevronLeft, ChevronRight, FileText, ClipboardCheck, Star, Loader2 } from "lucide-react"
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
import { ControlRatingSelect } from "./ControlRatingSelect"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function EvidenceTable() {
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [isGettingAllEvidences, setIsGettingAllEvidences] = useState(false)
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
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
    handleUpdateEvidence,
    handleUpdateControlRating
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

  const handleGetAllEvidences = async () => {
    setIsGettingAllEvidences(true)
    try {
      // Process questions that don't have evidence yet (answer is "--")
      const questionsToProcess = filteredEvidence.filter(q => q.answer === "--")
      
      for (const question of questionsToProcess) {
        try {
          await handleGetAnswer(question.id, question.question)
          // Show success toast with question_id for each processed question
          toast({
            title: "Success!",
            description: `Evidence retrieved for question ${question.question_id}`,
          })
        } catch (error) {
          console.error(`Error getting evidence for question ${question.id}:`, error)
          toast({
            title: "Error",
            description: `Failed to get evidence for question ${question.question_id}`,
            variant: "destructive"
          })
        }
      }

      toast({
        title: "Process Complete!",
        description: `Processed ${questionsToProcess.length} questions`,
      })
    } catch (error) {
      console.error('Error in Get All Evidences:', error)
      toast({
        title: "Error",
        description: "Failed to process all evidences. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGettingAllEvidences(false)
    }
  }

  // Enhanced handleGetAnswer with toast notification including question_id
  const handleGetAnswerWithToast = async (questionId: string, questionContent: string) => {
    try {
      await handleGetAnswer(questionId, questionContent)
      const question = filteredEvidence.find(q => q.id === questionId)
      toast({
        title: "Success!",
        description: `Evidence retrieved for question ${question?.question_id || questionId}`,
      })
    } catch (error) {
      const question = filteredEvidence.find(q => q.id === questionId)
      toast({
        title: "Error",
        description: `Failed to get evidence for question ${question?.question_id || questionId}`,
        variant: "destructive"
      })
      throw error
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
      setIsNavigating(true)
      try {
        await saveCurrentEvidence()
        const currentQuestionId = selectedQuestion?.id
        if (currentQuestionId) {
          await callFeedbackAPIs(currentQuestionId)
        }
        setSelectedQuestionId(filteredEvidence[currentIndex - 1].id)
      } finally {
        setIsNavigating(false)
      }
    }
  }

  const handleNext = async () => {
    if (currentIndex < filteredEvidence.length - 1) {
      setIsNavigating(true)
      try {
        await saveCurrentEvidence()
        const currentQuestionId = selectedQuestion?.id
        if (currentQuestionId) {
          await callFeedbackAPIs(currentQuestionId)
        }
        setSelectedQuestionId(filteredEvidence[currentIndex + 1].id)
      } finally {
        setIsNavigating(false)
      }
    }
  }

  // Helper function to get status icons for a question
  const getStatusIcons = (item: EvidenceItem) => {
    const hasEvidence = item.answer !== "--" && item.answer !== null && item.answer !== undefined
    const hasEvaluation = item.document_evaluation_by_ai && item.document_evaluation_by_ai !== "--"
    const hasControlRating = item.control_rating_by_ai && item.control_rating_by_ai !== "--"

    return (
      <div className="flex items-center gap-1">
        <FileText className={`h-3 w-3 ${hasEvidence ? 'text-green-600' : 'text-gray-400'}`} />
        <ClipboardCheck className={`h-3 w-3 ${hasEvaluation ? 'text-green-600' : 'text-gray-400'}`} />
        <Star className={`h-3 w-3 ${hasControlRating ? 'text-green-600' : 'text-gray-400'}`} />
      </div>
    )
  }

  // Helper function to calculate completed questions count
  const getCompletedCount = () => {
    return evidenceData.filter(item => {
      const hasEvidence = item.answer !== "--" && item.answer !== null && item.answer !== undefined
      const hasEvaluation = item.document_evaluation_by_ai && item.document_evaluation_by_ai !== "--"
      const hasControlRating = item.control_rating_by_ai && item.control_rating_by_ai !== "--"
      return hasEvidence && hasEvaluation && hasControlRating
    }).length
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CurrentCustomerDisplay 
          currentCustomer={currentCustomer} 
          evidenceCount={0}
          completedCount={0}
        />
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Loading questions...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if any question is currently being processed or if getting all evidences
  const isAnyQuestionProcessing = loadingAnswers.size > 0 || loadingRemediations.size > 0 || loadingEvaluations.size > 0 || loadingFeedbackEvaluations.size > 0 || loadingFeedbackRemediations.size > 0 || isGettingAllEvidences

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <CurrentCustomerDisplay 
          currentCustomer={currentCustomer}
          evidenceCount={evidenceData.length}
          completedCount={getCompletedCount()}
          isExportingPDF={isExportingPDF}
          isDeletingAll={isDeletingAll}
          isAnyQuestionProcessing={isAnyQuestionProcessing}
          isGettingAllEvidences={isGettingAllEvidences}
          onExportPDF={handleExportPDF}
          onDeleteAll={handleDeleteAllQuestions}
          onGetAllEvidences={handleGetAllEvidences}
          lastUpdate={new Date().toLocaleDateString('en-GB')}
        />

        <Card>
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
                <div className="w-80 border-r" style={{ backgroundColor: '#F8FAFC' }}>
                  <div className="p-4">
                    <Input
                      placeholder="Search questions..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full placeholder:italic placeholder:font-normal"
                    />
                  </div>
                  <ScrollArea className="h-[calc(800px-80px)]">
                    <div className="p-2">
                      {filteredEvidence.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3 rounded-md cursor-pointer mb-1 transition-colors border-b ${
                            selectedQuestion?.id === item.id 
                              ? "opacity-100" 
                              : "hover:bg-muted"
                          }`}
                          style={selectedQuestion?.id === item.id ? {
                            backgroundColor: 'rgba(224, 238, 255, 1)',
                            color: 'rgba(25, 103, 195, 1)',
                            borderBottomWidth: '1px',
                            borderColor: 'rgba(235, 237, 242, 1)'
                          } : {
                            borderBottomWidth: '1px',
                            borderColor: 'rgba(235, 237, 242, 1)'
                          }}
                          onClick={() => setSelectedQuestionId(item.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-bold text-sm">{item.question_id}</div>
                            {getStatusIcons(item)}
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
                      <div className="p-4 border-b bg-white">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold">Actions</h3>
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
                            onGetAnswer={handleGetAnswerWithToast}
                            onGetRemediation={handleGetRemediation}
                            onGetEvaluation={handleGetEvaluation}
                            onGetFeedbackEvaluation={handleGetFeedbackEvaluation}
                            onGetFeedbackRemediation={handleGetFeedbackRemediation}
                            onDelete={handleDeleteQuestion}
                            onUpdate={handleUpdateEvidence}
                            hideEditButton={true}
                          />
                        </div>
                      </div>

                      {/* Scrollable Content */}
                      <ScrollArea className="flex-1">
                        <div className="p-6 space-y-6">
                           <div>
                             <h4 className="text-audit-title text-sm text-muted-foreground mb-2">
                               ISO 27001 Control
                             </h4>
                            <div className="text-sm">
                              {selectedQuestion.iso_27001_control || "--"}
                            </div>
                          </div>

                           <div>
                             <h4 className="text-audit-title text-sm text-muted-foreground mb-2">
                               Description
                             </h4>
                            <div className="text-sm">
                              {selectedQuestion.description || "--"}
                            </div>
                          </div>

                           {/* Question section hidden as requested */}
                           {/* <div>
                             <h4 className="text-audit-title text-sm text-muted-foreground mb-2">
                               Question
                             </h4>
                            <div className="text-sm font-medium">
                              {selectedQuestion.question}
                            </div>
                          </div> */}

                           <div>
                             <h4 className="text-audit-title text-sm text-muted-foreground mb-2">
                               From provided documentation
                             </h4>
                            <div className="text-sm">
                              {selectedQuestion.evidence !== "--" && selectedQuestion.evidence !== "No Evidence Found" ? (
                                <EvidenceViewDialog 
                                  questionId={selectedQuestion.id}
                                  questionDisplayId={selectedQuestion.question_id}
                                />
                              ) : selectedQuestion.evidence === "No Evidence Found" ? (
                                <span className="text-muted-foreground">No Evidence Found</span>
                              ) : (
                                <span className="text-muted-foreground">--</span>
                              )}
                            </div>
                          </div>

                          {/* Inline Edit Form */}
                          <InlineEvidenceEdit
                            evidence={selectedQuestion}
                            onUpdate={handleUpdateEvidence}
                          />

                          {/* Control Rating By AI Section */}
                           <div>
                             <h4 className="text-audit-title text-sm text-muted-foreground mb-2">
                               Control Rating By AI
                             </h4>
                            <ControlRatingSelect
                              value={selectedQuestion.control_rating_by_ai}
                              onChange={(rating) => handleUpdateControlRating(selectedQuestion.id, rating)}
                              disabled={isAnyQuestionProcessing}
                            />
                          </div>

                           <div>
                             <h4 className="text-audit-title text-sm text-muted-foreground mb-2">
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
                    disabled={currentIndex === 0 || isNavigating}
                    className={currentIndex === 0 || isNavigating ? "" : "bg-[rgb(44,131,233)] text-white font-bold hover:bg-[rgb(44,131,233)]/90"}
                  >
                    {isNavigating ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <ChevronLeft className="h-4 w-4 mr-1" />
                    )}
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    disabled={currentIndex === filteredEvidence.length - 1 || isNavigating}
                    className={currentIndex === filteredEvidence.length - 1 || isNavigating ? "" : "bg-[rgb(44,131,233)] text-white font-bold hover:bg-[rgb(44,131,233)]/90"}
                  >
                    {isNavigating ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      "Next"
                    )}
                    {!isNavigating && <ChevronRight className="h-4 w-4 ml-1" />}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
