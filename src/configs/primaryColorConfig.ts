export type PrimaryColorConfig = {
  name?: string
  light?: string
  main: string
  dark?: string
}

// Primary color config object
const primaryColorConfig: PrimaryColorConfig[] = [
  {
    name: 'primary-1',
    light: '#2BAA9F',
    main: '#0F766E',
    dark: '#0A4F4A'
  },
  {
    name: 'primary-2',
    light: '#2B6D7F',
    main: '#164E63',
    dark: '#0F3948'
  },
  {
    name: 'primary-3',
    light: '#D9B968',
    main: '#C89B3C',
    dark: '#9C7525'
  },
  {
    name: 'primary-4',
    light: '#A7E6DC',
    main: '#7FD7C6',
    dark: '#2BAA9F'
  },
  {
    name: 'primary-5',
    light: '#354C56',
    main: '#10212A',
    dark: '#09141A'
  }
]

export default primaryColorConfig
