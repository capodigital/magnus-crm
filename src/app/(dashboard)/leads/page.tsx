import SectionPage from '@components/crm/SectionPage'

const LeadsPage = () => {
  return (
    <SectionPage
      eyebrow='Lead management'
      title='Turn inbound chats into qualified opportunities'
      description='Leads will be created or reopened from WhatsApp activity and then moved through qualification, assignment, and follow-up.'
      status='Goal 6 CRM workflow'
      actions={[
        { label: 'Open inbox', href: '/inbox', variant: 'outlined' },
        { label: 'See billing', href: '/billing' }
      ]}
      bullets={[
        'Track first inbound, last inbound, and ownership changes on the lead record.',
        'Keep lead state separate from contact identity so a single contact can return later.',
        'Support scoring, tags, and assignment once the backend models are in place.',
        'Expose pipeline stages without forcing a white-label redesign first.'
      ]}
    />
  )
}

export default LeadsPage
