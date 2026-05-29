import { useQuery } from '@tanstack/react-query'
import { orderService } from '../services/order.service'

export function useAdminOrder(id: string | null) {
  return useQuery({
    queryKey: ['admin', 'orders', id],
    queryFn: () => orderService.findAdminById(id!),
    enabled: !!id,
  })
}
