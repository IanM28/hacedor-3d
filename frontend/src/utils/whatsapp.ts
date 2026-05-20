import type { CartItem } from '../types'

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER

function buildWhatsAppSendUrl(message: string): string {
  return `https://api.whatsapp.com/send?phone=${WA_NUMBER}&text=${encodeURIComponent(message)}`
}

export function buildProductQuery(code: string, name: string): string {
  const message = `Hola! Quiero consultar sobre *${code}* - ${name}. ¿Tiene stock disponible?`
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`
}

interface BuildOrderQueryParams {
  orderId: string
  items: CartItem[]
  total: number
  contactName: string
}

export function buildOrderQuery({
  orderId,
  items,
  total,
  contactName,
}: BuildOrderQueryParams): string {
  const list = items.map(i => `- ${i.code} x${i.quantity}`).join('\n')
  const message =
    `Hola! Quiero confirmar mi pedido por transferencia.\n` +
    `Pedido: #${orderId.slice(0, 8).toUpperCase()}\n` +
    `Nombre: ${contactName}\n` +
    `Items:\n${list}\n` +
    `Total: $${total.toLocaleString('es-AR')}`
  return buildWhatsAppSendUrl(message)
}
