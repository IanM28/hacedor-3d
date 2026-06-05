import https from 'https'
import type { NormalizedShippingOption } from '../schemas/shipping.schema'

// --- helpers de entorno ---

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw Object.assign(new Error(`${name} no configurado`), { statusCode: 503 })
  return value
}

function baseUrl(): string {
  const raw = requireEnv('ENVIOPACK_API_URL').replace(/\/$/, '')
  // Garantizar HTTPS aunque el .env tenga http://
  return raw.startsWith('http://') ? raw.replace('http://', 'https://') : raw
}

// --- HTTP genérico (siempre HTTPS via módulo nativo) ---

interface HttpOptions {
  method: 'GET' | 'POST'
  url: string
  body?: Record<string, string>
  contentType?: 'json' | 'form'
}

interface HttpResponse {
  statusCode: number
  body: unknown
}

function httpCall(opts: HttpOptions): Promise<HttpResponse> {
  return new Promise((resolve, reject) => {
    // Forzar HTTPS en la URL también antes de parsear
    const safeUrl = opts.url.startsWith('http://')
      ? opts.url.replace('http://', 'https://')
      : opts.url

    const parsedUrl = new URL(safeUrl)
    let payload = ''

    if (opts.method === 'POST' && opts.body) {
      payload =
        opts.contentType === 'form'
          ? new URLSearchParams(opts.body).toString()
          : JSON.stringify(opts.body)
    }

    const contentType =
      opts.contentType === 'form'
        ? 'application/x-www-form-urlencoded'
        : 'application/json'

    const reqOptions: https.RequestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: opts.method,
      headers:
        opts.method === 'POST'
          ? { 'Content-Type': contentType, 'Content-Length': Buffer.byteLength(payload) }
          : {},
    }

    const req = https.request(reqOptions, res => {
      let data = ''
      res.on('data', (chunk: Buffer) => { data += chunk.toString() })
      res.on('end', () => {
        const statusCode = res.statusCode ?? 0
        try {
          resolve({ statusCode, body: JSON.parse(data) })
        } catch {
          // Respuesta no-JSON (ej: HTML de 404)
          resolve({ statusCode, body: { _raw: data.slice(0, 200) } })
        }
      })
    })

    req.on('error', reject)
    if (opts.method === 'POST' && payload) req.write(payload)
    req.end()
  })
}

// --- Cache de access token ---

interface TokenCache {
  token: string
  expiresAt: number
}

let tokenCache: TokenCache | null = null

const TOKEN_TTL_MS = 4 * 60 * 60 * 1000 // 4 horas
const TOKEN_MARGIN_MS = 5 * 60 * 1000   // renovar 5 min antes de vencer

interface EnviopackAuthResponse {
  token?: string
  refresh_token?: string
  error?: string
  message?: string
}

async function getAccessToken(): Promise<string> {
  const now = Date.now()

  if (tokenCache && now < tokenCache.expiresAt - TOKEN_MARGIN_MS) {
    return tokenCache.token
  }

  const apiKey = requireEnv('ENVIOPACK_API_KEY')
  const secretKey = requireEnv('ENVIOPACK_SECRET_KEY')

  const { statusCode, body } = await httpCall({
    method: 'POST',
    url: `${baseUrl()}/auth`,
    body: { 'api-key': apiKey, 'secret-key': secretKey },
    contentType: 'json',
  })

  const response = body as EnviopackAuthResponse

  if (statusCode >= 400 || !response.token) {
    const detail = response.error ?? response.message ?? JSON.stringify(response)
    throw Object.assign(
      new Error(`Envíopack auth fallida (${statusCode}): ${detail}`),
      { statusCode: 502 },
    )
  }

  tokenCache = { token: response.token, expiresAt: now + TOKEN_TTL_MS }
  return tokenCache.token
}

// --- Tipos de cotización ---

interface EnviopackRateOption {
  id: string | number
  nombre_servicio: string
  nombre_operador: string
  precio: number
  dias_entrega: number | string
}

interface EnviopackQuoteResponse {
  error?: string
  message?: string
  tarifas?: EnviopackRateOption[]
}

function formatDelivery(dias: number | string): string {
  const n = typeof dias === 'string' ? parseInt(dias, 10) : dias
  if (isNaN(n)) return 'A consultar'
  if (n <= 1) return '24 hs hábiles'
  return `${n} días hábiles`
}

// --- Fallback simulado ---
// Devuelve tarifas realistas cuando la API real no está disponible,
// permitiendo probar el flujo completo de checkout de punta a punta.

export interface BoxDimensions {
  largo: number  // cm
  ancho: number  // cm
  alto: number   // cm
}

function simulatedOptions(
  postalCode: string,
  totalWeightGrams: number,
  box: BoxDimensions,
): NormalizedShippingOption[] {
  const prefix = parseInt(postalCode.charAt(0), 10)
  const weightKg = totalWeightGrams / 1000
  // Factor volumétrico: (L × A × A) / 5000 — fórmula estándar de courier
  const volumetricKg = (box.largo * box.ancho * box.alto) / 5000
  const chargeableKg = Math.max(weightKg, volumetricKg)

  const isPatagonia = prefix === 8 || prefix === 9
  const isGBA = prefix === 1
  const zoneMultiplier = isPatagonia ? 1.6 : isGBA ? 1.0 : 1.2

  const base = Math.ceil(3500 * zoneMultiplier + chargeableKg * 800)
  const express = Math.ceil(base * 1.5)
  const andreani = Math.ceil(base * 1.1)

  return [
    {
      id: 'sim-correo-std',
      provider: 'Correo Argentino',
      service: 'Estándar',
      price: base,
      estimatedDelivery: isPatagonia ? '7 días hábiles' : isGBA ? '3 días hábiles' : '5 días hábiles',
    },
    {
      id: 'sim-correo-exp',
      provider: 'Correo Argentino',
      service: 'Express',
      price: express,
      estimatedDelivery: isPatagonia ? '3 días hábiles' : '24 hs hábiles',
    },
    {
      id: 'sim-andreani-std',
      provider: 'Andreani',
      service: 'Estándar',
      price: andreani,
      estimatedDelivery: isPatagonia ? '6 días hábiles' : isGBA ? '2 días hábiles' : '4 días hábiles',
    },
  ]
}

function isRouteNotFoundError(statusCode: number, body: unknown): boolean {
  if (statusCode === 404) return true
  if (typeof body === 'object' && body !== null) {
    const b = body as Record<string, unknown>
    const msg = String(b.message ?? b.error ?? b._raw ?? '').toLowerCase()
    if (msg.includes('no route found') || msg.includes('not found')) return true
  }
  return false
}

// --- Servicio público ---

const DEFAULT_BOX: BoxDimensions = { largo: 15, ancho: 15, alto: 15 }

export const shippingService = {
  async quote(
    postalCode: string,
    totalWeightGrams: number,
    box: BoxDimensions = DEFAULT_BOX,
  ): Promise<NormalizedShippingOption[]> {
    if (totalWeightGrams <= 0) {
      throw Object.assign(
        new Error('El peso total de los productos es 0. Actualizá el peso en los productos.'),
        { statusCode: 400 },
      )
    }

    try {
      const token = await getAccessToken()
      const originPostalCode = process.env.ENVIOPACK_ORIGIN_POSTAL_CODE ?? '8400'
      const weightKg = parseFloat((totalWeightGrams / 1000).toFixed(3))

      const params = new URLSearchParams({
        access_token: token,
        cp_destino: postalCode,
        cp_origen: originPostalCode,
        peso: String(weightKg),
        largo: String(box.largo),
        ancho: String(box.ancho),
        alto: String(box.alto),
        cantidad: '1',
      })

      const quoteUrl = `${baseUrl()}/cotizar?${params.toString()}`
      const { statusCode, body } = await httpCall({ method: 'GET', url: quoteUrl })

      if (isRouteNotFoundError(statusCode, body)) {
        console.warn(`[shipping] Envíopack /cotizar devolvió ${statusCode}. Usando tarifas simuladas.`)
        return simulatedOptions(postalCode, totalWeightGrams, box)
      }

      const response = body as EnviopackQuoteResponse

      if (response.error ?? response.message) {
        const detail = response.error ?? response.message
        throw Object.assign(new Error(`Envíopack: ${detail}`), { statusCode: 422 })
      }

      const tarifas = response.tarifas ?? []

      if (tarifas.length === 0) {
        console.warn('[shipping] Envíopack devolvió 0 tarifas. Usando tarifas simuladas.')
        return simulatedOptions(postalCode, totalWeightGrams, box)
      }

      return tarifas.map(tarifa => ({
        id: String(tarifa.id),
        provider: tarifa.nombre_operador ?? 'Desconocido',
        service: tarifa.nombre_servicio ?? 'Estándar',
        price: Math.ceil(tarifa.precio),
        estimatedDelivery: formatDelivery(tarifa.dias_entrega),
      }))
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        (error as Error & { statusCode?: number }).statusCode === 400
      ) {
        throw error
      }

      const msg = error instanceof Error ? error.message : String(error)
      console.warn(`[shipping] Error al cotizar con Envíopack: ${msg}. Usando tarifas simuladas.`)
      return simulatedOptions(postalCode, totalWeightGrams, box)
    }
  },

  async generateLabel(
    _orderId: string,
    _quoteId: string,
  ): Promise<{ trackingNumber: string; labelUrl: string }> {
    requireEnv('ENVIOPACK_API_KEY')
    requireEnv('ENVIOPACK_SECRET_KEY')

    throw Object.assign(
      new Error('Generación de etiquetas Envíopack: implementar con credenciales de producción'),
      { statusCode: 501 },
    )
  },
}
