
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ControlRatingSelectProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}

const ratingOptions = [
  { value: "Major non-conformity", label: "Major non-conformity", color: "#EE0000" },
  { value: "Minor non-conformity", label: "Minor non-conformity", color: "#BF4E14" },
  { value: "Observation", label: "Observation", color: "#FFC000" },
  { value: "Opportunity for improvement", label: "Opportunity for improvement", color: "#D86DCB" },
  { value: "Acceptable", label: "Acceptable", color: "#00B050" }
]

export function ControlRatingSelect({ value, onChange, disabled }: ControlRatingSelectProps) {
  const selectedOption = ratingOptions.find(option => option.value === value)

  return (
    <Select value={value || ""} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue>
          {selectedOption ? (
            <span style={{ color: selectedOption.color, fontWeight: 'bold' }}>
              {selectedOption.label}
            </span>
          ) : (
            <span className="text-muted-foreground">Select rating...</span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {ratingOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span style={{ color: option.color, fontWeight: 'bold' }}>
              {option.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
