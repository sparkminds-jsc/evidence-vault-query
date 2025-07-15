
import { useState } from "react"
import { CorrectAnswerForm } from "@/components/CorrectAnswerForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const KnowledgeDataWrapper = () => {
  const [showForm, setShowForm] = useState(false)

  if (showForm) {
    return (
      <CorrectAnswerForm
        question="Sample question for knowledge data entry"
        evidence="Sample evidence for knowledge data entry"
        answerId="sample-answer-id"
        onCancel={() => setShowForm(false)}
        onSuccess={() => {
          setShowForm(false)
          console.log("Knowledge data submitted successfully")
        }}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Knowledge Data Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">
          Manage knowledge data and correct answers for the system.
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Knowledge Data
        </button>
      </CardContent>
    </Card>
  )
}

export default KnowledgeDataWrapper
