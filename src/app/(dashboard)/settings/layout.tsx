import type { ReactNode } from 'react'

import Stack from '@mui/material/Stack'

import SettingsNavigation from '@components/crm/SettingsNavigation'

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <Stack spacing={5}>
      <SettingsNavigation />
      {children}
    </Stack>
  )
}
