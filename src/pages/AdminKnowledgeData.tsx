import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Database, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
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

export default function AdminKnowledgeData() {
  const [knowledgeData, setKnowledgeData] = useState<KnowledgeDataItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const fetchKnowledgeData = async () => {
    setIsLoading(true)
    try {
      console.log('Fetching all knowledge data for admin...')
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
      console.log('=== Starting admin delete process ===')
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
      
      setKnowledgeData(prevData => 
        prevData.filter(item => item.correct_id !== correctId)
      )

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

  useEffect(() => {
    fetchKnowledgeData()
  }, [])

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Admin Panel</h2>
          <nav className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/manage-staff')}
            >
              <Users className="mr-2 h-4 w-4" />
              Manage Staff
            </Button>
            <Button 
              variant="default" 
              className="w-full justify-start"
              onClick={() => navigate('/admin-knowledge-data')}
            >
              <Database className="mr-2 h-4 w-4" />
              Knowledge Data
            </Button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Knowledge Data Management</h1>
              </div>
              <Button variant="outline" onClick={signOut}>
                Logout
              </Button>
            </div>
            <p className="text-muted-foreground">
              View and manage all submitted correct answers from all staff members
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
                    <TableHead className="min-w-[180px]">Staff Email</TableHead>
                    <TableHead className="w-32">Created Time</TableHead>
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
                        <div className="max-w-[180px]">
                          <p className="text-sm text-blue-700 font-medium" title={item.staff_email}>
                            {truncateText(item.staff_email, 30)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={deletingId === item.correct_id}
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
      </div>
    </div>
  )
}
