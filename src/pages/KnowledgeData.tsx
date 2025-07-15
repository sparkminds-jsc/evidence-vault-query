
import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/AdminSidebar"
import { AppHeader } from "@/components/AppHeader"
import { CorrectAnswerForm } from "@/components/CorrectAnswerForm"

const KnowledgeData = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        {/* Header */}
        <AppHeader />
        
        {/* Main content area */}
        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold mb-8">Knowledge Data</h1>
              <CorrectAnswerForm />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default KnowledgeData
