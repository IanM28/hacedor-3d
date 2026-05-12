const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER

export function buildProductQuery(code: string, name: string): string {
  const message = `Hola! Quiero consultar sobre *${code}* - ${name}. ¿Tiene stock disponible?`
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`
}

export interface OrderQueryItem {
  code: string
  name: string
  quantity: number
}

export function buildOrderQuery(items: OrderQueryItem[], total: number): string {
  const list = items.map(i => `• ${i.code} — ${i.name} x${i.quantity}`).join('\n')
  const message = `Hola! Quiero hacer un pedido por transferencia:\n\n${list}\n\nTotal: $${total.toLocaleString('es-AR')}`
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`
}
