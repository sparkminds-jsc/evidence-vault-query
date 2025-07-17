import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Database, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
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

interface KnowledgeDataItem {
  id: string
  question: string
  evidence: string
  correct_answer: string
  staff_email: string
  created_at: string
  correct_id: string
  status: string
}

export default function KnowledgeData() {
  const [knowledgeData, setKnowledgeData] = useState<KnowledgeDataItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const navigate = useNavigate()

  const filteredData = knowledgeData.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.evidence.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.correct_answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedItem = filteredData.find(item => item.id === selectedItemId) || filteredData[0]

  const fetchKnowledgeData = async () => {
    setIsLoading(true)
    try {
      console.log('Fetching knowledge data...')
      const { data, error } = await supabase
        .from('correct_answers')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching knowledge data:', error)
        toast({
          title: "Error",
          description: "Failed to load knowledge data. Please try again.",
          variant: "destructive"
        })
        return
      }

      console.log('Fetched knowledge data:', data)
      setKnowledgeData(data || [])
      if (data && data.length > 0) {
        setSelectedItemId(data[0].id)
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Failed to load knowledge data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (correctId: string) => {
    setDeletingId(correctId)
    try {
      console.log('=== Starting delete process ===')
      console.log('Deleting correctId:', correctId)
      
      const { data: updatedData, error: updateError } = await supabase
        .from('correct_answers')
        .update({ status: 'deleted' })
        .eq('correct_id', correctId)
        .eq('status', 'active')
        .select('*')

      console.log('Update result:', { updatedData, updateError })

      if (updateError) {
        console.error('Error updating record:', updateError)
        toast({
          title: "Error",
          description: `Failed to delete record: ${updateError.message}`,
          variant: "destructive"
        })
        setDeletingId(null)
        return
      }

      if (!updatedData || updatedData.length === 0) {
        console.warn('No rows were updated - record may already be deleted or not found')
        toast({
          title: "Info",
          description: "Record may have already been deleted.",
        })
        setDeletingId(null)
        return
      }

      console.log('Successfully updated record status:', updatedData[0])
      
      // Remove the record from local state immediately to hide it
      setKnowledgeData(prevData => 
        prevData.filter(item => item.correct_id !== correctId)
      )

      // Reset selection if deleted item was selected
      if (selectedItem?.correct_id === correctId) {
        const remainingItems = knowledgeData.filter(item => item.correct_id !== correctId)
        setSelectedItemId(remainingItems.length > 0 ? remainingItems[0].id : null)
      }

      try {
        console.log('Calling external API for deletion...')
        const response = await fetch('https://abilene.sparkminds.net/webhook/correct', {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            correctId: correctId
          })
        })

        console.log('External API response status:', response.status)
        
        if (!response.ok) {
          const responseText = await response.text()
          console.warn('External API failed but database update succeeded:', response.status, responseText)
        } else {
          console.log('External API call successful')
        }
      } catch (apiError) {
        console.warn('External API call failed but database update succeeded:', apiError)
      }
      
      toast({
        title: "Success",
        description: "Knowledge data deleted successfully.",
      })

      console.log('=== Delete process completed ===')
    } catch (error) {
      console.error('Error in handleDelete:', error)
      toast({
        title: "Error",
        description: "Failed to delete knowledge data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleBack = () => {
    navigate('/')
  }

  useEffect(() => {
    fetchKnowledgeData()
  }, [])

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <Database className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Evidence Tuning</h1>
        </div>
        <p className="text-muted-foreground">
          Manage and review all submitted correct evidences from staffs
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading knowledge data...</p>
        </div>
      ) : knowledgeData.length === 0 ? (
        <div className="text-center py-12">
          <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Knowledge Data</h3>
          <p className="text-muted-foreground">
            No correct answers have been submitted yet.
          </p>
        </div>
      ) : (
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
                          #{index + 1} • {new Date(item.created_at).toLocaleDateString()}
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
                              disabled={deletingId === selectedItem.correct_id}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {deletingId === selectedItem.correct_id ? "Deleting..." : "Delete"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Knowledge Data</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this knowledge data? This will mark it as deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(selectedItem.correct_id)}
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
                            {selectedItem.correct_id}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-audit-title text-sm text-muted-foreground mb-2">
                            Question
                          </h4>
                          <div className="text-sm">
                            {selectedItem.question}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-audit-title text-sm text-muted-foreground mb-2">
                            Evidence
                          </h4>
                          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {selectedItem.evidence}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-audit-title text-sm text-muted-foreground mb-2">
                            Correct Answer
                          </h4>
                          <div className="text-sm font-medium text-green-700 whitespace-pre-wrap">
                            {selectedItem.correct_answer}
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
                            Created Time
                          </h4>
                          <div className="text-sm text-muted-foreground">
                            {new Date(selectedItem.created_at).toLocaleString()}
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
      )}
    </div>
  )
}