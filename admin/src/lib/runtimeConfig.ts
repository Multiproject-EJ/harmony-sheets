import type { User } from '@supabase/supabase-js'

const FALLBACK_URL = 'https://jvjmmzbibpnlzhzzyncx.supabase.co'
const FALLBACK_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2am1temJpYnBubHpoenp5bmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjYyMzksImV4cCI6MjA3NjEwMjIzOX0.JyaY7kJbbZKKBCj_UX6M-t-eKoK9WJibcJjlLZnSvWA'

const ADMIN_KEYWORDS = new Set(['admin', 'administrator', 'owner', 'superuser'])

type MaybeString = string | null | undefined

type UnknownRecord = Record<string | number, unknown>

function firstString(...values: MaybeString[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed) {
        return trimmed
      }
    }
  }
  return undefined
}

function safeGet(source: unknown, ...path: Array<string | number>): unknown {
  return path.reduce<unknown>((value, key) => {
    if (value && typeof value === 'object' && key in (value as UnknownRecord)) {
      return (value as UnknownRecord)[key]
    }
    return undefined
  }, source)
}

function readFromMeta(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  const content = element?.content
  return typeof content === 'string' && content.trim() ? content.trim() : undefined
}

function readEnvVariable(name: string): string | undefined {
  const fromImportMeta = typeof import.meta !== 'undefined' ? (import.meta.env as Record<string, string | undefined>)[name] : undefined
  const fromProcess =
    typeof process !== 'undefined' && process?.env ? (process.env as Record<string, string | undefined>)[name] : undefined
  const fromGlobal = safeGet(globalThis, 'process', 'env', name) as MaybeString

  return firstString(fromImportMeta, fromProcess, fromGlobal)
}

const globalConfig =
  (safeGet(globalThis, 'HarmonySheetsSupabase') as UnknownRecord | undefined) ??
  (safeGet(globalThis, 'harmonySheetsSupabase') as UnknownRecord | undefined) ??
  (safeGet(globalThis, 'SUPABASE_CONFIG') as UnknownRecord | undefined) ??
  (safeGet(globalThis, 'env') as UnknownRecord | undefined) ??
  (safeGet(globalThis, '__env') as UnknownRecord | undefined) ??
  {}

const resolvedSupabaseUrl =
  firstString(
    safeGet(globalThis, 'SUPABASE_URL') as MaybeString,
    safeGet(globalThis, 'Supabase', 'url') as MaybeString,
    safeGet(globalThis, 'HarmonySheetsSupabase', 'url') as MaybeString,
    safeGet(globalThis, '__SUPABASE__', 'url') as MaybeString,
    safeGet(globalConfig, 'SUPABASE_URL') as MaybeString,
    safeGet(globalConfig, 'supabaseUrl') as MaybeString,
    readEnvVariable('SUPABASE_URL'),
    readEnvVariable('VITE_SUPABASE_URL'),
    readEnvVariable('PUBLIC_SUPABASE_URL'),
    readFromMeta('supabase-url'),
    readFromMeta('harmony-sheets-supabase-url')
  ) ?? FALLBACK_URL

const resolvedSupabaseAnonKey =
  firstString(
    safeGet(globalThis, 'SUPABASE_ANON_KEY') as MaybeString,
    safeGet(globalThis, 'Supabase', 'anonKey') as MaybeString,
    safeGet(globalThis, 'HarmonySheetsSupabase', 'anonKey') as MaybeString,
    safeGet(globalThis, '__SUPABASE__', 'anonKey') as MaybeString,
    safeGet(globalConfig, 'SUPABASE_ANON_KEY') as MaybeString,
    safeGet(globalConfig, 'supabaseAnonKey') as MaybeString,
    readEnvVariable('SUPABASE_ANON_KEY'),
    readEnvVariable('VITE_SUPABASE_ANON_KEY'),
    readEnvVariable('PUBLIC_SUPABASE_ANON_KEY'),
    readFromMeta('supabase-anon-key'),
    readFromMeta('harmony-sheets-supabase-anon-key')
  ) ?? FALLBACK_ANON_KEY

const configuredAdminEmail = firstString(
  safeGet(globalThis, 'SUPABASE_ADMIN_EMAIL') as MaybeString,
  safeGet(globalThis, 'HarmonySheetsSupabase', 'adminEmail') as MaybeString,
  safeGet(globalConfig, 'SUPABASE_ADMIN_EMAIL') as MaybeString,
  safeGet(globalConfig, 'adminEmail') as MaybeString,
  readEnvVariable('SUPABASE_ADMIN_EMAIL'),
  readEnvVariable('VITE_SUPABASE_ADMIN_EMAIL'),
  readEnvVariable('PUBLIC_SUPABASE_ADMIN_EMAIL'),
  readFromMeta('supabase-admin-email'),
  readFromMeta('harmony-sheets-supabase-admin-email')
)

function normalizeEmail(value: MaybeString): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

const normalizedAdminEmail = normalizeEmail(configuredAdminEmail)

function getNestedValue(source: unknown, path: Array<string | number>): unknown {
  return path.reduce<unknown>((value, key) => {
    if (value && typeof value === 'object' && key in (value as UnknownRecord)) {
      return (value as UnknownRecord)[key]
    }
    return undefined
  }, source)
}

function isTruthyFlag(value: unknown): boolean {
  if (value === true) return true
  if (typeof value === 'number') {
    return Number.isFinite(value) && value !== 0
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (!normalized) return false
    return ['true', '1', 'yes', 'y', 'on', 'enabled', 'admin', 'owner'].includes(normalized)
  }
  return false
}

function containsAdminKeyword(value: unknown): boolean {
  if (!value) return false
  if (Array.isArray(value)) {
    return value.some(containsAdminKeyword)
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized ? ADMIN_KEYWORDS.has(normalized) : false
  }
  if (typeof value === 'object') {
    return Object.values(value as UnknownRecord).some(containsAdminKeyword)
  }
  return false
}

export function getSupabaseCredentials() {
  return { url: resolvedSupabaseUrl, anonKey: resolvedSupabaseAnonKey }
}

export function getConfiguredAdminEmail() {
  return configuredAdminEmail ?? null
}

export function getNormalizedAdminEmail() {
  return normalizedAdminEmail || null
}

type SupabaseUserLike = Pick<User, 'email' | 'app_metadata' | 'user_metadata' | 'role'>

export function isAdminUser(user: SupabaseUserLike | null | undefined) {
  if (!user || typeof user !== 'object') return false

  const userEmail = normalizeEmail(user.email as MaybeString)
  if (normalizedAdminEmail && userEmail && userEmail === normalizedAdminEmail) {
    return true
  }

  if (normalizedAdminEmail) {
    const metaEmailSources = [
      getNestedValue(user, ['user_metadata', 'adminEmail']),
      getNestedValue(user, ['user_metadata', 'admin_email']),
      getNestedValue(user, ['user_metadata', 'email']),
      getNestedValue(user, ['app_metadata', 'adminEmail']),
      getNestedValue(user, ['app_metadata', 'admin_email'])
    ]

    for (const candidate of metaEmailSources) {
      if (normalizeEmail(candidate as MaybeString) === normalizedAdminEmail) {
        return true
      }
    }

    const emailCollections = [
      getNestedValue(user, ['user_metadata', 'adminEmails']),
      getNestedValue(user, ['user_metadata', 'admin_emails']),
      getNestedValue(user, ['app_metadata', 'adminEmails']),
      getNestedValue(user, ['app_metadata', 'admin_emails'])
    ]

    for (const collection of emailCollections) {
      if (!collection) continue
      if (Array.isArray(collection)) {
        if (collection.some((value) => normalizeEmail(value as MaybeString) === normalizedAdminEmail)) {
          return true
        }
      } else if (typeof collection === 'string') {
        const candidates = collection
          .split(/[\s,;]+/)
          .map((value) => normalizeEmail(value))
          .filter(Boolean)
        if (candidates.includes(normalizedAdminEmail)) {
          return true
        }
      }
    }
  }

  if (typeof user.role === 'string' && user.role.trim().toLowerCase() === 'admin') {
    return true
  }

  const roleCollections = [
    getNestedValue(user, ['app_metadata', 'roles']),
    getNestedValue(user, ['user_metadata', 'roles'])
  ]

  for (const roles of roleCollections) {
    if (Array.isArray(roles)) {
      if (roles.some((role) => typeof role === 'string' && role.trim().toLowerCase() === 'admin')) {
        return true
      }
    } else if (typeof roles === 'string') {
      if (roles.trim().toLowerCase() === 'admin') {
        return true
      }
    }
  }

  const singleRole = firstString(
    getNestedValue(user, ['app_metadata', 'role']) as MaybeString,
    getNestedValue(user, ['user_metadata', 'role']) as MaybeString
  )
  if (singleRole && singleRole.trim().toLowerCase() === 'admin') {
    return true
  }

  const adminFlagPaths: Array<Array<string | number>> = [
    ['app_metadata', 'is_admin'],
    ['user_metadata', 'is_admin'],
    ['app_metadata', 'admin'],
    ['user_metadata', 'admin'],
    ['app_metadata', 'isAdmin'],
    ['user_metadata', 'isAdmin'],
    ['app_metadata', 'adminUser'],
    ['user_metadata', 'adminUser'],
    ['app_metadata', 'admin_user'],
    ['user_metadata', 'admin_user'],
    ['app_metadata', 'is_owner'],
    ['user_metadata', 'is_owner'],
    ['app_metadata', 'owner'],
    ['user_metadata', 'owner'],
    ['app_metadata', 'claims', 'admin'],
    ['user_metadata', 'claims', 'admin'],
    ['app_metadata', 'claims_admin'],
    ['user_metadata', 'claims_admin'],
    ['app_metadata', 'permissions'],
    ['user_metadata', 'permissions'],
    ['app_metadata', 'features'],
    ['user_metadata', 'features'],
    ['app_metadata', 'flags'],
    ['user_metadata', 'flags']
  ]

  for (const path of adminFlagPaths) {
    const value = getNestedValue(user, path)
    if (isTruthyFlag(value) || containsAdminKeyword(value)) {
      return true
    }
  }

  return false
}
