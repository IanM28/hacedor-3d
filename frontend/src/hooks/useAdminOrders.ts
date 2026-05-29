import { useQuery } from '@tanstack/react-query'
import { orderService } from '../services/order.service'
import type { AdminOrderFilters } from '../types'

export function useAdminOrders(filters: AdminOrderFilters = {}) {
  return useQuery({
    queryKey: ['admin', 'orders', filters],
    queryFn: () => orderService.findAllAdmin(filters),
  })
}
