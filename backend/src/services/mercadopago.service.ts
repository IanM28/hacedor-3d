import crypto from 'crypto'
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'
import type { PreferenceRequest } from 'mercadopago/dist/clients/preference/commonTypes'
import type { Prisma } from '@prisma/client'
import { prisma } from '../prisma/client'

const orderInclude = {
  items: { include: { product: true } },
  user: { select: { id: true, email: true } },
} satisfies Prisma.OrderInclude

function httpError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode })
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw httpError(`${name} no configurado`, 500)
  return value
}

function getMpConfig(): MercadoPagoConfig {
  return new MercadoPagoConfig({ accessToken: requireEnv('MP_ACCESS_TOKEN') })
}

const PAYMENT_STATUS_TO_ORDER: Record<string, 'CONFIRMED' | 'PENDING' | 'CANCELLED'> = {
  approved: 'CONFIRMED',
  pending: 'PENDING',
  in_process: 'PENDING',
  in_mediation: 'PENDING',
  rejected: 'CANCELLED',
  cancelled: 'CANCELLED',
  refunded: 'CANCELLED',
  charged_back: 'CANCELLED',
}

function mapPaymentStatus(status?: string): 'CONFIRMED' | 'PENDING' | 'CANCELLED' {
  if (!status) return 'PENDING'
  return PAYMENT_STATUS_TO_ORDER[status] ?? 'PENDING'
}

interface CreatePreferenceParams {
  orderId: string
  userId?: string
  role?: 'CLIENT' | 'ADMIN'
  guestEmail?: string
}

interface VerifySignatureParams {
  xSignature?: string
  xRequestId?: string
  dataId?: string
}

interface HandleWebhookParams {
  headers: { xSignature?: string; xRequestId?: string }
  body: unknown
  query: Record<string, unknown>
}

function parseSignatureHeader(header: string): { ts?: string; v1?: string } {
  const parts = header.split(',').map(p => p.trim())
  const result: { ts?: string; v1?: string } = {}
  for (const part of parts) {
    const [key, value] = part.split('=')
    if (key === 'ts') result.ts = value
    if (key === 'v1') result.v1 = value
  }
  return result
}

function extractDataIdFromUnknown(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') return undefined
  const record = value as Record<string, unknown>
  const data = record.data
  if (data && typeof data === 'object') {
    const id = (data as Record<string, unknown>).id
    if (typeof id === 'string') return id
    if (typeof id === 'number') return String(id)
  }
  const directId = record.id
  if (typeof directId === 'string') return directId
  if (typeof directId === 'number') return String(directId)
  return undefined
}

function extractDataIdFromQuery(query: Record<string, unknown>): string | undefined {
  const dataId = query['data.id']
  if (typeof dataId === 'string') return dataId
  const id = query.id
  if (typeof id === 'string') return id
  return undefined
}

interface CheckoutBackUrls {
  success: string
  failure: string
  pending: string
}

function normalizeBaseUrl(name: string): string {
  return requireEnv(name).trim().replace(/\/$/, '')
}

function buildCheckoutBackUrls(frontendUrl: string): CheckoutBackUrls {
  const back_urls: CheckoutBackUrls = {
    success: `${"http://localhost:5173/"}/checkout/success`,
    failure: `${"http://localhost:5173/"}/checkout/failure`,
    pending: `${"http://localhost:5173/"}/checkout/pending`,
  }

  if (!back_urls.success || !back_urls.failure || !back_urls.pending) {
    throw httpError('FRONTEND_URL inválida para back_urls', 500)
  }

  return back_urls
}

function supportsAutoReturn(backUrls: CheckoutBackUrls): boolean {
  try {
    const { hostname, protocol } = new URL(backUrls.success)
    const isLocalHost =
      hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0'
    return protocol === 'https:' && !isLocalHost
  } catch {
    return false
  }
}

export const mercadopagoService = {
  async createPreferenceForOrder({
    orderId,
    userId,
    role,
    guestEmail,
  }: CreatePreferenceParams) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: orderInclude,
    })
    if (!order) throw httpError('Pedido no encontrado', 404)
    if (order.status !== 'PENDING') {
      throw httpError('El pedido no está en estado PENDING', 400)
    }

    if (order.userId) {
      if (role !== 'ADMIN' && order.userId !== userId) {
        throw httpError('No tenés permisos sobre este pedido', 403)
      }
    } else {
      if (!guestEmail) {
        throw httpError('guestEmail es requerido para pedidos de invitado', 400)
      }
      if (order.guestEmail !== guestEmail) {
        throw httpError('No tenés permisos sobre este pedido', 403)
      }
    }

    const frontendUrl = normalizeBaseUrl('FRONTEND_URL')
    const backendUrl = normalizeBaseUrl('BACKEND_URL')
    const back_urls = buildCheckoutBackUrls(frontendUrl)

    const productItems = order.items.map(item => ({
      id: item.productId,
      title: `${item.product.code} - ${item.product.name}`,
      description: item.product.description || item.product.code,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      currency_id: 'ARS',
    }))

    const shippingItem =
      order.shippingCost > 0
        ? [
            {
              id: 'shipping',
              title: 'Envío',
              description: `${order.shippingProvider ?? ''} ${order.shippingService ?? ''}`.trim() || 'Envío',
              quantity: 1,
              unit_price: order.shippingCost,
              currency_id: 'ARS',
            },
          ]
        : []

    const preferenceBody: PreferenceRequest = {
      items: [...productItems, ...shippingItem],
      payer: {
        name: order.contactName,
        email: order.guestEmail ?? order.user?.email ?? '',
      },
      back_urls,
      notification_url: `${backendUrl}/api/payments/webhook`,
      external_reference: order.id,
    }

    if (supportsAutoReturn(back_urls)) {
      preferenceBody.auto_return = 'approved'
    }

    const client = getMpConfig()
    const preference = new Preference(client)
    const response = await preference.create({ body: preferenceBody })

    if (response.id) {
      await prisma.order.update({
        where: { id: order.id },
        data: { mpPreferenceId: response.id },
      })
    }

    return {
      preferenceId: response.id,
      init_point: (response as any).sandbox_init_point || response.init_point,
    } as any;
 },
//modificado 

  verifyWebhookSignature({ xSignature, xRequestId, dataId }: VerifySignatureParams): void {
    const secret = process.env.MP_WEBHOOK_SECRET
    if (!secret) throw httpError('MP_WEBHOOK_SECRET no configurado', 500)
    if (!xSignature || !xRequestId || !dataId) {
      throw httpError('Firma de webhook inválida', 401)
    }

    const { ts, v1 } = parseSignatureHeader(xSignature)
    if (!ts || !v1) throw httpError('Firma de webhook inválida', 401)

    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
    const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex')

    const expectedBuf = Buffer.from(expected, 'hex')
    const receivedBuf = Buffer.from(v1, 'hex')

    if (
      expectedBuf.length !== receivedBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, receivedBuf)
    ) {
      throw httpError('Firma de webhook inválida', 401)
    }
  },

  async getPaymentStatus(paymentId: string) {
    const client = getMpConfig()
    const payment = new Payment(client)
    const result = await payment.get({ id: paymentId })

    return {
      id: result.id,
      status: result.status,
      status_detail: result.status_detail,
      external_reference: result.external_reference,
      orderId: result.external_reference,
    }
  },

  async handleWebhook({/* headers,*/ body, query }: HandleWebhookParams) {
    const dataId = extractDataIdFromQuery(query) ?? extractDataIdFromUnknown(body)


     // 1. ⚠️ COMENTÁ TEMPORALMENTE ESTA VALIDACIÓN PARA PRUEBAS LOCALES
    // Si no la comentás, ngrok te va a tirar error 401 porque 'your_webhook_secret' no es real.
    /*
    mercadopagoService.verifyWebhookSignature({
      xSignature: headers.xSignature,
      xRequestId: headers.xRequestId,
      dataId,
    })
*/

    if (!dataId) return { received: true, ignored: true as const }

    const client = getMpConfig()
    const payment = new Payment(client)
    const paymentData = await payment.get({ id: dataId })

    const externalReference = paymentData.external_reference
    if (!externalReference) {
      return { received: true, ignored: true as const, paymentId: dataId }
    }

    const order = await prisma.order.findUnique({ where: { id: externalReference } })
    if (!order) {
      return { received: true, ignored: true as const, paymentId: dataId }
    }

    const orderStatus = mapPaymentStatus(paymentData.status)
    const paymentIdString =
      typeof paymentData.id === 'number' || typeof paymentData.id === 'string'
        ? String(paymentData.id)
        : dataId
 // Acá Express actualiza el estado de la orden en la base de datos
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { mpPaymentId: paymentIdString, status: orderStatus },
    })

// ===================================================================
    // 🎯 2. EL LUGAR EXACTO PARA TU INVENTARIO ATÓMICO (PRISMA)
    // ===================================================================
    // Si el pago entró aprobado y la orden pasó a estar CONFIRMED:
    if (orderStatus === 'CONFIRMED') {
      console.log(`💰 El pago de la orden ${updated.id} fue aprobado. Descontando stock...`);
      
      // Acá es donde ejecutás tu función o transacción atómica de Prisma 
      // para restar los gramos netos de filamento de las bobinas (restando la tara).
    }
    // ===================================================================


    return {
      received: true,
      paymentId: paymentIdString,
      orderId: updated.id,
      paymentStatus: paymentData.status,
      orderStatus: updated.status,
    }
  },
}
