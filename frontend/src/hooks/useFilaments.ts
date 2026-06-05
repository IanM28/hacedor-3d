import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { filamentService } from '../services/filament.service'
import type { AdjustFilamentInput, CreateFilamentInput, UpdateFilamentInput } from '../types'

export function useFilaments() {
  return useQuery({
    queryKey: ['filaments'],
    queryFn: () => filamentService.findAll(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateFilament() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateFilamentInput) => filamentService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['filaments'] }),
  })
}

export function useUpdateFilament() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFilamentInput }) =>
      filamentService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['filaments'] }),
  })
}

export function useDeleteFilament() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => filamentService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['filaments'] }),
  })
}

export function useAdjustFilament() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdjustFilamentInput }) =>
      filamentService.adjust(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['filaments'] }),
  })
}
