import Link from 'next/link'

import { publicSite } from '@/configs/publicSite'

import styles from './public-site.module.css'

const features = [
  {
    title: 'Clientes y contactos',
    text: 'Crea clientes y consulta su información, conversaciones, propuestas e historial de interacciones desde una misma ficha.'
  },
  {
    title: 'Leads y oportunidades',
    text: 'Registra leads manualmente, organiza las etapas de venta y sigue el avance de cada oportunidad en tu pipeline.'
  },
  {
    title: 'Conversaciones de WhatsApp',
    text: 'Conecta tu cuenta de WhatsApp Business para recibir y responder mensajes con el contexto de cada contacto.'
  },
  {
    title: 'Agenda y seguimiento',
    text: 'Registra llamadas, emails y reuniones. Organiza tareas y recordatorios en el historial de cada cliente.'
  },
  {
    title: 'Campañas y automatizaciones',
    text: 'Segmenta tus contactos, prepara campañas de email y programa seguimientos para destinatarios con consentimiento.'
  },
  {
    title: 'Asistencia para redactar',
    text: 'Prepara borradores de propuestas y emails con IA a partir del contexto que aportas. Revísalos y edítalos antes de utilizarlos.'
  }
] as const

const LandingPage = () => (
  <>
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: publicSite.name,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          url: publicSite.url,
          description: 'Gestión de clientes, oportunidades, conversaciones, campañas y seguimiento comercial.',
          provider: { '@type': 'Organization', name: publicSite.operator, email: publicSite.contactEmail }
        })
      }}
    />
    <main id='contenido'>
      <section className={styles.shell} aria-labelledby='product-title'>
        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrowPill}>Por Magnus Ecosystems</span>
            <h1 id='product-title' className={styles.heroTitle}>
              Magnus CRM
              <span className={styles.heroHighlight}>Cada relación, una oportunidad.</span>
            </h1>
            <p className={styles.heroText}>
              Un CRM para equipos comerciales que quieren gestionar clientes, leads y oportunidades, conversar por
              WhatsApp y dar seguimiento con campañas de email, tareas y recordatorios desde un mismo lugar.
            </p>
            <div className={styles.heroActions}>
              <Link href='/register' className={styles.buttonPrimary}>
                Crear cuenta
              </Link>
              <Link href='/login' className={styles.buttonSecondary}>
                Iniciar sesión
              </Link>
            </div>
            <p className={styles.sectionText}>
              Conoce cómo tratamos tu información en nuestra <Link href='/privacy-policy'>política de privacidad</Link>.
            </p>
          </div>
          <div className={styles.productVisual}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src='/images/illustrations/auth/magnus-login.webp'
              width={1200}
              height={1200}
              alt=''
              fetchPriority='high'
            />
            <p>Clientes, conversaciones y próximos pasos. Conectados.</p>
          </div>
        </div>
      </section>

      <section id='funciones' className={styles.section} aria-labelledby='features-title'>
        <div className={styles.shell}>
          <div className={styles.sectionHeader}>
            <h2 id='features-title' className={styles.sectionTitle}>
              Del primer contacto al próximo acuerdo.
            </h2>
            <p className={styles.sectionText}>
              Mantén el contexto de tus clientes y organiza el trabajo de tu equipo a lo largo de todo el proceso
              comercial.
            </p>
          </div>
          <div className={styles.featureGrid}>
            {features.map((feature, index) => (
              <article key={feature.title} className={styles.featureCard}>
                <span className={styles.featureIndex} aria-hidden='true'>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureText}>{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id='google' className={styles.section} aria-labelledby='google-title'>
        <div className={styles.shell}>
          <div className={styles.sectionHeader}>
            <h2 id='google-title' className={styles.sectionTitle}>
              Tu acceso. Tus datos. Tu decisión.
            </h2>
            <p className={styles.sectionText}>
              Puedes crear una cuenta con email y contraseña o elegir Continuar con Google.
            </p>
          </div>
          <div className={styles.conversionPanel}>
            <div className={styles.conversionChecklist}>
              <div className={styles.checkItem}>
                <span className={styles.checkDot} aria-hidden='true'>
                  1
                </span>
                <div>
                  <h3>Google identifica tu cuenta</h3>
                  <p className={styles.sectionText}>
                    Recibimos tu nombre, correo verificado, foto de perfil e identificador de Google para crear o
                    reconocer tu cuenta y permitirte entrar de forma segura. Nunca recibimos tu contraseña de Google.
                  </p>
                </div>
              </div>
              <div className={styles.checkItem}>
                <span className={styles.checkDot} aria-hidden='true'>
                  2
                </span>
                <div>
                  <h3>El acceso se limita a tu identidad</h3>
                  <p className={styles.sectionText}>
                    No solicitamos acceso a Gmail, Google Drive, Calendar ni a tus contactos de Google. Las campañas se
                    envían desde el CRM, sin leer ni enviar mensajes desde tu cuenta de Gmail.
                  </p>
                </div>
              </div>
              <div className={styles.checkItem}>
                <span className={styles.checkDot} aria-hidden='true'>
                  3
                </span>
                <div>
                  <h3>Tú controlas la conexión</h3>
                  <p className={styles.sectionText}>
                    Puedes revocar el acceso desde tu cuenta de Google o solicitar la eliminación de tus datos. Consulta
                    nuestra <Link href='/data-deletion'>guía de eliminación</Link>.
                  </p>
                </div>
              </div>
            </div>
            <aside className={styles.ctaCard}>
              <h3 className={styles.ctaTitle}>IA para tu trabajo comercial</h3>
              <p className={styles.ctaText}>
                La asistencia de Magnus CRM genera texto para propuestas y emails cuando la solicitas. No genera
                imágenes ni utiliza los datos obtenidos del acceso con Google para generar contenido o entrenar modelos.
              </p>
              <p className={styles.ctaText}>
                Lee qué información se procesa y con qué finalidad en la{' '}
                <Link href='/privacy-policy'>política de privacidad</Link>.
              </p>
              <p className={styles.ctaText}>
                ¿Necesitas ayuda? <a href={`mailto:${publicSite.contactEmail}`}>{publicSite.contactEmail}</a>
              </p>
            </aside>
          </div>
        </div>
      </section>
    </main>
  </>
)

export default LandingPage
