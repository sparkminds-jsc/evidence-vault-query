
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Customer {
  id: string
  email: string
  full_name: string
  status: string
}

interface CurrentCustomerDisplayProps {
  currentCustomer: Customer | null
}

export function CurrentCustomerDisplay({ currentCustomer }: CurrentCustomerDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          Current Auditee
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentCustomer ? (
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div>
              <p className="font-bold text-xs">{currentCustomer.email}</p>
              <p className="text-xs text-muted-foreground font-bold">{currentCustomer.full_name}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div>
              <p className="font-bold text-gray-600 text-xs">No auditee selected</p>
              <p className="text-xs text-muted-foreground font-bold">Please select an auditee in the Auditees section</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
