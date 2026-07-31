import type { ReactNode } from 'react'

import Link from 'next/link'

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
            <span className={styles.brandMark} aria-hidden='true' />
            <span className={styles.brandText}>
              <span className={styles.brandEyebrow}>Magnus Ecosystems</span>
              <span className={styles.brandTitle}>Magnus CRM</span>
            </span>
          </Link>

          <nav className={styles.navLinks} aria-label='Primary'>
            <Link href='/privacy-policy' className={styles.linkSoft}>
              Privacidad
            </Link>
            <Link href='/terms-of-service' className={styles.linkSoft}>
              Terminos
            </Link>
          </nav>

          <div className={styles.headerActions}>
            <Link href='/login' className={styles.buttonGhost}>
              Iniciar sesion
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
                <span className={styles.brandMark} aria-hidden='true' />
                <span className={styles.brandText}>
                  <span className={styles.brandEyebrow}>Magnus Ecosystems</span>
                  <span className={styles.brandTitle}>Magnus CRM</span>
                </span>
              </div>
              <p className={styles.footerText}>
                CRM de WhatsApp para equipos que necesitan responder, calificar y cerrar con mas orden desde un solo
                workspace comercial.
              </p>
            </div>

            <div className={styles.footerLinks}>
              <Link href='/'>Inicio</Link>
              <Link href='/register'>Registro</Link>
              <Link href='/login'>Login</Link>
              <Link href='/privacy-policy'>Politica de privacidad</Link>
              <Link href='/terms-of-service'>Condiciones de servicio</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PublicSiteShell
