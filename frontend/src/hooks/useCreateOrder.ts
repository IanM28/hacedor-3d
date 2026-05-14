import { useMutation } from '@tanstack/react-query'
import { orderService } from '../services/order.service'

export function useCreateOrder() {
  return useMutation({
    mutationFn: orderService.create,
  })
}
