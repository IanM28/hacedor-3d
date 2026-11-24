import type { Product } from '../types'

export function isPublicCatalogProduct(product: Product): boolean {
  return product.images.some(src => src.trim().length > 0)
}
