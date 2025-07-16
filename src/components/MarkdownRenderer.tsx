
import React from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content || content === "--") {
    return <span className={`text-muted-foreground ${className}`}>--</span>
  }

  // Simple markdown parsing for basic formatting
  const formatMarkdown = (text: string) => {
    // Convert **bold** to <strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="!font-bold">$1</strong>')
    
    // Convert *italic* to <em>
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Convert line breaks to <br>
    text = text.replace(/\n/g, '<br>')
    
    // Convert ### headers to <h3>
    text = text.replace(/### (.*?)(<br>|$)/g, '<h3 class="font-semibold text-sm mb-1">$1</h3>')
    
    // Convert ## headers to <h2>
    text = text.replace(/## (.*?)(<br>|$)/g, '<h2 class="font-semibold text-base mb-2">$1</h2>')
    
    // Convert # headers to <h1>
    text = text.replace(/# (.*?)(<br>|$)/g, '<h1 class="font-bold text-lg mb-2">$1</h1>')
    
    // Convert - bullet points to <ul><li>
    text = text.replace(/^- (.*?)(<br>|$)/gm, '<li class="ml-4 list-disc">$1</li>')
    text = text.replace(/(<li.*?<\/li>)/gs, '<ul class="mb-2">$1</ul>')
    
    // Convert numbered lists
    text = text.replace(/^\d+\. (.*?)(<br>|$)/gm, '<li class="ml-4 list-decimal">$1</li>')
    
    return text
  }

  const formattedContent = formatMarkdown(content)

  return (
    <div 
      className={`text-sm ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedContent }}
    />
  )
}
