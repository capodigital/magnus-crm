import SectionPage from '@components/crm/SectionPage'

const InboxPage = () => {
  return (
    <SectionPage
      eyebrow='WhatsApp inbox'
      title='Centralize every conversation in one shared queue'
      description='This is where inbound WhatsApp messages will become assigned conversations, reply threads, and measurable response work.'
      status='Goal 5 and Goal 6 foundation'
      actions={[
        { label: 'Go to leads', href: '/leads', variant: 'outlined' },
        { label: 'Review pipeline', href: '/pipeline' }
      ]}
      bullets={[
        'Validate the Meta webhook and persist the raw event payload before any business logic runs.',
        'Upsert the contact from wa_id or phone number and open the right conversation thread.',
        'Route unread messages to the correct owner or queue once RBAC is in place.',
        'Prepare the reply composer to send responses through the WhatsApp Cloud API.'
      ]}
    />
  )
}

export default InboxPage
