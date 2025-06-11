
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

export function EvidenceTable() {
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const { toast } = useToast()

  const {
    searchTerm,
    evidenceData,
    filteredEvidence,
    isLoading,
    loadingAnswers,
    deletingQuestions,
    isDeletingAll,
    handleGetAnswer,
    handleDeleteQuestion,
    handleDeleteAllQuestions,
    handleSearch
  } = useEvidenceData()

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
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Loading questions...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if any question is currently being processed
  const isAnyQuestionProcessing = loadingAnswers.size > 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Evidence Analysis</h2>
        <p className="text-muted-foreground mt-2">
          Review extracted evidence matching your security questions (one answer at a time)
        </p>
      </div>

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
                  <TableHead className="w-[120px]">Question ID</TableHead>
                  <TableHead className="w-[300px]">Question</TableHead>
                  <TableHead className="w-[100px]">Answer</TableHead>
                  <TableHead className="w-[150px]">Evidence</TableHead>
                  <TableHead className="w-[120px]">Source</TableHead>
                  <TableHead className="w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvidence.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "No evidence found matching your search." : "No questions found. Upload security questions to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvidence.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.question_id}</TableCell>
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
                      <TableCell className="text-sm text-muted-foreground">{item.source}</TableCell>
                      <TableCell>
                        <EvidenceRowActions
                          questionId={item.id}
                          questionContent={item.question}
                          answer={item.answer}
                          isLoading={loadingAnswers.has(item.id)}
                          isDeleting={deletingQuestions.has(item.id)}
                          isAnyQuestionProcessing={isAnyQuestionProcessing}
                          onGetAnswer={handleGetAnswer}
                          onDelete={handleDeleteQuestion}
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
