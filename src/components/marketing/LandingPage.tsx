import Link from 'next/link'

import styles from './public-site.module.css'

const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Magnus CRM',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://crm.magnusecosystems.com',
  description:
    'CRM de WhatsApp para equipos comerciales que necesitan centralizar conversaciones, leads, pipeline y visibilidad operativa.',
  provider: {
    '@type': 'Organization',
    name: 'Magnus Ecosystems',
    url: 'https://crm.magnusecosystems.com'
  }
}

const features = [
  {
    id: '01',
    title: 'Inbox de WhatsApp con criterio comercial',
    text: 'Centraliza conversaciones, identifica contexto del contacto y evita perder oportunidades entre mensajes sueltos.'
  },
  {
    id: '02',
    title: 'Pipeline listo para seguimiento',
    text: 'Convierte cada conversacion en lead accionable y mueve el trabajo comercial desde una sola vista operativa.'
  },
  {
    id: '03',
    title: 'Multi-tenant desde el inicio',
    text: 'Pensado para SaaS: cada cliente conecta sus propios activos de Meta, su dominio y su flujo operativo.'
  }
] as const

const LandingPage = () => {
  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />

      <main>
        <section className={styles.shell}>
          <div className={styles.hero}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrowPill}>CRM de WhatsApp para equipos comerciales</span>

              <div>
                <h1 className={styles.heroTitle}>
                  Convierte conversaciones en pipeline.
                  <span className={styles.heroHighlight}>Sin salir del CRM.</span>
                </h1>
              </div>

              <p className={styles.heroText}>
                Magnus CRM ayuda a captar leads desde WhatsApp, responder con contexto y mover cada oportunidad hacia
                cierre con mas orden, menos friccion y mejor trazabilidad.
              </p>

              <div className={styles.heroActions}>
                <Link href='/register' className={styles.buttonPrimary}>
                  Crear cuenta
                </Link>
                <Link href='/login' className={styles.buttonSecondary}>
                  Iniciar sesion
                </Link>
              </div>

              <div className={styles.heroMeta}>
                <div className={styles.metaCard}>
                  <span className={styles.metaNumber}>1 inbox</span>
                  <span className={styles.metaLabel}>Mensajes, seguimiento y contexto en un solo flujo.</span>
                </div>
                <div className={styles.metaCard}>
                  <span className={styles.metaNumber}>0 caos</span>
                  <span className={styles.metaLabel}>
                    Menos conversaciones perdidas y menos trabajo fuera de sistema.
                  </span>
                </div>
                <div className={styles.metaCard}>
                  <span className={styles.metaNumber}>100% SaaS</span>
                  <span className={styles.metaLabel}>Base multi-tenant lista para crecimiento y clientes reales.</span>
                </div>
              </div>
            </div>

            <div className={styles.heroPanel}>
              <div className={styles.panelHeader}>
                <div>
                  <div className={styles.panelLabel}>Vista del workspace</div>
                  <div className={styles.panelTitle}>Una capa comercial encima de tu canal de WhatsApp</div>
                </div>
                <div className={styles.panelBadge}>Meta-ready</div>
              </div>

              <div className={styles.conversationStack}>
                <div className={styles.conversationCard}>
                  <div>
                    <div className={styles.conversationTitle}>Nuevo lead entrante</div>
                    <div className={styles.conversationText}>
                      El mensaje se registra, se asocia al contacto y cae al pipeline para respuesta inmediata.
                    </div>
                  </div>
                  <div className={styles.conversationMeta}>
                    <div className={styles.conversationValue}>08m</div>
                    <div className={styles.conversationStatus}>objetivo de primera respuesta</div>
                  </div>
                </div>

                <div className={styles.conversationCard}>
                  <div>
                    <div className={styles.conversationTitle}>Seguimiento y asignacion</div>
                    <div className={styles.conversationText}>
                      Cada hilo queda visible para el equipo correcto con estado, prioridad y actividad reciente.
                    </div>
                  </div>
                  <div className={styles.conversationMeta}>
                    <div className={styles.conversationValue}>Kanban</div>
                    <div className={styles.conversationStatus}>pipeline comercial</div>
                  </div>
                </div>

                <div className={styles.conversationCard}>
                  <div>
                    <div className={styles.conversationTitle}>Costos y control operativo</div>
                    <div className={styles.conversationText}>
                      Base preparada para trazabilidad de mensajes, entregas y costos relacionados con Meta.
                    </div>
                  </div>
                  <div className={styles.conversationMeta}>
                    <div className={styles.conversationValue}>Ledger</div>
                    <div className={styles.conversationStatus}>base lista para billing</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.proofBar}>
            <div className={styles.proofItem}>
              <div className={styles.proofTitle}>Conversion</div>
              <div className={styles.proofText}>Registro directo o login sin rodeos para activar el workspace.</div>
            </div>
            <div className={styles.proofItem}>
              <div className={styles.proofTitle}>Legal</div>
              <div className={styles.proofText}>Paginas publicas de privacidad y terminos listas para publicacion.</div>
            </div>
            <div className={styles.proofItem}>
              <div className={styles.proofTitle}>Compliance</div>
              <div className={styles.proofText}>Ruta interna para eliminacion de datos por usuario autenticado.</div>
            </div>
            <div className={styles.proofItem}>
              <div className={styles.proofTitle}>SEO basico</div>
              <div className={styles.proofText}>Metadata, canonical, sitemap y robots preparados para lanzamiento.</div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.shell}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Disenado para el tramo mas delicado del embudo</h2>
              <p className={styles.sectionText}>
                El problema no es solo responder mensajes. El problema es responderlos con contexto, asignarlos bien y
                convertirlos en una operacion medible para el equipo.
              </p>
            </div>

            <div className={styles.featureGrid}>
              {features.map(feature => (
                <article key={feature.id} className={styles.featureCard}>
                  <span className={styles.featureIndex}>{feature.id}</span>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureText}>{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.shell}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Listo para llevar a produccion</h2>
              <p className={styles.sectionText}>
                Esta superficie publica existe para convertir visitas en acceso y para cubrir lo basico que te pediran
                al publicar la app de Meta: identidad clara, documentos legales y rutas operativas coherentes.
              </p>
            </div>

            <div className={styles.conversionPanel}>
              <div className={styles.conversionChecklist}>
                <div className={styles.checkItem}>
                  <span className={styles.checkDot}>1</span>
                  <div>
                    <strong>Registro y login visibles</strong>
                    <p className={styles.sectionText}>
                      La landing lleva directo a las rutas de acceso del CRM sin esconder el siguiente paso.
                    </p>
                  </div>
                </div>

                <div className={styles.checkItem}>
                  <span className={styles.checkDot}>2</span>
                  <div>
                    <strong>Politica y terminos enlazados</strong>
                    <p className={styles.sectionText}>
                      Documentos publicos, indexables y enlazados desde footer, registro y metadatos del sitio.
                    </p>
                  </div>
                </div>

                <div className={styles.checkItem}>
                  <span className={styles.checkDot}>3</span>
                  <div>
                    <strong>Ruta interna de eliminacion de datos</strong>
                    <p className={styles.sectionText}>
                      Los usuarios autenticados pueden gestionar la eliminacion de su cuenta desde el propio CRM.
                    </p>
                  </div>
                </div>
              </div>

              <aside className={styles.ctaCard}>
                <h3 className={styles.ctaTitle}>Activa la entrada correcta al producto</h3>
                <p className={styles.ctaText}>
                  Si ya tienes acceso, entra al workspace. Si estas arrancando, crea tu cuenta y continua la
                  configuracion del CRM desde el flujo de autenticacion.
                </p>
                <div className={styles.heroActions}>
                  <Link href='/register' className={styles.buttonPrimary}>
                    Ir al registro
                  </Link>
                  <Link href='/login' className={styles.buttonSecondary}>
                    Ya tengo acceso
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default LandingPage
