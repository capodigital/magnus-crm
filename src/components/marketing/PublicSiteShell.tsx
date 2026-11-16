import type { ReactNode } from 'react'

import Link from 'next/link'

import MagnusLogoMark from '@core/svg/Logo'
import { publicSite } from '@/configs/publicSite'

import styles from './public-site.module.css'

type PublicSiteShellProps = {
  children: ReactNode
}

const PublicSiteShell = ({ children }: PublicSiteShellProps) => {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.shell} ${styles.headerInner}`}>
          <Link href='/' className={styles.brand}>
            <MagnusLogoMark className={styles.brandLogo} aria-hidden='true' focusable='false' />
            <span className={styles.brandText}>
              <span className={styles.brandEyebrow}>Magnus Ecosystems</span>
              <span className={styles.brandTitle}>Magnus CRM</span>
            </span>
          </Link>

          <nav className={styles.navLinks} aria-label='Navegación pública'>
            <Link href='/#funciones' className={styles.linkSoft}>
              Funciones
            </Link>
            <Link href='/privacy-policy' className={styles.linkSoft}>
              Privacidad
            </Link>
            <Link href='/terms-of-service' className={styles.linkSoft}>
              Términos
            </Link>
          </nav>

          <div className={styles.headerActions}>
            <Link href='/login' className={styles.buttonGhost}>
              Iniciar sesión
            </Link>
            <Link href='/register' className={styles.buttonPrimary}>
              Crear cuenta
            </Link>
          </div>
        </div>
      </header>

      {children}

      <footer className={styles.footer}>
        <div className={styles.shell}>
          <div className={styles.footerCard}>
            <div>
              <div className={styles.brand}>
                <MagnusLogoMark className={styles.brandLogo} aria-hidden='true' focusable='false' />
                <span className={styles.brandText}>
                  <span className={styles.brandEyebrow}>Magnus Ecosystems</span>
                  <span className={styles.brandTitle}>Magnus CRM</span>
                </span>
              </div>
              <p className={styles.footerText}>
                Magnus CRM, de Magnus Ecosystems. Clientes, oportunidades, conversaciones y campañas para tu equipo
                comercial.
              </p>
              <p className={styles.footerText}>
                Soporte y privacidad: <a href={`mailto:${publicSite.contactEmail}`}>{publicSite.contactEmail}</a>
              </p>
            </div>

            <div className={styles.footerLinks}>
              <Link href='/'>Inicio</Link>
              <Link href='/register'>Registro</Link>
              <Link href='/login'>Iniciar sesión</Link>
              <Link href='/privacy-policy'>Política de privacidad</Link>
              <Link href='/terms-of-service'>Condiciones de servicio</Link>
              <Link href='/data-deletion'>Eliminar datos</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PublicSiteShell
