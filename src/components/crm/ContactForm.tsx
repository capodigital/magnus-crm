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

export default function ContactForm({ contact, onClose }: { contact?: Contact; onClose: () => void }) {
  return (
    <RecordForm
      title={contact ? 'Editar contacto' : 'Nuevo contacto'}
      onClose={onClose}
      onSave={values => crmRequest(`contacts${contact ? `/${contact.id}` : ''}`, values, contact ? 'PATCH' : 'POST')}
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
          value: contact?.lifecycle ?? 'PROSPECT',
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
