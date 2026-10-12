import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import Button from '@components/crm/LinkButton'

export const parsePage = (value: string | string[] | undefined) => {
  const page = Number(Array.isArray(value) ? value[0] : value)

  return Number.isSafeInteger(page) && page > 0 && page <= 10000 ? page : 1
}

export default function RecordsPagination({ page, total, href }: { page: number; total: number; href: string }) {
  const lastPage = Math.max(1, Math.ceil(total / 25))

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems='center'
      justifyContent='space-between'
      spacing={2}
      sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}
    >
      <Typography variant='body2' color='text.secondary'>
        {total} registros · Página {page} de {lastPage}
      </Typography>
      <Stack direction='row' spacing={1}>
        <Button href={`${href}?page=${Math.max(1, page - 1)}`} disabled={page <= 1} size='small' variant='outlined'>
          Anterior
        </Button>
        <Button href={`${href}?page=${page + 1}`} disabled={page >= lastPage} size='small' variant='outlined'>
          Siguiente
        </Button>
      </Stack>
    </Stack>
  )
}
