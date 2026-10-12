import type { HorizontalMenuDataType } from '@/types/menuTypes'

const horizontalMenuData = (): HorizontalMenuDataType[] => [
  { label: 'Inicio', href: '/home', icon: 'tabler-layout-dashboard' },
  { label: 'Contactos', href: '/contacts', icon: 'tabler-address-book' },
  { label: 'Oportunidades', href: '/leads', icon: 'tabler-target-arrow' },
  { label: 'Pipeline', href: '/pipeline', icon: 'tabler-layout-kanban' },
  { label: 'Conversaciones', href: '/inbox', icon: 'tabler-messages' },
  { label: 'Facturación', href: '/billing', icon: 'tabler-receipt' },
  {
    label: 'Configuración',
    icon: 'tabler-settings-2',
    children: [
      { label: 'General', href: '/settings', exactMatch: true },
      { label: 'Integraciones', href: '/settings/integrations', exactMatch: false, activeUrl: '/settings/integrations' }
    ]
  }
]

export default horizontalMenuData
