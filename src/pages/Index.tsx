
import { useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { UploadQuestions } from "@/components/UploadQuestions"
import { UploadData } from "@/components/UploadData"
import { EvidenceTable } from "@/components/EvidenceTable"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"

const Index = () => {
  const [activeSection, setActiveSection] = useState("upload-questions")
  const { signOut } = useAuth()

  const renderContent = () => {
    switch (activeSection) {
      case "upload-questions":
        return <UploadQuestions />
      case "upload-data":
        return <UploadData />
      case "evidence-table":
        return <EvidenceTable />
      default:
        return <UploadQuestions />
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        <main className="flex-1 p-6">
          <div className="mb-6 flex justify-between items-center">
            <SidebarTrigger />
            <Button variant="outline" onClick={signOut}>
              Đăng xuất
            </Button>
          </div>
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

export default Index
