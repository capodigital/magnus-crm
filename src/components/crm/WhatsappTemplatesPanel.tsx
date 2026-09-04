'use client'

import { useEffect, useState, type FormEvent } from 'react'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip, { type ChipProps } from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import {
  whatsappTemplateCreationCategories,
  whatsappTemplateCategoryLabels,
  whatsappTemplateStatusLabels,
  whatsappTemplateStarterTemplates,
  type WhatsappTemplateCategoryValue,
  type WhatsappTemplateStatusValue,
  type WhatsappTemplateView
} from '@/lib/whatsapp/template-contract'
import { getWhatsappTemplateVariableIndexes } from '@/lib/whatsapp/template-utils'

type WhatsappTemplatesPanelProps = {
  workspaceName: string | null
  initialTemplates: WhatsappTemplateView[]
}

type TemplateResponse = {
  result?: {
    template?: WhatsappTemplateView
    templates?: WhatsappTemplateView[]
  }
  error?: string
}

const statusColors: Record<WhatsappTemplateStatusValue, ChipProps['color']> = {
  DRAFT: 'default',
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  PAUSED: 'warning',
  DISABLED: 'default'
}

const WhatsappTemplatesPanel = ({ workspaceName, initialTemplates }: WhatsappTemplatesPanelProps) => {
  const [templates, setTemplates] = useState(initialTemplates)
  const [name, setName] = useState('')
  const [language, setLanguage] = useState('es_ES')
  const [category, setCategory] = useState<WhatsappTemplateCategoryValue>('UTILITY')
  const [bodyText, setBodyText] = useState('')
  const [exampleValues, setExampleValues] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const bodyVariableIndexes = getWhatsappTemplateVariableIndexes(bodyText)

  useEffect(() => {
    const variableIndexes = getWhatsappTemplateVariableIndexes(bodyText)

    setExampleValues(current => variableIndexes.map((_, index) => current[index] ?? ''))
  }, [bodyText])

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/whatsapp/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, language, category, bodyText, exampleValues })
      })

      const payload = (await response.json().catch(() => null)) as TemplateResponse | null

      if (!response.ok || !payload?.result?.template) {
        setErrorMessage(payload?.error ?? 'No pudimos enviar la plantilla a revision.')

        return
      }

      setTemplates(current => [payload.result!.template!, ...current])
      setName('')
      setBodyText('')
      setExampleValues([])
      setSuccessMessage('Plantilla enviada a Meta. Podras usarla cuando aparezca como aprobada.')
    } catch {
      setErrorMessage('No pudimos conectar con el servidor para crear la plantilla.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/whatsapp/templates/sync', { method: 'POST' })
      const payload = (await response.json().catch(() => null)) as TemplateResponse | null

      if (!response.ok || !payload?.result?.templates) {
        setErrorMessage(payload?.error ?? 'No pudimos sincronizar las plantillas con Meta.')

        return
      }

      setTemplates(payload.result.templates)
      setSuccessMessage('Plantillas sincronizadas con Meta.')
    } catch {
      setErrorMessage('No pudimos conectar con Meta para sincronizar las plantillas.')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Card variant='outlined'>
      <CardContent sx={{ p: { xs: 4, md: 5 } }}>
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent='space-between' spacing={2}>
            <Stack spacing={1}>
              <Typography variant='h5' component='h2' sx={{ fontWeight: 800 }}>
                Plantillas de WhatsApp
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Crea mensajes aprobados para contactar a clientes cuando la ventana de atencion de 24 horas haya terminado
                {workspaceName ? ` en ${workspaceName}` : ''}.
              </Typography>
            </Stack>
            <Button variant='outlined' onClick={handleSync} disabled={isSyncing} startIcon={<i className='tabler-refresh' />}>
              {isSyncing ? 'Sincronizando...' : 'Sincronizar con Meta'}
            </Button>
          </Stack>

          <Alert severity='info'>
            Meta revisa cada plantilla. El texto libre se usa dentro de las 24 horas; fuera de ese plazo solo se pueden enviar
            plantillas aprobadas y activas.
          </Alert>

          <Stack spacing={0.75} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant='subtitle2' sx={{ fontWeight: 800 }}>
              Cómo funciona
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              1. El cliente escribe al negocio y se abre una ventana de atención de 24 horas.
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              2. Durante ese tiempo puedes responder normalmente desde la bandeja.
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              3. Cuando termina, eliges una plantilla aprobada y completas sus datos antes de enviarla.
            </Typography>
          </Stack>

          <Stack component='form' spacing={2.5} onSubmit={handleCreate}>
            <Typography variant='subtitle1' sx={{ fontWeight: 800 }}>
              Crear plantilla
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                fullWidth
                required
                label='Nombre técnico'
                placeholder='Confirmación de cita'
                value={name}
                onChange={event => setName(event.target.value)}
                helperText='Se convertirá automáticamente al formato que requiere Meta.'
              />
              <TextField
                fullWidth
                required
                label='Idioma'
                value={language}
                onChange={event => setLanguage(event.target.value)}
                helperText='Ejemplos: es_ES, es_419 o en_US.'
              />
              <FormControl fullWidth>
                <InputLabel id='whatsapp-template-category-label'>Categoría</InputLabel>
                <Select
                  labelId='whatsapp-template-category-label'
                  label='Categoría'
                  value={category}
                  onChange={event => setCategory(event.target.value as WhatsappTemplateCategoryValue)}
                >
                  {whatsappTemplateCreationCategories.map(option => (
                    <MenuItem key={option} value={option}>
                      {whatsappTemplateCategoryLabels[option]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <TextField
              fullWidth
              required
              multiline
              minRows={3}
              maxRows={6}
              label='Mensaje'
              placeholder='Hola {{1}}, te confirmamos tu cita para el {{2}}.'
              value={bodyText}
              onChange={event => setBodyText(event.target.value)}
              inputProps={{ maxLength: 1024 }}
              helperText={`${bodyText.length}/1024. Usa {{1}}, {{2}} para datos que el agente completará al enviar.`}
            />
            {bodyVariableIndexes.length ? (
              <Stack spacing={1}>
                <Typography variant='subtitle2' sx={{ fontWeight: 800 }}>
                  Ejemplos para revisión
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Meta usa estos valores solo para entender cómo se verá la plantilla. El agente pondrá los valores reales al enviar.
                </Typography>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                  {bodyVariableIndexes.map((variableIndex, index) => (
                    <TextField
                      key={variableIndex}
                      fullWidth
                      required
                      label={`Ejemplo para {{${variableIndex}}}`}
                      value={exampleValues[index] ?? ''}
                      onChange={event =>
                        setExampleValues(current =>
                          current.map((value, currentIndex) => (currentIndex === index ? event.target.value : value))
                        )
                      }
                    />
                  ))}
                </Stack>
              </Stack>
            ) : null}
            <Button type='submit' variant='contained' disabled={isSubmitting} sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}>
              {isSubmitting ? 'Enviando a Meta...' : 'Enviar a revisión de Meta'}
            </Button>
            <Stack spacing={1}>
              <Typography variant='caption' color='text.secondary'>
                ¿No sabes cómo empezar? Usa un ejemplo y personalízalo antes de enviarlo.
              </Typography>
              <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
                {whatsappTemplateStarterTemplates.map(starter => (
                  <Button
                    key={starter.name}
                    type='button'
                    size='small'
                    variant='outlined'
                    onClick={() => {
                      setName(starter.name)
                      setCategory(starter.category)
                      setBodyText(starter.bodyText)
                      setExampleValues([...starter.exampleValues])
                    }}
                  >
                    Usar {starter.name.replaceAll('_', ' ')}
                  </Button>
                ))}
              </Stack>
            </Stack>
          </Stack>

          {successMessage ? <Alert severity='success'>{successMessage}</Alert> : null}
          {errorMessage ? <Alert severity='error'>{errorMessage}</Alert> : null}

          <Divider />
          <Stack spacing={1.5}>
            <Typography variant='subtitle1' sx={{ fontWeight: 800 }}>
              Tus plantillas
            </Typography>
            {templates.length ? (
              templates.map(template => (
                <Stack
                  key={template.id}
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent='space-between'
                  spacing={1.5}
                  sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                >
                  <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                    <Stack direction='row' spacing={1} alignItems='center' useFlexGap flexWrap='wrap'>
                      <Typography variant='subtitle2' sx={{ fontWeight: 800 }}>
                        {template.name}
                      </Typography>
                      <Chip label={whatsappTemplateStatusLabels[template.status]} color={statusColors[template.status]} size='small' />
                      <Chip label={whatsappTemplateCategoryLabels[template.category]} size='small' variant='outlined' />
                      <Chip label={template.language} size='small' variant='outlined' />
                    </Stack>
                    <Typography variant='body2' color='text.secondary' sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                      {template.bodyText}
                    </Typography>
                    {template.rejectionReason ? (
                      <Typography variant='caption' color='error.main'>
                        Motivo de Meta: {template.rejectionReason}
                      </Typography>
                    ) : null}
                  </Stack>
                </Stack>
              ))
            ) : (
              <Typography variant='body2' color='text.secondary'>
                Todavía no hay plantillas. Crea la primera para poder contactar clientes fuera de su ventana de atención.
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default WhatsappTemplatesPanel
