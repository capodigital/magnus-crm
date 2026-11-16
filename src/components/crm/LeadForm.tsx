'use client'

import { useState } from 'react'

import Button from '@mui/material/Button'

import RecordForm, { crmRequest, optionsFrom } from './RecordForm'
import ContactPicker from './ContactPicker'
import ContactForm from './ContactForm'
import { statusLabels } from '@/lib/crm/contracts'
import type { SalesList, SalesOptions } from '@/lib/crm/records-query'

export default function LeadForm({
  lead,
  kind,
  options,
  onClose
}: {
  lead?: SalesList['records'][number]
  kind: string
  options: SalesOptions
  onClose: () => void
}) {
  const [contact, setContact] = useState<{ id: string; fullName: string | null; email: string | null } | null>(
    lead?.contact ?? null
  )

  const [creatingContact, setCreatingContact] = useState(false)

  return (
    <>
      <RecordForm
        title={lead ? 'Editar negocio' : kind === 'LEAD' ? 'Nuevo lead' : 'Nueva oportunidad'}
        onClose={onClose}
        onSave={values => {
          if (!contact) throw new Error('Selecciona un contacto.')

          return crmRequest(
            `leads${lead ? `/${lead.id}` : ''}`,
            {
              ...values,
              contactId: contact.id,
              kind: values.kind,
              version: lead?.version,
              valueCents: Math.round(Number(values.value) * 100),
              score: values.score === '' ? null : Number(values.score),
              expectedCloseAt: values.expectedCloseAt ? new Date(String(values.expectedCloseAt)).toISOString() : null
            },
            lead ? 'PATCH' : 'POST'
          )
        }}
        fields={[
          { name: 'title', label: 'Título del negocio', value: lead?.title, required: true },
          {
            name: 'kind',
            label: 'Tipo',
            value: lead?.kind ?? kind,
            options: [
              { value: 'LEAD', label: 'Lead' },
              { value: 'OPPORTUNITY', label: 'Oportunidad' }
            ]
          },
          {
            name: 'stageId',
            label: 'Etapa',
            value: lead?.stageId ?? '',
            options: [
              { value: '', label: 'Sin etapa' },
              ...options.pipelines.flatMap(p => p.stages.map(s => ({ value: s.id, label: `${p.name} · ${s.name}` })))
            ]
          },
          {
            name: 'status',
            label: 'Estado',
            value: lead?.status ?? 'OPEN',
            options: optionsFrom(statusLabels),
            helper: 'Las etapas de cierre determinan Ganado o Perdido.'
          },
          {
            name: 'ownerUserId',
            label: 'Responsable',
            value: lead?.ownerUserId ?? '',
            options: [
              { value: '', label: 'Sin asignar' },
              ...options.owners.map(o => ({ value: o.userId, label: o.user.name || o.user.email || 'Usuario' }))
            ]
          },
          { name: 'value', label: 'Importe estimado', type: 'number', value: (lead?.valueCents ?? 0) / 100 },
          {
            name: 'currency',
            label: 'Moneda',
            value: lead?.currency ?? 'USD',
            required: true,
            helper: 'Código ISO: USD, EUR, CUP…'
          },
          { name: 'score', label: 'Puntuación (0–100)', type: 'number', value: lead?.score },
          {
            name: 'expectedCloseAt',
            label: 'Cierre estimado',
            type: 'date',
            value: lead?.expectedCloseAt?.slice(0, 10)
          }
        ]}
      >
        <ContactPicker value={contact} onChange={setContact} />
        <Button
          onClick={() => setCreatingContact(true)}
          sx={{ alignSelf: 'flex-start' }}
          startIcon={<i className='tabler-user-plus' />}
        >
          Crear contacto sin salir del lead
        </Button>
      </RecordForm>
      {creatingContact ? <ContactForm onClose={() => setCreatingContact(false)} onCreated={setContact} /> : null}
    </>
  )
}
