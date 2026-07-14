import SectionPage from '@components/crm/SectionPage'

const PipelinePage = () => {
  return (
    <SectionPage
      eyebrow='Sales pipeline'
      title='See stage movement and ownership at a glance'
      description='The pipeline will let the team follow work from first reply to qualification and closure with clear stage history.'
      status='Goal 6 CRM workflow'
      actions={[
        { label: 'Open leads', href: '/leads', variant: 'outlined' },
        { label: 'Open inbox', href: '/inbox' }
      ]}
      bullets={[
        'Use a stage history table so moves are auditable and not just overwritten state.',
        'Keep assignments tenant-scoped from the start to avoid cross-tenant leakage later.',
        'Surface SLA and last activity so managers can spot stalled opportunities quickly.',
        'Design for Kanban later, but start with a clean data model first.'
      ]}
    />
  )
}

export default PipelinePage
