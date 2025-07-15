
import { useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { AppHeader } from "@/components/AppHeader"
import { UploadQuestions } from "@/components/UploadQuestions"
import { UploadData } from "@/components/UploadData"
import { EvidenceTable } from "@/components/EvidenceTable"
import { FeedbacksTable } from "@/components/FeedbacksTable"

const Index = () => {
  const [activeSection, setActiveSection] = useState("upload-questions")

  const renderContent = () => {
    switch (activeSection) {
      case "upload-questions":
        return <UploadQuestions />
      case "upload-data":
        return <UploadData />
      case "evidence-table":
        return <EvidenceTable />
      case "feedbacks":
        return <FeedbacksTable />
      default:
        return <UploadQuestions />
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        {/* Header */}
        <AppHeader />
        
        {/* Main content area */}
        <div className="flex flex-1">
          <AppSidebar 
            activeSection={activeSection} 
            onSectionChange={setActiveSection} 
          />
          <main className="flex-1 pl-[30px] pr-6 py-6 detail-screen">
            <div className="mb-6">
              <SidebarTrigger />
            </div>
            <div className="w-full">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default Index
