import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const filteredData = feedbacks.filter(item =>
    item.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.question_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.staff_email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedItem = filteredData.find(item => item.id === selectedItemId) || filteredData[0]

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
      if (data && data.length > 0) {
        setSelectedItemId(data[0].id)
      }
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

  const deleteFeedbackFromExternalAPI = async (questionId: string) => {
    try {
      const response = await fetch(
        `https://abilene.sparkminds.net/webhook/delete-feedback?quesionId=${questionId}`,
        {
          method: 'DELETE',
          headers: {
            'accept': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to delete feedback from external API: ${response.status}`)
      }

      console.log('Successfully deleted feedback from external API')
    } catch (error) {
      console.error('Error deleting feedback from external API:', error)
      // We'll still show a warning but won't stop the deletion process
      toast({
        title: "Warning",
        description: "Failed to delete feedback from external service, but local record was deleted",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: string) => {
    const feedbackToDelete = feedbacks.find(f => f.id === id)
    if (!feedbackToDelete) {
      toast({
        title: "Error",
        description: "Feedback record not found",
        variant: "destructive"
      })
      return
    }

    setDeleting(id)
    try {
      // First delete from external API
      await deleteFeedbackFromExternalAPI(feedbackToDelete.question_id)

      // Then delete from local database
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

      // Remove from local state
      setFeedbacks(prevData => prevData.filter(item => item.id !== id))

      // Reset selection if deleted item was selected
      if (selectedItem?.id === id) {
        const remainingItems = feedbacks.filter(item => item.id !== id)
        setSelectedItemId(remainingItems.length > 0 ? remainingItems[0].id : null)
      }
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
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading feedback data...</p>
      </div>
    )
  }

  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-12">
        <Trash2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Feedback Data</h3>
        <p className="text-muted-foreground">
          No feedback records have been submitted yet.
        </p>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex h-[800px]">
          {/* Left Sidebar - Questions List */}
          <div className="w-80 border-r" style={{ backgroundColor: '#F8FAFC' }}>
            <div className="p-4">
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full placeholder:italic placeholder:font-normal"
              />
            </div>
            <ScrollArea className="h-[calc(800px-80px)]">
              <div className="p-2">
                {filteredData.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-md cursor-pointer mb-1 transition-colors border-b ${
                      selectedItem?.id === item.id 
                        ? "opacity-100" 
                        : "hover:bg-muted"
                    }`}
                    style={selectedItem?.id === item.id ? {
                      backgroundColor: 'rgba(224, 238, 255, 1)',
                      color: 'rgba(25, 103, 195, 1)',
                      borderBottomWidth: '1px',
                      borderColor: 'rgba(235, 237, 242, 1)'
                    } : {
                      borderBottomWidth: '1px',
                      borderColor: 'rgba(235, 237, 242, 1)'
                    }}
                    onClick={() => setSelectedItemId(item.id)}
                  >
                    <div className="text-sm font-medium mb-1">
                      {truncateText(item.question, 60)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.staff_email}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right Content - Item Details */}
          <div className="flex-1 flex flex-col">
            {selectedItem ? (
              <>
                {/* Actions Header */}
                <div className="p-4 border-b bg-white">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold">Actions</h3>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={deleting === selectedItem.id}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {deleting === selectedItem.id ? "Deleting..." : "Delete"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Feedback Data</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this feedback record? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(selectedItem.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {/* Scrollable Content */}
                <ScrollArea className="flex-1">
                  <div className="p-6 space-y-6">
                    <div>
                      <h4 className="text-audit-title text-sm text-muted-foreground mb-2">
                        Question ID
                      </h4>
                      <div className="text-sm font-medium">
                        {selectedItem.question_id}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-audit-title text-sm text-muted-foreground mb-2">
                        Description
                      </h4>
                      <div className="text-sm">
                        {selectedItem.description || "--"}
                      </div>
                    </div>

                    {/* Question section hidden as requested */}
                    {/* <div>
                      <h4 className="text-audit-title text-sm text-muted-foreground mb-2">
                        Question
                      </h4>
                      <div className="text-sm">
                        {selectedItem.question || "--"}
                      </div>
                    </div> */}

                    <div>
                      <h4 className="text-audit-title text-sm text-muted-foreground mb-2">
                        Document evaluation by AI
                      </h4>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {selectedItem.document_evaluation || "--"}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-audit-title text-sm text-muted-foreground mb-2">
                        Feedback to AI for future evaluation
                      </h4>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {selectedItem.feedback_evaluation || "--"}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-audit-title text-sm text-muted-foreground mb-2">
                        Control Evaluation by AI
                      </h4>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {selectedItem.control_evaluation || "--"}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-audit-title text-sm text-muted-foreground mb-2">
                        Remediation Guidance
                      </h4>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {selectedItem.remediation_guidance || "--"}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-audit-title text-sm text-muted-foreground mb-2">
                        Feedback to AI for future remediation
                      </h4>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {selectedItem.feedback_remediation || "--"}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-audit-title text-sm text-muted-foreground mb-2">
                        Staff Email
                      </h4>
                      <div className="text-sm text-blue-700 font-medium">
                        {selectedItem.staff_email}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-audit-title text-sm text-muted-foreground mb-2">
                        Last Update
                      </h4>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(selectedItem.last_update)}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select an item to view details
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}