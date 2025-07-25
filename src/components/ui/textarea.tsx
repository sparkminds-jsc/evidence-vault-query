
import * as React from "react"
import { cn } from "@/lib/utils"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean
  showMarkdown?: boolean
}

  const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoResize = false, showMarkdown = false, value, onChange, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const [isFocused, setIsFocused] = React.useState(false)
    
    // Auto-resize functionality
    React.useEffect(() => {
      if (autoResize && textareaRef.current && value !== undefined) {
        const textarea = textareaRef.current
        // Reset height to auto first to get the correct scrollHeight
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }, [value, autoResize])

    // Handle input changes for auto-resize
    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      // Call onChange first to update the state
      if (onChange) {
        onChange(e)
      }
      
      // Handle auto-resize immediately
      if (autoResize && e.target) {
        const textarea = e.target
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }, [onChange, autoResize])

    const handleFocus = React.useCallback(() => {
      setIsFocused(true)
    }, [])

    const handleBlur = React.useCallback(() => {
      setIsFocused(false)
    }, [])

    // Always show textarea to ensure it remains editable
    // Markdown preview functionality temporarily disabled to maintain editability

    return (
      <textarea
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground placeholder:italic placeholder:!font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
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
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
