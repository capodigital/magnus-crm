import type { ReactNode } from 'react'

import styles from './public-site.module.css'

type LegalSection = {
  title: string
  content: ReactNode
}

type LegalDocumentPageProps = {
  eyebrow: string
  title: string
  description: string
  sections: LegalSection[]
}

const LegalDocumentPage = ({ eyebrow, title, description, sections }: LegalDocumentPageProps) => {
  return (
    <main className={styles.legalMain}>
      <div className={styles.shell}>
        <article className={styles.legalCard}>
          <header className={styles.legalHeader}>
            <span className={styles.legalEyebrow}>{eyebrow}</span>
            <h1 className={styles.legalTitle}>{title}</h1>
            <p className={styles.legalDescription}>{description}</p>
          </header>
          <div className={styles.legalContent}>
            {sections.map(section => (
              <section key={section.title} className={styles.legalSection}>
                <h2>{section.title}</h2>
                <div>{section.content}</div>
              </section>
            ))}
          </div>
        </article>
      </div>
    </main>
  )
}

export default LegalDocumentPage
