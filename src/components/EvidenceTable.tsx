
import { useState } from "react"
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
import { Badge } from "@/components/ui/badge"

// Sample data for demonstration
const sampleEvidence = [
  {
    id: 1,
    question: "What is the organization's data retention policy?",
    answer: "Data is retained for 7 years as per regulatory requirements",
    evidence: "Policy Document Section 4.2, Employee Handbook Page 45",
    confidence: "High",
    source: "policy-doc.pdf"
  },
  {
    id: 2,
    question: "How are access controls implemented?",
    answer: "Role-based access control with multi-factor authentication",
    evidence: "Security Framework Document, Access Control Matrix",
    confidence: "High",
    source: "security-framework.docx"
  },
  {
    id: 3,
    question: "What encryption standards are used?",
    answer: "AES-256 encryption for data at rest, TLS 1.3 for data in transit",
    evidence: "Technical Specification Document Section 3.1",
    confidence: "Medium",
    source: "tech-specs.pdf"
  },
  {
    id: 4,
    question: "How is incident response handled?",
    answer: "24/7 SOC with automated alerting and escalation procedures",
    evidence: "Incident Response Plan, SOC Procedures Manual",
    confidence: "High",
    source: "incident-response.docx"
  },
  {
    id: 5,
    question: "What backup procedures are in place?",
    answer: "Daily automated backups with quarterly restoration testing",
    evidence: "Backup Policy Document, Test Results Q3 2024",
    confidence: "Medium",
    source: "backup-policy.pdf"
  }
]

export function EvidenceTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredEvidence, setFilteredEvidence] = useState(sampleEvidence)

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    const filtered = sampleEvidence.filter(
      item =>
        item.question.toLowerCase().includes(value.toLowerCase()) ||
        item.answer.toLowerCase().includes(value.toLowerCase()) ||
        item.evidence.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredEvidence(filtered)
  }

  const getConfidenceBadge = (confidence: string) => {
    const variant = confidence === "High" ? "default" : confidence === "Medium" ? "secondary" : "outline"
    return <Badge variant={variant}>{confidence}</Badge>
  }

  const exportToCSV = () => {
    const headers = ["Question", "Answer", "Evidence", "Confidence", "Source"]
    const csvContent = [
      headers.join(","),
      ...filteredEvidence.map(item =>
        [item.question, item.answer, item.evidence, item.confidence, item.source]
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
                  <TableHead className="w-[300px]">Question</TableHead>
                  <TableHead className="w-[300px]">Answer</TableHead>
                  <TableHead className="w-[300px]">Evidence</TableHead>
                  <TableHead className="w-[100px]">Confidence</TableHead>
                  <TableHead className="w-[150px]">Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvidence.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "No evidence found matching your search." : "No evidence data available. Upload files to generate evidence."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvidence.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.question}</TableCell>
                      <TableCell>{item.answer}</TableCell>
                      <TableCell className="text-sm">{item.evidence}</TableCell>
                      <TableCell>{getConfidenceBadge(item.confidence)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.source}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredEvidence.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Showing {filteredEvidence.length} of {sampleEvidence.length} evidence items
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
