
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Eye } from "lucide-react"

interface EvidenceViewDialogProps {
  evidence: string
  questionId: string
}

export function EvidenceViewDialog({ evidence, questionId }: EvidenceViewDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Evidence Details - {questionId}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] w-full">
          <div className="p-4">
            {evidence !== "--" && evidence.includes('\n• ') ? (
              <div className="space-y-2">
                {evidence.split('\n').map((evidenceItem, index) => (
                  <div key={index} className="text-sm leading-relaxed">
                    {evidenceItem}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm leading-relaxed">
                {evidence === "--" ? "No evidence available" : evidence}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
