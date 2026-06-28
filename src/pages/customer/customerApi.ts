import { getStoredAuthUser } from "@/lib/auth"
import { getApiList } from "@/lib/operations"

export type CustomerRecord = {
  email?: string
  id?: number
  name?: string
  user?: {
    email?: string
    id?: number
    name?: string
  }
  user_id?: number
}

export async function getCurrentCustomer(forceRefresh = false) {
  const authUser = getStoredAuthUser()
  const customers = await getApiList<CustomerRecord>("/api/customers", forceRefresh)

  return customers.find((customer) =>
    customer.user_id === authUser?.id ||
    customer.user?.id === authUser?.id ||
    customer.email === authUser?.email ||
    customer.user?.email === authUser?.email,
  )
}

export function belongsToCustomer(
  value: { customer?: CustomerRecord; customer_id?: number },
  customerId: string,
) {
  if (!customerId) {
    return false
  }

  return String(value.customer_id ?? value.customer?.id ?? "") === customerId
}
