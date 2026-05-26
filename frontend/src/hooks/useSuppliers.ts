import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supplierService } from '../services/supplier.service'
import type { CreateSupplierInput, UpdateSupplierInput } from '../types'

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: () => supplierService.findAll(),
    staleTime: 1000 * 60 * 10,
  })
}

export function useAdminSuppliers() {
  return useQuery({
    queryKey: ['admin', 'suppliers'],
    queryFn: () => supplierService.findAllAdmin(),
    staleTime: 1000 * 60 * 5,
  })
}

function invalidateSuppliers(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['suppliers'] })
  qc.invalidateQueries({ queryKey: ['admin', 'suppliers'] })
}

export function useCreateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSupplierInput) => supplierService.create(data),
    onSuccess: () => invalidateSuppliers(qc),
  })
}

export function useUpdateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupplierInput }) =>
      supplierService.update(id, data),
    onSuccess: () => invalidateSuppliers(qc),
  })
}

export function useDeleteSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => supplierService.remove(id),
    onSuccess: () => invalidateSuppliers(qc),
  })
}
