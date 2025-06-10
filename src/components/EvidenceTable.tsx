
import { useState, useEffect } from "react"
import { Search, Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { supabase } from "@/integrations/supabase/client"

interface EvidenceItem {
  id: string
  question: string
  answer: string
  evidence: string
  source: string
}

export function EvidenceTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [evidenceData, setEvidenceData] = useState<EvidenceItem[]>([])
  const [filteredEvidence, setFilteredEvidence] = useState<EvidenceItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchQuestionsFromDatabase()
  }, [])

  const fetchQuestionsFromDatabase = async () => {
    try {
      const { data: questions, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching questions:', error)
        return
      }

      // Transform questions to evidence format
      const transformedData: EvidenceItem[] = questions.map(question => ({
        id: question.id,
        question: question.content,
        answer: "--",
        evidence: "--",
        source: "--"
      }))

      setEvidenceData(transformedData)
      setFilteredEvidence(transformedData)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    const filtered = evidenceData.filter(
      item =>
        item.question.toLowerCase().includes(value.toLowerCase()) ||
        item.answer.toLowerCase().includes(value.toLowerCase()) ||
        item.evidence.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredEvidence(filtered)
  }

  const exportToCSV = () => {
    const headers = ["ID", "Question", "Answer", "Evidence", "Source"]
    const csvContent = [
      headers.join(","),
      ...filteredEvidence.map(item =>
        [item.id, item.question, item.answer, item.evidence, item.source]
          .map(field => `"${field.replace(/"/g, '""')}"`)
          .join(",")
      )
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "evidence-report.csv"
    a.click()
    window.URL.revokeObjectURL(url)
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Evidence Analysis</h2>
        <p className="text-muted-foreground mt-2">
          Review extracted evidence matching your security questions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Evidence Report
            </div>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
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
                  <TableHead className="w-[200px]">ID</TableHead>
                  <TableHead className="w-[300px]">Question</TableHead>
                  <TableHead className="w-[300px]">Answer</TableHead>
                  <TableHead className="w-[300px]">Evidence</TableHead>
                  <TableHead className="w-[150px]">Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvidence.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "No evidence found matching your search." : "No questions found. Upload security questions to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvidence.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.id.slice(0, 8)}...</TableCell>
                      <TableCell className="font-medium">{item.question}</TableCell>
                      <TableCell>{item.answer}</TableCell>
                      <TableCell className="text-sm">{item.evidence}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.source}</TableCell>
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
