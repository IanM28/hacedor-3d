import { useMutation } from '@tanstack/react-query'
import { paymentService } from '../services/payment.service'

export function useCreatePaymentPreference() {
  return useMutation({
    mutationFn: paymentService.createPreference,
  })
}
