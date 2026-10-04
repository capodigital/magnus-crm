import 'server-only'

import { randomBytes } from 'node:crypto'

export const EMBEDDED_SIGNUP_STATE_COOKIE = 'magnus_meta_embedded_signup_state'
export const EMBEDDED_SIGNUP_STATE_MAX_AGE = 10 * 60

export const createEmbeddedSignupState = () => randomBytes(32).toString('base64url')
