'use client'

import { useEffect, useState } from 'react'

import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

type Option = { id: string; fullName: string | null; email: string | null }

export default function ContactPicker({
  value,
  onChange
}: {
  value: Option | null
  onChange: (value: Option | null) => void
}) {
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState<Option[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    const timer = setTimeout(async () => {
      setLoading(true)
      setError(false)

      try {
        const response = await fetch(`/api/crm/contacts/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal
        })

        if (!response.ok) throw new Error('Search failed')
        const data = await response.json()

        setOptions(data.result)
      } catch {
        if (!controller.signal.aborted) setError(true)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 300)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  return (
    <Autocomplete
      id='contact-picker'
      getOptionKey={item => item.id}
      options={options}
      value={value}
      loading={loading}
      filterOptions={items => items}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      getOptionLabel={item => `${item.fullName || 'Sin nombre'}${item.email ? ` · ${item.email}` : ''}`}
      onChange={(_, item) => onChange(item)}
      onInputChange={(_, text, reason) => {
        if (reason === 'input' || reason === 'clear') setQuery(text)
      }}
      noOptionsText='No se encontraron contactos'
      loadingText='Buscando…'
      renderInput={params => (
        <TextField
          {...params}
          label='Contacto'
          required
          error={error}
          helperText={error ? 'No se pudo buscar. Inténtalo de nuevo.' : 'Busca un contacto por nombre o email.'}
        />
      )}
    />
  )
}
