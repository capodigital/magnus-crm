'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'

export type Field = {
  name: string
  label: string
  type?: string
  value?: string | number | boolean | null
  required?: boolean
  multiline?: boolean
  helper?: string
  options?: { value: string; label: string }[]
}
export type FormValues = Record<string, string | boolean>

export async function crmRequest(path: string, data: unknown, method = 'POST') {
  const response = await fetch(`/api/crm/${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  const payload = await response.json()

  if (!response.ok) throw new Error(payload.error || 'No se pudo guardar. Inténtalo de nuevo.')

  return payload.result
}

export default function RecordForm({
  title,
  fields,
  onClose,
  onSave,
  submitLabel = 'Guardar',
  children
}: {
  title: string
  fields: Field[]
  onClose: () => void
  onSave: (values: FormValues) => Promise<unknown>
  submitLabel?: string
  children?: ReactNode
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  return (
    <Dialog open onClose={() => !pending && onClose()} fullWidth maxWidth='sm' aria-labelledby='record-form-title'>
      <form
        onSubmit={async event => {
          event.preventDefault()
          const form = new FormData(event.currentTarget)

          const values = Object.fromEntries(
            fields.map(field => [
              field.name,
              field.type === 'checkbox' ? form.has(field.name) : String(form.get(field.name) ?? '')
            ])
          )

          setPending(true)
          setError('')

          try {
            await onSave(values)
            router.refresh()
            onClose()
          } catch (failure) {
            setError(failure instanceof Error ? failure.message : 'No se pudo guardar.')
          } finally {
            setPending(false)
          }
        }}
      >
        <DialogTitle id='record-form-title'>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 2 }}>
            {error ? <Alert severity='error'>{error}</Alert> : null}
            {children}
            {fields.map(field =>
              field.type === 'checkbox' ? (
                <FormControlLabel
                  key={field.name}
                  control={<Checkbox name={field.name} defaultChecked={Boolean(field.value)} disabled={pending} />}
                  label={field.label}
                />
              ) : (
                <TextField
                  key={field.name}
                  id={`crm-field-${field.name}`}
                  name={field.name}
                  label={field.label}
                  defaultValue={field.value ?? ''}
                  type={field.type ?? 'text'}
                  required={field.required}
                  disabled={pending}
                  select={Boolean(field.options)}
                  multiline={field.multiline}
                  minRows={field.multiline ? 5 : undefined}
                  helperText={field.helper}
                  fullWidth
                  InputLabelProps={
                    field.type === 'datetime-local' || field.type === 'date' ? { shrink: true } : undefined
                  }
                  inputProps={field.type === 'number' ? { min: 0, step: 'any' } : undefined}
                >
                  {field.options?.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              )
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button type='submit' variant='contained' disabled={pending}>
            {pending ? 'Guardando…' : submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export const optionsFrom = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }))
export const localDateTime = (date = new Date()) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
