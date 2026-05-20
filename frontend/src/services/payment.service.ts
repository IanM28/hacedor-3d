const API_URL = import.meta.env.VITE_API_URL

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

export interface CreatePreferenceInput {
  orderId: string
  guestEmail?: string
}

export interface CreatePreferenceResponse {
  preferenceId?: string
  init_point?: string
  sandbox_init_point?: string
}

export const paymentService = {
  async createPreference(data: CreatePreferenceInput): Promise<CreatePreferenceResponse> {
    const res = await fetch(`${API_URL}/payments/create-preference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const json = (await res.json()) as ApiResponse<CreatePreferenceResponse>

    if (!res.ok || !json.success) {
      const message =
        typeof json.error === 'string' ? json.error : 'Error al crear la preferencia de pago'
      throw new Error(message)
    }

    return json.data
  },
}
