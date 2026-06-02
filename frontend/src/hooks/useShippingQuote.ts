import { useMutation } from '@tanstack/react-query'
import { shippingService } from '../services/shipping.service'
import type { ShippingQuoteInput, ShippingQuoteOption } from '../types'

interface ShippingQuoteResult {
  options: ShippingQuoteOption[]
  totalWeightGrams: number
}

export function useShippingQuote() {
  return useMutation<ShippingQuoteResult, Error, ShippingQuoteInput>({
    mutationFn: (input: ShippingQuoteInput) => shippingService.quote(input),
  })
}
