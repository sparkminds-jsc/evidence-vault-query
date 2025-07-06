
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface FeedbackHistory {
  id: string
  question_id: string
  description: string | null
  question: string | null
  document_evaluation: string | null
  feedback_evaluation: string | null
  from_audit: string | null
  control_evaluation: string | null
  remediation_guidance: string | null
  feedback_remediation: string | null
  staff_email: string
  last_update: string
}

export function FeedbacksTable() {
  const [feedbacks, setFeedbacks] = useState<FeedbackHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback_history')
        .select('*')
        .order('last_update', { ascending: false })

      if (error) {
        throw error
      }

      setFeedbacks(data || [])
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
      toast({
        title: "Error",
        description: "Failed to fetch feedback history",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      const { error } = await supabase
        .from('feedback_history')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Feedback record deleted successfully"
      })

      // Reload data after deletion
      await fetchFeedbacks()
    } catch (error) {
      console.error('Error deleting feedback:', error)
      toast({
        title: "Error",
        description: "Failed to delete feedback record",
        variant: "destructive"
      })
    } finally {
      setDeleting(null)
    }
  }

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const truncateText = (text: string | null, maxLength: number = 100) => {
    if (!text) return "--"
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div>Loading feedbacks...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Feedbacks</h2>
        <div className="text-sm text-muted-foreground">
          Total: {feedbacks.length} records
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Question ID</TableHead>
              <TableHead className="w-[150px]">Description</TableHead>
              <TableHead className="w-[200px]">Question</TableHead>
              <TableHead className="w-[150px]">Document evaluation by AI</TableHead>
              <TableHead className="w-[150px]">Feedback to AI for future evaluation</TableHead>
              <TableHead className="w-[150px]">Control Evaluation by AI</TableHead>
              <TableHead className="w-[150px]">Remediation Guidance</TableHead>
              <TableHead className="w-[150px]">Feedback to AI for future remediation</TableHead>
              <TableHead className="w-[120px]">Staff Email</TableHead>
              <TableHead className="w-[120px]">Last Update</TableHead>
              <TableHead className="w-[80px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedbacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                  No feedback records found
                </TableCell>
              </TableRow>
            ) : (
              feedbacks.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell className="font-mono text-xs">
                    {feedback.question_id}
                  </TableCell>
                  <TableCell>
                    <div title={feedback.description || ""}>
                      {truncateText(feedback.description, 50)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div title={feedback.question || ""}>
                      {truncateText(feedback.question, 80)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div title={feedback.document_evaluation || ""}>
                      {truncateText(feedback.document_evaluation, 60)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div title={feedback.feedback_evaluation || ""}>
                      {truncateText(feedback.feedback_evaluation, 60)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div title={feedback.control_evaluation || ""}>
                      {truncateText(feedback.control_evaluation, 60)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div title={feedback.remediation_guidance || ""}>
                      {truncateText(feedback.remediation_guidance, 60)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div title={feedback.feedback_remediation || ""}>
                      {truncateText(feedback.feedback_remediation, 60)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {feedback.staff_email}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(feedback.last_update)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(feedback.id)}
                      disabled={deleting === feedback.id}
                      className="text-red-600 hover:text-red-700"
                    >
                      {deleting === feedback.id ? (
                        "Deleting..."
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
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
    </div>
  )
}
