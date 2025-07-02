
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { EvidenceItem } from "@/types/evidence"

interface EvidenceEditDialogProps {
  evidence: EvidenceItem
  onUpdate: (updatedEvidence: EvidenceItem) => void
}

interface FormData {
  answer: string
  feedback_to_ai: string
  field_audit_findings: string
  control_evaluation_by_ai: string
  remediation_guidance: string
  feedback_for_remediation: string
}

export function EvidenceEditDialog({ evidence, onUpdate }: EvidenceEditDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormData>({
    defaultValues: {
      answer: evidence.answer === "--" ? "" : evidence.answer,
      feedback_to_ai: evidence.feedback_to_ai === "--" ? "" : evidence.feedback_to_ai,
      field_audit_findings: evidence.field_audit_findings === "--" ? "" : evidence.field_audit_findings,
      control_evaluation_by_ai: evidence.control_evaluation_by_ai === "--" ? "" : evidence.control_evaluation_by_ai,
      remediation_guidance: evidence.remediation_guidance === "--" ? "" : evidence.remediation_guidance,
      feedback_for_remediation: evidence.feedback_for_remediation === "--" ? "" : evidence.feedback_for_remediation,
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('questions')
        .update({
          answer: data.answer || null,
          feedback_to_ai: data.feedback_to_ai || null,
          field_audit_findings: data.field_audit_findings || null,
          control_evaluation_by_ai: data.control_evaluation_by_ai || null,
          remediation_guidance: data.remediation_guidance || null,
          feedback_for_remediation: data.feedback_for_remediation || null,
        })
        .eq('id', evidence.id)

      if (error) {
        throw error
      }

      const updatedEvidence: EvidenceItem = {
        ...evidence,
        answer: data.answer || "--",
        feedback_to_ai: data.feedback_to_ai || "--",
        field_audit_findings: data.field_audit_findings || "--",
        control_evaluation_by_ai: data.control_evaluation_by_ai || "--",
        remediation_guidance: data.remediation_guidance || "--",
        feedback_for_remediation: data.feedback_for_remediation || "--",
      }

      onUpdate(updatedEvidence)
      setOpen(false)
      
      toast({
        title: "Success!",
        description: "Evidence updated successfully",
      })
    } catch (error) {
      console.error('Error updating evidence:', error)
      toast({
        title: "Error",
        description: "Failed to update evidence. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Evidence</DialogTitle>
          <DialogDescription>
            Update the evidence evaluation and feedback information.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document evaluation by AI</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select evaluation" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="feedback_to_ai"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback to AI for future evaluation</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter feedback for AI..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="field_audit_findings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Field Audit (findings)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter field audit findings..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="control_evaluation_by_ai"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Control Evaluation by AI</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter control evaluation..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remediation_guidance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remediation Guidance</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter remediation guidance..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="feedback_for_remediation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback to AI for future remediation</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter feedback for remediation..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
