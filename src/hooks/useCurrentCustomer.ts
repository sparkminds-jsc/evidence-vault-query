
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

interface Customer {
  id: string
  email: string
  full_name: string
  status: string
}

export function useCurrentCustomer() {
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null)

  const fetchCurrentCustomer = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('status', 'in_use')
        .single()

      if (error) {
        if (error.code !== 'PGRST116') { // Not found error
          console.error('Error fetching current customer:', error)
        }
        setCurrentCustomer(null)
        return
      }

      setCurrentCustomer(data)
    } catch (error) {
      console.error('Error:', error)
      setCurrentCustomer(null)
    }
  }

  useEffect(() => {
    fetchCurrentCustomer()
  }, [])

  return {
    currentCustomer,
    refreshCurrentCustomer: fetchCurrentCustomer
  }
}
