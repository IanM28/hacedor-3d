import { useQuery } from '@tanstack/react-query'
import { productService } from '../services/product.service'

export function useProduct(id?: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.findById(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  })
}
