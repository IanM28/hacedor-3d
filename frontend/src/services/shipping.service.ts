import type { ShippingQuoteInput, ShippingQuoteOption } from '../types'

const API_URL = import.meta.env.VITE_API_URL

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

interface QuoteResponseData {
  options: ShippingQuoteOption[]
  totalWeightGrams: number
}

export const shippingService = {
  async quote(input: ShippingQuoteInput): Promise<QuoteResponseData> {
    const res = await fetch(`${API_URL}/shipping/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    const json = (await res.json()) as ApiResponse<QuoteResponseData>

    if (!res.ok || !json.success) {
      const message =
        typeof json.error === 'string'
          ? json.error
          : 'No se pudo obtener cotización de envío. Verificá el código postal.'
      throw new Error(message)
    }

    return json.data
  },
}
