/*
 * We recommend using the merged theme if you want to override our core theme.
 * This means you can use our core theme and override it with your own customizations.
 * Write your overrides in the userTheme object in this file.
 * The userTheme object is merged with the coreTheme object within this file.
 * Export this file and import it in the `@components/theme/index.tsx` file to use the merged theme.
 */

// MUI Imports
import { deepmerge } from '@mui/utils'
import type { Theme, ThemeOptions } from '@mui/material/styles'

// Type Imports
import type { Settings } from '@core/contexts/settingsContext'
import type { SystemMode } from '@core/types'

// Core Theme Imports
import coreTheme from '@core/theme'

const mergedTheme = (settings: Settings, mode: SystemMode, direction: Theme['direction']) => {
  // Vars
  const userTheme: ThemeOptions = {
    colorSchemes: {
      light: {
        palette: {
          background: { default: '#F4F7FA', paper: '#FFFFFF' },
          text: { primary: '#203346', secondary: '#5E7083' },
          divider: '#E5EBF0',
          action: { hover: '#F3F7F9', selected: '#EAF5F3' }
        }
      }
    },
    shape: { borderRadius: 10 },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            border: '1px solid var(--mui-palette-divider)',
            boxShadow: 'none',
            backgroundImage: 'none'
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: { fontWeight: 600, boxShadow: 'none' },
          contained: { '&:hover': { boxShadow: 'none' } }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          head: { backgroundColor: 'var(--mui-palette-action-hover)', fontSize: '0.75rem', fontWeight: 600 },
          root: { borderColor: 'var(--mui-palette-divider)' }
        }
      }
    }
  }

  return deepmerge(coreTheme(settings, mode, direction), userTheme)
}

export default mergedTheme
