import SalesPage from '@/components/crm/SalesPage'
import type { SalesParams } from '@/components/crm/SalesPage'

export default function OpportunitiesPage({ searchParams }: { searchParams: SalesParams }) {
  return <SalesPage kind='OPPORTUNITY' searchParams={searchParams} />
}
