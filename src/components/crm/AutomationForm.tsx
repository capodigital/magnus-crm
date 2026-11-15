'use client'

import Alert from '@mui/material/Alert'

import RecordForm, { crmRequest, optionsFrom } from './RecordForm'
import { triggerLabels } from '@/lib/crm/contracts'
import type { MarketingData } from '@/lib/crm/marketing-service'
import type { SalesOptions } from '@/lib/crm/records-query'

export default function AutomationForm({
  rule,
  options,
  onClose
}: {
  rule?: MarketingData['automations'][number]
  options: SalesOptions
  onClose: () => void
}) {
  return (
    <RecordForm
      title={rule ? 'Editar automatización' : 'Nueva automatización'}
      onClose={onClose}
      onSave={values =>
        crmRequest(
          `automations${rule ? `/${rule.id}` : ''}`,
          { ...values, delayMinutes: Number(values.delayMinutes) },
          rule ? 'PATCH' : 'POST'
        )
      }
      fields={[
        { name: 'name', label: 'Nombre de la regla', value: rule?.name, required: true },
        {
          name: 'trigger',
          label: 'Disparador',
          value: rule?.trigger ?? 'CONTACT_CREATED',
          options: optionsFrom(triggerLabels)
        },
        {
          name: 'stageId',
          label: 'Etapa de destino',
          value: rule?.stageId ?? '',
          helper: 'Solo se aplica al disparador Cambio de etapa.',
          options: [
            { value: '', label: 'Cualquier etapa' },
            ...options.pipelines.flatMap(p => p.stages.map(s => ({ value: s.id, label: `${p.name} · ${s.name}` })))
          ]
        },
        {
          name: 'delayMinutes',
          label: 'Espera antes del envío (minutos)',
          type: 'number',
          value: rule?.delayMinutes ?? 60,
          required: true
        },
        { name: 'subject', label: 'Asunto', value: rule?.subject, required: true },
        {
          name: 'body',
          label: 'Mensaje',
          value: rule?.body,
          required: true,
          multiline: true,
          helper: 'Personaliza con {{nombre}} y {{empresa}}.'
        },
        { name: 'active', label: 'Activar esta automatización', type: 'checkbox', value: rule?.active ?? false }
      ]}
    >
      <Alert severity='info'>
        Aplica a eventos nuevos registrados desde el CRM, solo para contactos con consentimiento. Al pausar una regla se
        detienen sus envíos pendientes. Editar el mensaje afecta a eventos futuros.
      </Alert>
    </RecordForm>
  )
}
