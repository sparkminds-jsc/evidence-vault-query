
import { FileText, Upload, Table } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface AppSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const menuItems = [
  {
    id: "upload-questions",
    title: "Upload Security Questions",
    icon: Upload,
    description: "Upload Excel file with security questions"
  },
  {
    id: "upload-data",
    title: "Upload Data File",
    icon: FileText,
    description: "Upload PDF or DOCX documents"
  },
  {
    id: "evidence-table",
    title: "Get Evidence",
    icon: Table,
    description: "View questions, answers, and evidence"
  },
]

export function AppSidebar({ activeSection, onSectionChange }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold">
            Document Analysis
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    isActive={activeSection === item.id}
                    onClick={() => onSectionChange(item.id)}
                    className="w-full flex items-start gap-3 p-3 text-left"
                  >
                    <item.icon className="mt-1 flex-shrink-0" size={20} />
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
