'use client'

import { useState } from 'react'

import ContactPicker from './ContactPicker'
import RecordForm, { crmRequest, localDateTime, optionsFrom } from './RecordForm'
import { activityLabels } from '@/lib/crm/contracts'

export default function ActivityForm({ contactId, onClose }: { contactId?: string; onClose: () => void }) {
  const [contact, setContact] = useState<{ id: string; fullName: string | null; email: string | null } | null>(null)


return (
    <RecordForm
      title='Registrar interacción'
      onClose={onClose}
      onSave={values => {
        if (!contactId && !contact) throw new Error('Selecciona un contacto.')

return crmRequest('activities', {
          ...values,
          contactId: contactId || contact?.id,
          occursAt: new Date(String(values.occursAt)).toISOString()
        })
      }}
      fields={[
        { name: 'type', label: 'Tipo de interacción', value: 'CALL', options: optionsFrom(activityLabels) },
        { name: 'title', label: 'Título', required: true },
        {
          name: 'occursAt',
          label: 'Fecha y hora',
          type: 'datetime-local',
          value: localDateTime(),
          required: true,
          helper: 'Hora local de tu navegador.'
        },
        {
          name: 'description',
          label: 'Notas / resultado',
          multiline: true,
          helper: 'Registrar un email aquí añade una nota al historial; no envía un correo.'
        }
      ]}
    >
      {!contactId ? <ContactPicker value={contact} onChange={setContact} /> : null}
    </RecordForm>
  )
}
