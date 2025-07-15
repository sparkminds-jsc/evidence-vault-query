
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

interface ActionButtonProps {
  onClick: () => void
  size?: "sm" | "default" | "lg" | "icon"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "custom"
  disabled?: boolean
  isLoading?: boolean
  loadingText?: string
  icon?: LucideIcon
  children: React.ReactNode
  isCompleted?: boolean
}

export function ActionButton({
  onClick,
  size = "sm",
  variant = "custom",
  disabled = false,
  isLoading = false,
  loadingText = "Loading...",
  icon: Icon,
  children,
  isCompleted = false
}: ActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      size={size}
      variant={variant}
      disabled={disabled}
    >
      {isLoading ? (
        loadingText
      ) : (
        <>
          {Icon && <Icon className={`h-4 w-4 mr-1 ${isCompleted ? 'text-green-600' : ''}`} />}
          {children}
        </>
      )}
    </Button>
  )
}
