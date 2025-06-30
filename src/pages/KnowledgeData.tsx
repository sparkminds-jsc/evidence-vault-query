import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Database, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  const { toast } = useToast()
  const navigate = useNavigate()

  const fetchKnowledgeData = async () => {
    setIsLoading(true)
    try {
      console.log('Fetching knowledge data...')
      const { data, error } = await supabase
        .from('correct_answers')
        .select('*')
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
      
      // Update the record status to 'deleted' using correct_id
      console.log('Updating record status to deleted...')
      const { data: updatedData, error: updateError } = await supabase
        .from('correct_answers')
        .update({ status: 'deleted' })
        .eq('correct_id', correctId)
        .eq('status', 'active') // Only update if currently active
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
      
      // Update local state to reflect the status change
      setKnowledgeData(prevData => 
        prevData.map(item => 
          item.correct_id === correctId 
            ? { ...item, status: 'deleted' }
            : item
        )
      )

      // Call external API to delete (non-blocking)
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
    console.log('Back button clicked, navigating to home page')
    navigate('/')
  }

  useEffect(() => {
    fetchKnowledgeData()
  }, [])

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
      case 'deleted':
        return <Badge variant="destructive">Deleted</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
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
          <h1 className="text-3xl font-bold">Knowledge Data</h1>
        </div>
        <p className="text-muted-foreground">
          Manage and review all submitted correct answers from staff members
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
        <div className="bg-white rounded-lg shadow-sm border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">No</TableHead>
                <TableHead className="min-w-[200px]">Question</TableHead>
                <TableHead className="min-w-[300px]">Evidence</TableHead>
                <TableHead className="min-w-[200px]">Correct Answer</TableHead>
                <TableHead className="w-32">Created Time</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-24">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {knowledgeData.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      <p className="text-sm" title={item.question}>
                        {truncateText(item.question, 100)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[300px]">
                      <p className="text-sm text-muted-foreground" title={item.evidence}>
                        {truncateText(item.evidence, 150)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      <p className="text-sm font-medium text-green-700" title={item.correct_answer}>
                        {truncateText(item.correct_answer, 100)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(item.status)}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={deletingId === item.correct_id || item.status === 'deleted'}
                        >
                          <Trash2 className="h-4 w-4" />
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
                            onClick={() => handleDelete(item.correct_id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
