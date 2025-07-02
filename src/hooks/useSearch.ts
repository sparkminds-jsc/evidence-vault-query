
import { useState, useMemo } from "react"
import { EvidenceItem } from "@/types/evidence"

export function useSearch(evidenceData: EvidenceItem[]) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredEvidence, setFilteredEvidence] = useState<EvidenceItem[]>([])

  const computedFilteredEvidence = useMemo(() => {
    if (!searchTerm) return evidenceData
    
    return evidenceData.filter(
      item =>
        item.question_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.evidence.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [evidenceData, searchTerm])

  // Update filteredEvidence when computedFilteredEvidence changes
  useMemo(() => {
    setFilteredEvidence(computedFilteredEvidence)
  }, [computedFilteredEvidence])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  return {
    searchTerm,
    filteredEvidence,
    handleSearch,
    setFilteredEvidence
  }
}
