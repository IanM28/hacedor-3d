import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productionService } from '../services/production.service'
import type { RegisterProductionInput } from '../types'

export function useRegisterProduction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RegisterProductionInput) => productionService.register(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['filaments'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      void qc.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
