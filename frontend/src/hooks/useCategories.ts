import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoryService } from '../services/category.service'
import type { CreateCategoryInput, UpdateCategoryInput } from '../types'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.findAll(),
    staleTime: 1000 * 60 * 10,
  })
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => categoryService.findAllAdmin(),
    staleTime: 1000 * 60 * 5,
  })
}

function invalidateCategories(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['categories'] })
  qc.invalidateQueries({ queryKey: ['admin', 'categories'] })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCategoryInput) => categoryService.create(data),
    onSuccess: () => invalidateCategories(qc),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryInput }) =>
      categoryService.update(id, data),
    onSuccess: () => invalidateCategories(qc),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoryService.remove(id),
    onSuccess: () => invalidateCategories(qc),
  })
}
