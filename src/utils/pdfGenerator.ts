
import jsPDF from "jspdf"
import { supabase } from "@/integrations/supabase/client"
import { EvidenceItem } from "@/types/evidence"

const decodeFileName = (fileName: string): string => {
  return decodeURIComponent(fileName.replace(/%20/g, ' '))
}

export const generatePDFReport = async (filteredEvidence: EvidenceItem[]) => {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  let yPosition = 30
  const margin = 20

  // Header
  pdf.setFontSize(18)
  pdf.setFont('helvetica', 'bold')
  pdf.text('SupplierShield Security Audit Report', margin, yPosition)
  
  yPosition += 15
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Provided by SupplierShield, version 1.0', margin, yPosition)
  
  yPosition += 20

  // Introduction section
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text('1. Introduction', margin, yPosition)
  yPosition += 10

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  const introText = `This report presents the results of a comprehensive security audit conducted by SupplierShield. Leveraging advanced AI-driven auditing processes, SupplierShield evaluated key security parameters, risk exposure, and compliance alignment for the client organization.

The goal of this audit is to identify vulnerabilities, ensure adherence to best practices, and provide actionable insights to strengthen the client's cybersecurity posture. All findings in this report are based on automated and manual assessments performed using SupplierShield's proprietary tools and methodologies.`
  
  const splitIntro = pdf.splitTextToSize(introText, pageWidth - 2 * margin)
  pdf.text(splitIntro, margin, yPosition)
  yPosition += splitIntro.length * 4 + 15

  // Check for page break
  if (yPosition > pageHeight - 60) {
    pdf.addPage()
    yPosition = 30
  }

  // Report details section
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text('1.1 Report Details', margin, yPosition)
  yPosition += 10

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  const currentTime = new Date().toLocaleString()
  const approvedTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString()
  
  pdf.text(`Created By: SupplierShield AI Agent`, margin, yPosition)
  yPosition += 6
  pdf.text(`Created Time: ${currentTime}`, margin, yPosition)
  yPosition += 6
  pdf.text(`Approved By: John Doe (001)`, margin, yPosition)
  yPosition += 6
  pdf.text(`Approved Time: ${approvedTime}`, margin, yPosition)
  yPosition += 20

  // Check for page break
  if (yPosition > pageHeight - 60) {
    pdf.addPage()
    yPosition = 30
  }

  // Executive Summary section
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text('2. Executive Summary', margin, yPosition)
  yPosition += 15

  // Answer statistics
  const answerCounts = filteredEvidence.reduce((acc, item) => {
    if (item.answer === "Yes") acc.yes++
    else if (item.answer === "No") acc.no++
    else acc.other++
    return acc
  }, { yes: 0, no: 0, other: 0 })

  const total = filteredEvidence.length
  
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text('2.1 Answer Distribution:', margin, yPosition)
  yPosition += 10

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Total Questions Analyzed: ${total}`, margin, yPosition)
  yPosition += 8
  
  // Format answers with colors in PDF
  pdf.setTextColor(0, 100, 0) // Dark green
  pdf.setFont('helvetica', 'bold')
  pdf.text(`Compliant (Yes): ${answerCounts.yes} (${total > 0 ? ((answerCounts.yes / total) * 100).toFixed(1) : 0}%)`, margin, yPosition)
  yPosition += 6
  
  pdf.setTextColor(139, 0, 0) // Dark red
  pdf.text(`Non-Compliant (No): ${answerCounts.no} (${total > 0 ? ((answerCounts.no / total) * 100).toFixed(1) : 0}%)`, margin, yPosition)
  yPosition += 6
  
  pdf.setTextColor(0, 0, 0) // Reset to black
  pdf.setFont('helvetica', 'normal')
  if (answerCounts.other > 0) {
    pdf.text(`Pending/Other: ${answerCounts.other} (${total > 0 ? ((answerCounts.other / total) * 100).toFixed(1) : 0}%)`, margin, yPosition)
    yPosition += 6
  }

  yPosition += 15

  // Check for page break
  if (yPosition > pageHeight - 60) {
    pdf.addPage()
    yPosition = 30
  }

  // Summary Table section
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text('2.2 Questions Summary', margin, yPosition)
  yPosition += 15

  // Table headers
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(0, 0, 0)
  pdf.text('ID', margin, yPosition)
  pdf.text('Question', margin + 25, yPosition)
  pdf.text('Answer', margin + 120, yPosition)
  yPosition += 8

  // Draw line under headers
  pdf.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2)
  yPosition += 2

  // Table content
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  
  filteredEvidence.forEach((item) => {
    if (yPosition > pageHeight - 30) {
      pdf.addPage()
      yPosition = 30
      
      // Repeat headers on new page
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(0, 0, 0)
      pdf.text('ID', margin, yPosition)
      pdf.text('Question', margin + 25, yPosition)
      pdf.text('Answer', margin + 120, yPosition)
      yPosition += 8
      pdf.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2)
      yPosition += 2
      
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(8)
    }
    
    const questionText = pdf.splitTextToSize(item.question, 90)
    const maxLines = Math.max(questionText.length, 1)
    
    pdf.setTextColor(0, 0, 0)
    pdf.text(item.question_id, margin, yPosition)
    pdf.text(questionText, margin + 25, yPosition)
    
    // Color the answer text
    if (item.answer === "Yes") {
      pdf.setTextColor(0, 100, 0) // Dark green
      pdf.setFont('helvetica', 'bold')
    } else if (item.answer === "No") {
      pdf.setTextColor(139, 0, 0) // Dark red
      pdf.setFont('helvetica', 'bold')
    } else {
      pdf.setTextColor(0, 0, 0) // Black
      pdf.setFont('helvetica', 'normal')
    }
    pdf.text(item.answer, margin + 120, yPosition)
    
    // Reset font and color
    pdf.setTextColor(0, 0, 0)
    pdf.setFont('helvetica', 'normal')
    
    yPosition += maxLines * 4 + 3
  })

  yPosition += 15

  // Check for page break
  if (yPosition > pageHeight - 40) {
    pdf.addPage()
    yPosition = 30
  }

  // Detailed Evidence section with actual answers from database
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text('3. Detailed Evidence', margin, yPosition)
  yPosition += 15

  // Process each question and fetch its answers
  for (const item of filteredEvidence) {
    // Check if we need a new page for this section
    if (yPosition > pageHeight - 80) {
      pdf.addPage()
      yPosition = 30
    }

    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    const questionTitle = `${item.question_id}: ${item.question}`
    const splitTitle = pdf.splitTextToSize(questionTitle, pageWidth - 2 * margin)
    pdf.text(splitTitle, margin, yPosition)
    yPosition += splitTitle.length * 5 + 5

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Answer: ', margin, yPosition)
    
    // Color the answer
    if (item.answer === "Yes") {
      pdf.setTextColor(0, 100, 0) // Dark green
      pdf.setFont('helvetica', 'bold')
    } else if (item.answer === "No") {
      pdf.setTextColor(139, 0, 0) // Dark red
      pdf.setFont('helvetica', 'bold')
    } else {
      pdf.setTextColor(0, 0, 0)
      pdf.setFont('helvetica', 'normal')
    }
    pdf.text(item.answer, margin + 20, yPosition)
    pdf.setTextColor(0, 0, 0) // Reset color
    pdf.setFont('helvetica', 'normal')
    yPosition += 8

    // Fetch and display detailed answers from the answers table
    try {
      const { data: answers, error } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', item.id)
        .order('created_at', { ascending: true })

      if (!error && answers && answers.length > 0) {
        answers.forEach((answer, answerIndex) => {
          // Check for page break before each evidence item
          if (yPosition > pageHeight - 40) {
            pdf.addPage()
            yPosition = 30
          }

          // Decode the file name to replace %20 with spaces
          const decodedFileName = decodeFileName(answer.file_name)

          // Calculate the width available for the file name within the border
          const borderWidth = pageWidth - 2 * margin
          const fileNamePrefix = `Evidence ${answerIndex + 1}: `
          const prefixWidth = pdf.getTextWidth(fileNamePrefix)
          const availableFileNameWidth = borderWidth - prefixWidth - 4 // 4mm padding inside border
          
          // Split the file name to fit within the available width
          const splitFileName = pdf.splitTextToSize(decodedFileName, availableFileNameWidth)
          
          // Calculate the header height based on number of lines needed for file name
          const fileNameLines = splitFileName.length
          const fileNameHeaderHeight = Math.max(8, fileNameLines * 4 + 6)

          // Evidence header with border and background - dynamic height based on file name
          pdf.setFillColor(245, 245, 245) // Light gray background
          pdf.setDrawColor(200, 200, 200) // Light gray border
          pdf.rect(margin, yPosition - 2, borderWidth, fileNameHeaderHeight, 'FD') // Fill and Draw
          
          pdf.setFontSize(9)
          pdf.setFont('helvetica', 'bold')
          pdf.setTextColor(0, 0, 0)
          
          // Add the prefix text on the first line
          pdf.text(fileNamePrefix, margin + 2, yPosition + 3)
          
          // Add the file name - if it fits on the same line, keep it there, otherwise wrap
          if (fileNameLines === 1 && (prefixWidth + pdf.getTextWidth(splitFileName[0])) <= (borderWidth - 4)) {
            // File name fits on the same line as prefix
            pdf.text(splitFileName[0], margin + 2 + prefixWidth, yPosition + 3)
          } else {
            // File name needs to wrap to next line(s)
            splitFileName.forEach((line, lineIndex) => {
              pdf.text(line, margin + 2, yPosition + 3 + ((lineIndex + 1) * 4))
            })
          }
          
          yPosition += fileNameHeaderHeight

          // Evidence content with border
          const evidenceText = pdf.splitTextToSize(answer.page_content, pageWidth - 2 * margin - 10)
          const contentHeight = evidenceText.length * 4 + 6
          
          pdf.setFillColor(250, 250, 250) // Very light gray background
          pdf.setDrawColor(200, 200, 200) // Light gray border
          pdf.rect(margin, yPosition - 2, pageWidth - 2 * margin, contentHeight, 'FD')
          
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(8)
          pdf.text(evidenceText, margin + 5, yPosition + 2)
          yPosition += contentHeight + 8
        })

        // Source information
        if (item.source !== "--" && item.source) {
          if (yPosition > pageHeight - 20) {
            pdf.addPage()
            yPosition = 30
          }
          
          pdf.setFont('helvetica', 'bold')
          pdf.text('Source: ', margin, yPosition)
          pdf.setFont('helvetica', 'normal')
          const sourceText = pdf.splitTextToSize(item.source, pageWidth - 2 * margin - 20)
          pdf.text(sourceText, margin + 20, yPosition)
          yPosition += sourceText.length * 4 + 5
        }
      } else {
        // Fallback to legacy evidence format if no answers found
        if (item.evidence !== "--" && item.evidence) {
          pdf.setFont('helvetica', 'bold')
          pdf.text('Evidence:', margin, yPosition)
          yPosition += 6
        
          pdf.setFont('helvetica', 'normal')
          const evidenceText = pdf.splitTextToSize(item.evidence, pageWidth - 2 * margin - 10)
          pdf.text(evidenceText, margin + 5, yPosition)
          yPosition += evidenceText.length * 4 + 5
        }

        if (item.source !== "--" && item.source) {
          pdf.setFont('helvetica', 'bold')
          pdf.text('Source: ', margin, yPosition)
          pdf.setFont('helvetica', 'normal')
          const sourceText = pdf.splitTextToSize(item.source, pageWidth - 2 * margin - 20)
          pdf.text(sourceText, margin + 20, yPosition)
          yPosition += sourceText.length * 4 + 5
        }
      }
    } catch (error) {
      console.error('Error fetching answers for PDF:', error)
      // Fallback to legacy evidence format
      if (item.evidence !== "--" && item.evidence) {
        pdf.setFont('helvetica', 'bold')
        pdf.text('Evidence:', margin, yPosition)
        yPosition += 6
        
        pdf.setFont('helvetica', 'normal')
        const evidenceText = pdf.splitTextToSize(item.evidence, pageWidth - 2 * margin - 10)
        pdf.text(evidenceText, margin + 5, yPosition)
        yPosition += evidenceText.length * 4 + 5
      }
    }

    yPosition += 10

    // Add separator line between questions
    if (filteredEvidence.indexOf(item) < filteredEvidence.length - 1) {
      pdf.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10
    }
  }

  // Save the PDF
  pdf.save('supplierShield-security-audit-report.pdf')
}
