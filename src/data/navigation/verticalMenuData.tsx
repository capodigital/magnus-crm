// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'

const verticalMenuData = (): VerticalMenuDataType[] => [
  {
    label: 'Home',
    href: '/home',
    icon: 'tabler-smart-home'
  },
  {
    label: 'Inbox',
    href: '/inbox',
    icon: 'tabler-message-2'
  },
  {
    label: 'Leads',
    href: '/leads',
    icon: 'tabler-users'
  },
  {
    label: 'Pipeline',
    href: '/pipeline',
    icon: 'tabler-route'
  },
  {
    label: 'Billing',
    href: '/billing',
    icon: 'tabler-file-dollar'
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: 'tabler-settings-2'
  }
]

export default verticalMenuData
