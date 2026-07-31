// React Imports
import type { SVGAttributes } from 'react'

const Logo = (props: SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      width='1.42em'
      height='1.18em'
      viewBox='0 0 96 80'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path
        d='M18 45V19C18 13.7 24.3 11.2 27.8 15.1L48 37L68.2 15.1C71.7 11.2 78 13.7 78 19V45'
        stroke='var(--magnus-brand-teal, #0F766E)'
        strokeWidth='8.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M17 51L31 38L48 55L65 38L79 51'
        stroke='var(--magnus-brand-ink, #10212A)'
        strokeWidth='7.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M18 58V71L34 59H43'
        stroke='var(--magnus-brand-teal, #0F766E)'
        strokeWidth='8.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <circle cx='17' cy='51' r='9.5' fill='var(--magnus-brand-ink, #10212A)' />
      <circle cx='48' cy='58' r='9.5' fill='var(--magnus-brand-mint, #7FD7C6)' />
      <circle cx='79' cy='51' r='9.5' fill='var(--magnus-brand-gold, #C89B3C)' />
    </svg>
  )
}

export default Logo
