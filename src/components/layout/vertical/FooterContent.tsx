import Link from 'next/link'

export default function FooterContent() {
  return (
    <div className='flex items-center justify-between flex-wrap gap-3 text-sm text-textSecondary'>
      <span>© {new Date().getFullYear()} Magnus CRM</span>
      <div className='flex items-center gap-4'>
        <Link href='/privacy-policy'>Privacidad</Link>
        <Link href='/settings'>Configuración</Link>
      </div>
    </div>
  )
}
