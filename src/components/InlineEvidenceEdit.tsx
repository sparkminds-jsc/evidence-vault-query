import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { EvidenceItem } from "@/types/evidence"
import { useAuth } from "@/contexts/AuthContext"

interface InlineEvidenceEditProps {
  evidence: EvidenceItem
  onUpdate: (updatedEvidence: EvidenceItem) => void
}

interface FormData {
  document_evaluation_by_ai: string
  feedback_to_ai: string
  field_audit_findings: string
  control_evaluation_by_ai: string
  remediation_guidance: string
  feedback_for_remediation: string
}

export function InlineEvidenceEdit({ evidence, onUpdate }: InlineEvidenceEditProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [formData, setFormData] = useState<FormData>({
    document_evaluation_by_ai: evidence.document_evaluation_by_ai === "--" ? "" : (evidence.document_evaluation_by_ai || ""),
    feedback_to_ai: evidence.feedback_to_ai === "--" ? "" : (evidence.feedback_to_ai || ""),
    field_audit_findings: evidence.field_audit_findings === "--" ? "" : (evidence.field_audit_findings || ""),
    control_evaluation_by_ai: evidence.control_evaluation_by_ai === "--" ? "" : (evidence.control_evaluation_by_ai || ""),
    remediation_guidance: evidence.remediation_guidance === "--" ? "" : (evidence.remediation_guidance || ""),
    feedback_for_remediation: evidence.feedback_for_remediation === "--" ? "" : (evidence.feedback_for_remediation || ""),
  })

  // Update form data when evidence changes
  useEffect(() => {
    setFormData({
      document_evaluation_by_ai: evidence.document_evaluation_by_ai === "--" ? "" : (evidence.document_evaluation_by_ai || ""),
      feedback_to_ai: evidence.feedback_to_ai === "--" ? "" : (evidence.feedback_to_ai || ""),
      field_audit_findings: evidence.field_audit_findings === "--" ? "" : (evidence.field_audit_findings || ""),
      control_evaluation_by_ai: evidence.control_evaluation_by_ai === "--" ? "" : (evidence.control_evaluation_by_ai || ""),
      remediation_guidance: evidence.remediation_guidance === "--" ? "" : (evidence.remediation_guidance || ""),
      feedback_for_remediation: evidence.feedback_for_remediation === "--" ? "" : (evidence.feedback_for_remediation || ""),
    })
  }, [evidence])

  const handleFieldChange = (field: keyof FormData, value: string) => {
    console.log('handleFieldChange called:', field, value)
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      }
      console.log('New formData:', newData)
      return newData
    })
  }

  const saveFeedbackHistory = async (data: FormData) => {
    if (!user?.email) return

    try {
      // Check if feedback history already exists for this question_id
      const { data: existingHistory, error: fetchError } = await supabase
        .from('feedback_history')
        .select('id')
        .eq('question_id', evidence.id)
        .eq('staff_email', user.email)
        .single()

      const historyData = {
        question_id: evidence.id,
        description: evidence.description || null,
        question: evidence.question || null,
        document_evaluation: data.document_evaluation_by_ai || null,
        feedback_evaluation: data.feedback_to_ai || null,
        from_audit: data.field_audit_findings || null,
        control_evaluation: data.control_evaluation_by_ai || null,
        remediation_guidance: data.remediation_guidance || null,
        feedback_remediation: data.feedback_for_remediation || null,
        staff_email: user.email,
        last_update: new Date().toISOString()
      }

      if (existingHistory && !fetchError) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('feedback_history')
          .update(historyData)
          .eq('id', existingHistory.id)

        if (updateError) {
          console.error('Error updating feedback history:', updateError)
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('feedback_history')
          .insert([historyData])

        if (insertError) {
          console.error('Error inserting feedback history:', insertError)
        }
      }
    } catch (error) {
      console.error('Error saving feedback history:', error)
    }
  }

  const saveData = async () => {
    try {
      const { error } = await supabase
        .from('questions')
        .update({
          document_evaluation_by_ai: formData.document_evaluation_by_ai || null,
          feedback_to_ai: formData.feedback_to_ai || null,
          field_audit_findings: formData.field_audit_findings || null,
          control_evaluation_by_ai: formData.control_evaluation_by_ai || null,
          remediation_guidance: formData.remediation_guidance || null,
          feedback_for_remediation: formData.feedback_for_remediation || null,
        })
        .eq('id', evidence.id)

      if (error) {
        throw error
      }

      // Save to feedback history
      await saveFeedbackHistory(formData)

      const updatedEvidence: EvidenceItem = {
        ...evidence,
        document_evaluation_by_ai: formData.document_evaluation_by_ai || "--",
        feedback_to_ai: formData.feedback_to_ai || "--",
        field_audit_findings: formData.field_audit_findings || "--",
        control_evaluation_by_ai: formData.control_evaluation_by_ai || "--",
        remediation_guidance: formData.remediation_guidance || "--",
        feedback_for_remediation: formData.feedback_for_remediation || "--",
      }

      onUpdate(updatedEvidence)
      
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
    }
  }

  // Expose save function for external calls
  useEffect(() => {
    // Store the save function reference on window for external access
    (window as any)[`saveEvidence_${evidence.id}`] = saveData
    
    // Cleanup on unmount
    return () => {
      delete (window as any)[`saveEvidence_${evidence.id}`]
    }
  }, [formData, evidence.id])

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-audit-title text-sm text-muted-foreground mb-2">
          Document evaluation by AI
        </h4>
        <Textarea 
          placeholder="Enter document evaluation by AI..."
          autoResize={true}
          showMarkdown={true}
          value={formData.document_evaluation_by_ai}
          onChange={(e) => handleFieldChange('document_evaluation_by_ai', e.target.value)}
        />
      </div>

      <div>
        <h4 className="text-audit-title text-sm text-muted-foreground mb-2">
          Feedback to AI for future evaluation
        </h4>
        <Textarea 
          placeholder="Enter feedback for AI..."
          autoResize={true}
          showMarkdown={true}
          value={formData.feedback_to_ai}
          onChange={(e) => handleFieldChange('feedback_to_ai', e.target.value)}
        />
      </div>

      <div>
        <h4 className="text-audit-title text-sm text-muted-foreground mb-2">
          From Field Audit (findings)
        </h4>
        <Textarea 
          placeholder="Enter field audit findings..."
          autoResize={true}
          showMarkdown={true}
          value={formData.field_audit_findings}
          onChange={(e) => handleFieldChange('field_audit_findings', e.target.value)}
        />
      </div>

      <div>
        <h4 className="text-audit-title text-sm text-muted-foreground mb-2">
          Control Evaluation by AI
        </h4>
        <Textarea 
          placeholder="Enter control evaluation..."
          autoResize={true}
          showMarkdown={true}
          value={formData.control_evaluation_by_ai}
          onChange={(e) => handleFieldChange('control_evaluation_by_ai', e.target.value)}
        />
      </div>

      <div>
        <h4 className="text-audit-title text-sm text-muted-foreground mb-2">
          Remediation Guidance
        </h4>
        <Textarea 
          placeholder="Enter remediation guidance..."
          autoResize={true}
          showMarkdown={true}
          value={formData.remediation_guidance}
          onChange={(e) => handleFieldChange('remediation_guidance', e.target.value)}
        />
      </div>

      <div>
        <h4 className="text-audit-title text-sm text-muted-foreground mb-2">
          Feedback to AI for future remediation
        </h4>
        <Textarea 
          placeholder="Enter feedback for remediation..."
          autoResize={true}
          showMarkdown={true}
          value={formData.feedback_for_remediation}
          onChange={(e) => handleFieldChange('feedback_for_remediation', e.target.value)}
        />
      </div>
    </div>
  )
}
