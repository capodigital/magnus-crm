'use client'

import Link from 'next/link'

import Button from '@mui/material/Button'
import type { ButtonProps } from '@mui/material/Button'

export default function LinkButton(props: Omit<ButtonProps<typeof Link>, 'component'> & { href: string }) {
  return <Button component={Link} {...props} />
}
