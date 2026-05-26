import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL

interface UploadResponse {
  success: boolean
  data: { url: string }
}

function getToken(): string | null {
  return useAuthStore.getState().token
}

export const uploadService = {
  async uploadProductImage(file: File): Promise<string> {
    const token = getToken()
    if (!token) throw new Error('No autenticado')

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${API_URL}/uploads/product-images`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })

    const json = (await res.json()) as UploadResponse
    if (!res.ok || !json.success) throw new Error('Error al subir imagen')
    return json.data.url
  },
}
