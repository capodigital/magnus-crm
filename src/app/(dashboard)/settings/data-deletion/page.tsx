import type { Metadata } from 'next'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import DeleteAccountPanel from '@components/crm/DeleteAccountPanel'

export const metadata: Metadata = {
  title: 'Eliminar datos',
  description: 'Gestiona la eliminacion de tu cuenta y datos personales dentro de Magnus CRM.'
}

const DataDeletionPage = () => {
  return (
    <Stack spacing={3}>
      <Stack spacing={1} sx={{ maxWidth: 820 }}>
        <Typography variant='overline' color='text.secondary' sx={{ letterSpacing: 1.2 }}>
          Gestion de datos
        </Typography>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 800 }}>
          Eliminar datos de usuario
        </Typography>
        <Typography color='text.secondary'>
          Esta URL interna permite a cada usuario autenticado gestionar la eliminacion de su propia cuenta desde el CRM.
        </Typography>
      </Stack>
      <DeleteAccountPanel />
    </Stack>
  )
}

export default DataDeletionPage
