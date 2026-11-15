import SalesPage from '@/components/crm/SalesPage'
import type { SalesParams } from '@/components/crm/SalesPage'

export default function LeadsPage({ searchParams }: { searchParams: SalesParams }) {
  return <SalesPage kind='LEAD' searchParams={searchParams} />
}
