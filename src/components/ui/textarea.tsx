
import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean
  showMarkdown?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoResize = false, showMarkdown = false, value, onChange, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    
    // Auto-resize functionality
    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }, [value, autoResize])

    // Handle input changes for auto-resize
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        const textarea = e.target
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }
      if (onChange) {
        onChange(e)
      }
    }

    // Format markdown for display
    const formatMarkdown = (text: string) => {
      if (!text) return text
      
      // Convert **bold** to visual bold (using Unicode bold characters for display)
      let formatted = text.replace(/\*\*(.*?)\*\*/g, '𝐁$1')
      
      // Convert *italic* to visual italic
      formatted = formatted.replace(/\*(.*?)\*/g, '𝑰$1')
      
      // Convert ### headers
      formatted = formatted.replace(/### (.*?)(\n|$)/g, '● $1$2')
      
      // Convert ## headers  
      formatted = formatted.replace(/## (.*?)(\n|$)/g, '▪ $1$2')
      
      // Convert # headers
      formatted = formatted.replace(/# (.*?)(\n|$)/g, '■ $1$2')
      
      // Convert - bullet points
      formatted = formatted.replace(/^- (.*?)$/gm, '• $1')
      
      return formatted
    }

    const displayValue = showMarkdown && typeof value === 'string' ? formatMarkdown(value) : value

    return (
      <textarea
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          autoResize ? "min-h-[80px]" : "min-h-[80px]",
          className
        )}
        ref={(node) => {
          textareaRef.current = node
          if (typeof ref === 'function') {
            ref(node)
          } else if (ref) {
            ref.current = node
          }
        }}
        value={displayValue}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
