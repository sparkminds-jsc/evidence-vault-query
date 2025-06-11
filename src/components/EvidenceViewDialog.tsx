
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Eye, FileText } from "lucide-react"

interface EvidenceViewDialogProps {
  evidence: string
  questionId: string
}

interface EvidenceSection {
  fileName: string
  content: string
}

export function EvidenceViewDialog({ evidence, questionId }: EvidenceViewDialogProps) {
  const parseEvidenceIntoSections = (evidenceText: string): EvidenceSection[] => {
    if (evidenceText === "--" || !evidenceText) {
      return []
    }

    // Try to parse from source data if it contains structured evidence
    const sections: EvidenceSection[] = []
    
    // Split by bullet points and try to match with file sources
    const evidenceLines = evidenceText.split('\n').filter(line => line.trim().length > 0)
    
    // Group evidence by looking for patterns or just create numbered sections
    evidenceLines.forEach((line, index) => {
      if (line.startsWith('• ')) {
        const content = line.substring(2).trim()
        sections.push({
          fileName: `Document ${index + 1}`,
          content: content
        })
      } else if (line.trim().length > 0) {
        sections.push({
          fileName: `Document ${index + 1}`,
          content: line.trim()
        })
      }
    })

    return sections
  }

  const evidenceSections = parseEvidenceIntoSections(evidence)
  
  // Generate title based on first evidence section or fallback
  const getDialogTitle = () => {
    if (evidenceSections.length > 0) {
      return `Evidence ${questionId}: Extract from ${evidenceSections[0].fileName}`
    }
    return `Evidence ${questionId}: No evidence available`
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            Detailed evidence extracted from documents for this security question
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[70vh] w-full">
          <div className="p-4 space-y-6">
            {evidenceSections.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No evidence available</p>
                <p className="text-sm">No supporting evidence was found for this question.</p>
              </div>
            ) : (
              evidenceSections.map((section, index) => (
                <div key={index} className="border rounded-lg p-4 bg-muted/20">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                    <FileText className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm text-primary">
                      Evidence {index + 1}: Extract from {section.fileName}
                    </h3>
                  </div>
                  <div className="text-sm leading-relaxed text-foreground bg-background/50 p-3 rounded border-l-4 border-l-primary/30">
                    {section.content}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
