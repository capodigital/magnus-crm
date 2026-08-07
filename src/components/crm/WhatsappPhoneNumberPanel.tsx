'use client'

import { useState, type FormEvent } from 'react'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import CustomTextField from '@core/components/mui/TextField'

type WhatsappPhoneNumberPanelProps = {
  workspaceName: string | null
  initialPhoneNumber: {
    wabaId: string
    phoneNumberId: string
    displayPhoneNumber: string | null
    verifiedName: string | null
  } | null
}

type RegisterPhoneResponse = {
  result?: {
    tenantSlug: string
    phoneNumberId: string
    wabaId: string
    displayPhoneNumber: string | null
    created: boolean
  }
  error?: string
}

const WhatsappPhoneNumberPanel = ({ workspaceName, initialPhoneNumber }: WhatsappPhoneNumberPanelProps) => {
  const [wabaId, setWabaId] = useState(initialPhoneNumber?.wabaId ?? '')
  const [phoneNumberId, setPhoneNumberId] = useState(initialPhoneNumber?.phoneNumberId ?? '')
  const [displayPhoneNumber, setDisplayPhoneNumber] = useState(initialPhoneNumber?.displayPhoneNumber ?? '')
  const [verifiedName, setVerifiedName] = useState(initialPhoneNumber?.verifiedName ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const response = await fetch('/api/workspace/whatsapp-phone-number', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        wabaId,
        phoneNumberId,
        displayPhoneNumber,
        verifiedName
      })
    })

    const payload = (await response.json().catch(() => null)) as RegisterPhoneResponse | null

    setIsSubmitting(false)

    if (!response.ok || !payload?.result) {
      setErrorMessage(payload?.error ?? 'No pudimos vincular el numero de WhatsApp.')

      return
    }

    setSuccessMessage(
      payload.result.created
        ? 'Numero de WhatsApp vinculado al workspace.'
        : 'Numero de WhatsApp actualizado para este workspace.'
    )
  }

  return (
    <Card variant='outlined'>
      <CardContent sx={{ p: { xs: 4, md: 5 } }}>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant='h5' component='h2' sx={{ fontWeight: 800 }}>
              WhatsApp Cloud API
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Vincula el numero productivo de Meta al workspace {workspaceName ? `"${workspaceName}"` : 'actual'}.
              Este reemplaza el paso manual de poner el tenant en variables de entorno.
            </Typography>
          </Stack>

          <form noValidate autoComplete='off' onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <CustomTextField
                fullWidth
                required
                label='WhatsApp Business Account ID'
                placeholder='Ej. 1559076649331493'
                value={wabaId}
                onChange={event => setWabaId(event.target.value)}
              />
              <CustomTextField
                fullWidth
                required
                label='Phone Number ID'
                placeholder='Ej. 1294669913720839'
                value={phoneNumberId}
                onChange={event => setPhoneNumberId(event.target.value)}
              />
              <CustomTextField
                fullWidth
                label='Numero visible'
                placeholder='Ej. +1 555 123 4567'
                value={displayPhoneNumber}
                onChange={event => setDisplayPhoneNumber(event.target.value)}
              />
              <CustomTextField
                fullWidth
                label='Nombre verificado'
                placeholder='Ej. Magnus Ecosystems'
                value={verifiedName}
                onChange={event => setVerifiedName(event.target.value)}
              />

              {successMessage ? <Alert severity='success'>{successMessage}</Alert> : null}
              {errorMessage ? <Alert severity='error'>{errorMessage}</Alert> : null}

              <Button type='submit' variant='contained' disabled={isSubmitting}>
                {isSubmitting ? 'Vinculando...' : 'Vincular numero de WhatsApp'}
              </Button>
            </Stack>
          </form>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default WhatsappPhoneNumberPanel
