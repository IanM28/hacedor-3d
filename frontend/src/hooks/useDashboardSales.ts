import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboard.service'
import type { DashboardSalesPeriod } from '../types'

export function useDashboardSales(period: DashboardSalesPeriod) {
  return useQuery({
    queryKey: ['dashboard', 'sales', period],
    queryFn: () => dashboardService.getSales(period),
    staleTime: 1000 * 60 * 2,
  })
}
