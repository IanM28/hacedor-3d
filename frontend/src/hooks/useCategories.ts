import { useQuery } from '@tanstack/react-query'
import { categoryService } from '../services/category.service'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.findAll(),
    staleTime: 1000 * 60 * 10,
  })
}
