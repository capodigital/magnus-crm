'use client'

import RecordForm, { crmRequest, optionsFrom } from './RecordForm'
import { lifecycleLabels } from '@/lib/crm/contracts'

type Contact = {
  id: string
  fullName: string | null
  email: string | null
  phoneE164: string | null
  company: string | null
  jobTitle: string | null
  lifecycle: string
  tags: string[]
  notes: string | null
  source: string | null
  marketingConsent: boolean
}

export default function ContactForm({
  contact,
  onClose,
  initialLifecycle = 'PROSPECT',
  onCreated
}: {
  contact?: Contact
  onClose: () => void
  initialLifecycle?: string
  onCreated?: (contact: { id: string; fullName: string | null; email: string | null }) => void
}) {
  return (
    <RecordForm
      title={contact ? 'Editar contacto' : initialLifecycle === 'CUSTOMER' ? 'Nuevo cliente' : 'Nuevo contacto'}
      onClose={onClose}
      onSave={async values => {
        const saved = await crmRequest(`contacts${contact ? `/${contact.id}` : ''}`, values, contact ? 'PATCH' : 'POST')

        if (!contact)
          onCreated?.({ id: saved.id, fullName: String(values.fullName), email: String(values.email || '') || null })
      }}
      fields={[
        { name: 'fullName', label: 'Nombre completo', value: contact?.fullName, required: true },
        { name: 'email', label: 'Email', type: 'email', value: contact?.email },
        {
          name: 'phoneE164',
          label: 'Teléfono internacional',
          value: contact?.phoneE164,
          helper: 'Incluye + y el código del país.'
        },
        { name: 'company', label: 'Empresa', value: contact?.company },
        { name: 'jobTitle', label: 'Cargo', value: contact?.jobTitle },
        {
          name: 'lifecycle',
          label: 'Relación',
          value: contact?.lifecycle ?? initialLifecycle,
          options: optionsFrom(lifecycleLabels)
        },
        { name: 'source', label: 'Origen', value: contact?.source ?? 'MANUAL' },
        {
          name: 'tags',
          label: 'Etiquetas',
          value: contact?.tags.join(', '),
          helper: 'Separa las etiquetas con comas.'
        },
        { name: 'notes', label: 'Notas del contacto', value: contact?.notes, multiline: true },
        {
          name: 'marketingConsent',
          label: 'El contacto autorizó recibir emails de marketing',
          type: 'checkbox',
          value: contact?.marketingConsent ?? false
        }
      ]}
    />
  )
}
