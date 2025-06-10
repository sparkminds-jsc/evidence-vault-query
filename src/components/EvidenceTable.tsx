
import { useState, useEffect } from "react"
import { Search, Download, FileText, MessageSquare } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"

interface EvidenceItem {
  id: string
  question_id: string
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
  const [loadingAnswers, setLoadingAnswers] = useState<Set<string>>(new Set())
  const { toast } = useToast()

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
        question_id: question.question_id || "--",
        question: question.content,
        answer: question.answer || "--",
        evidence: question.evidence || "--",
        source: question.source || "--"
      }))

      setEvidenceData(transformedData)
      setFilteredEvidence(transformedData)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetAnswer = async (questionId: string, questionContent: string) => {
    setLoadingAnswers(prev => new Set(prev).add(questionId))
    
    try {
      const response = await fetch(
        `https://abilene.sparkminds.net/webhook/query?prompt=${encodeURIComponent(questionContent)}&userId=001`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to get answer from API')
      }

      const data = await response.json()
      const answer = data.answer || data.response || JSON.stringify(data)

      // Update the question in the database with the answer
      const { error } = await supabase
        .from('questions')
        .update({ 
          answer: answer,
          source: 'api'
        })
        .eq('id', questionId)

      if (error) {
        throw error
      }

      // Update local state
      setEvidenceData(prev => 
        prev.map(item => 
          item.id === questionId 
            ? { ...item, answer: answer, source: 'api' }
            : item
        )
      )
      
      setFilteredEvidence(prev => 
        prev.map(item => 
          item.id === questionId 
            ? { ...item, answer: answer, source: 'api' }
            : item
        )
      )

      toast({
        title: "Success!",
        description: "Answer retrieved and saved successfully",
      })
    } catch (error) {
      console.error('Error getting answer:', error)
      toast({
        title: "Error",
        description: "Failed to get answer. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoadingAnswers(prev => {
        const newSet = new Set(prev)
        newSet.delete(questionId)
        return newSet
      })
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    const filtered = evidenceData.filter(
      item =>
        item.question_id.toLowerCase().includes(value.toLowerCase()) ||
        item.question.toLowerCase().includes(value.toLowerCase()) ||
        item.answer.toLowerCase().includes(value.toLowerCase()) ||
        item.evidence.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredEvidence(filtered)
  }

  const exportToCSV = () => {
    const headers = ["Question ID", "Question", "Answer", "Evidence", "Source"]
    const csvContent = [
      headers.join(","),
      ...filteredEvidence.map(item =>
        [item.question_id, item.question, item.answer, item.evidence, item.source]
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
                  <TableHead className="w-[120px]">Question ID</TableHead>
                  <TableHead className="w-[300px]">Question</TableHead>
                  <TableHead className="w-[300px]">Answer</TableHead>
                  <TableHead className="w-[300px]">Evidence</TableHead>
                  <TableHead className="w-[120px]">Source</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
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
                      <TableCell>{item.answer}</TableCell>
                      <TableCell className="text-sm">{item.evidence}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.source}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleGetAnswer(item.id, item.question)}
                          disabled={loadingAnswers.has(item.id) || item.answer !== "--"}
                          size="sm"
                          variant="outline"
                        >
                          {loadingAnswers.has(item.id) ? (
                            "Loading..."
                          ) : item.answer !== "--" ? (
                            "Done"
                          ) : (
                            <>
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Get Answer
                            </>
                          )}
                        </Button>
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
