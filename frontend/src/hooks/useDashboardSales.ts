import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboard.service'

export function useDashboardSales() {
  return useQuery({
    queryKey: ['dashboard', 'sales'],
    queryFn: () => dashboardService.getSales(),
    staleTime: 1000 * 60 * 2,
  })
}
