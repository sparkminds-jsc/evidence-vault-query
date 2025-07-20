import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const AICommands = () => {
  const [evaluationCommand, setEvaluationCommand] = useState('')
  const [controlCommand, setControlCommand] = useState('')
  const [remediationGuidanceCommand, setRemediationGuidanceCommand] = useState('')
  const [controlRatingCommand, setControlRatingCommand] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadCommands()
  }, [user])

  const loadCommands = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('ai_commands')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Error loading AI commands:', error)
        toast({
          title: "Error",
          description: "Failed to load AI commands",
          variant: "destructive",
        })
      } else if (data) {
        setEvaluationCommand(data.evaluation_command || '')
        setControlCommand(data.control_command || '')
        setRemediationGuidanceCommand(data.remediation_guidance_command || '')
        setControlRatingCommand(data.control_rating_command || '')
      }
    } catch (error) {
      console.error('Error loading AI commands:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('ai_commands')
        .upsert({
          user_id: user.id,
          evaluation_command: evaluationCommand,
          control_command: controlCommand,
          remediation_guidance_command: remediationGuidanceCommand,
          control_rating_command: controlRatingCommand,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving AI commands:', error)
        toast({
          title: "Error",
          description: "Failed to save AI commands",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "AI commands saved successfully",
        })
      }
    } catch (error) {
      console.error('Error saving AI commands:', error)
      toast({
        title: "Error",
        description: "Failed to save AI commands",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">AI Commands</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configure AI Commands</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* AI Command to Get Evaluation */}
            <div className="space-y-2">
              <Label htmlFor="evaluation-command">
                AI Command to Get Evaluation
              </Label>
              <Textarea
                id="evaluation-command"
                placeholder="Enter AI command for evaluation..."
                value={evaluationCommand}
                onChange={(e) => setEvaluationCommand(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            {/* AI Command to Control Evaluation */}
            <div className="space-y-2">
              <Label htmlFor="control-command">
                AI Command to Control Evaluation
              </Label>
              <Textarea
                id="control-command"
                placeholder="Enter AI command for control evaluation..."
                value={controlCommand}
                onChange={(e) => setControlCommand(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            {/* AI Command to Remediation Guidance */}
            <div className="space-y-2">
              <Label htmlFor="remediation-guidance-command">
                AI Command to Remediation Guidance
              </Label>
              <Textarea
                id="remediation-guidance-command"
                placeholder="Enter AI command for remediation guidance..."
                value={remediationGuidanceCommand}
                onChange={(e) => setRemediationGuidanceCommand(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            {/* AI Command to Control Rating */}
            <div className="space-y-2">
              <Label htmlFor="control-rating-command">
                AI Command to Control Rating
              </Label>
              <Textarea
                id="control-rating-command"
                placeholder="Enter AI command for control rating..."
                value={controlRatingCommand}
                onChange={(e) => setControlRatingCommand(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleSave}
                disabled={loading}
                className="min-w-[120px]"
              >
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AICommands