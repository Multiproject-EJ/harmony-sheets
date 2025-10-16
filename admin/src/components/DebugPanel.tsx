import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Tooltip,
  Typography
} from '@mui/material'
import { supabase } from '../lib/supabaseClient'
import {
  getConfiguredAdminEmail,
  getNormalizedAdminEmail,
  getSupabaseCredentials
} from '../lib/runtimeConfig'

type StepStatus = 'pending' | 'success' | 'error'

type DiagnosticResult = {
  id: string
  label: string
  status: StepStatus
  durationMs?: number
  summary?: string
  details?: string
}

type BootAttempt = {
  label?: string
  url?: string
  status?: StepStatus
  startedAt?: number
  finishedAt?: number
  error?: { message?: string; stack?: string }
}

type BootState = {
  attempts?: BootAttempt[]
  errors?: Array<{ context?: string; error?: unknown }>
}

type DebugPanelProps = {
  sessionChecked: boolean
  isAdmin: boolean
  sessionError: string | null
}

const SENSITIVE_KEY_PATTERN = /token|secret|key|password|credential|bearer|authorization/i

function maskSensitiveString(value: string): string {
  const length = value.length
  if (!length) return '[empty]'
  if (length <= 8) {
    return '•'.repeat(length)
  }
  const prefix = value.slice(0, 4)
  const suffix = value.slice(-4)
  return `${prefix}…${suffix} (${length} chars)`
}

function redactSensitive(value: unknown, depth = 0): unknown {
  if (value == null) return value
  if (depth > 4) return '[depth limit reached]'

  if (typeof value === 'string') {
    if (value.length > 200) {
      return `${value.slice(0, 120)}… (${value.length - 120} more chars)`
    }
    return value
  }

  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => redactSensitive(item, depth + 1))
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === 'object') {
    const source = value as Record<string, unknown>
    const result: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(source)) {
      if (SENSITIVE_KEY_PATTERN.test(key)) {
        if (typeof entry === 'string' && entry) {
          result[key] = maskSensitiveString(entry)
        } else if (entry && typeof entry === 'object') {
          result[key] = '[redacted object]'
        } else {
          result[key] = '[redacted]'
        }
      } else {
        result[key] = redactSensitive(entry, depth + 1)
      }
    }
    return result
  }

  return value
}

function formatDuration(durationMs?: number) {
  if (!durationMs && durationMs !== 0) return '—'
  if (durationMs < 1) return `${(durationMs * 1000).toFixed(0)} µs`
  if (durationMs < 1000) return `${durationMs.toFixed(1)} ms`
  return `${(durationMs / 1000).toFixed(2)} s`
}

function stringify(value: unknown) {
  try {
    return JSON.stringify(value, null, 2)
  } catch (error) {
    return String(value)
  }
}

function getBootStateSnapshot(): BootState {
  if (typeof window === 'undefined') return {}
  const raw = (window as typeof window & { HarmonySheetsAdminBoot?: BootState }).HarmonySheetsAdminBoot
  if (!raw) return {}
  try {
    return JSON.parse(JSON.stringify(raw))
  } catch (_error) {
    return raw
  }
}

function getRuntimeEnvironment() {
  if (typeof window === 'undefined') {
    return {
      host: 'N/A',
      origin: 'N/A',
      href: 'N/A',
      referrer: 'N/A',
      userAgent: 'N/A'
    }
  }

  return {
    host: window.location.host,
    origin: window.location.origin,
    href: window.location.href,
    referrer: document.referrer || '(empty)',
    userAgent: navigator.userAgent,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language
  }
}

function useBootState() {
  const [bootState, setBootState] = useState<BootState>(() => getBootStateSnapshot())

  useEffect(() => {
    const interval = window.setInterval(() => {
      setBootState(getBootStateSnapshot())
    }, 1000)
    return () => window.clearInterval(interval)
  }, [])

  return bootState
}

export default function DebugPanel({ sessionChecked, isAdmin, sessionError }: DebugPanelProps) {
  const bootState = useBootState()
  const runtimeEnv = useMemo(() => getRuntimeEnvironment(), [])
  const { url: supabaseUrl, anonKey } = useMemo(() => getSupabaseCredentials(), [])
  const configuredAdminEmail = useMemo(() => getConfiguredAdminEmail(), [])
  const normalizedAdminEmail = useMemo(() => getNormalizedAdminEmail(), [])
  const bootErrorCount = bootState.errors?.length ?? 0

  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([])
  const [runningDiagnostics, setRunningDiagnostics] = useState(false)
  const [lastRunAt, setLastRunAt] = useState<Date | null>(null)

  const runDiagnostics = useCallback(async () => {
    const steps: Array<DiagnosticResult> = [
      { id: 'session', label: 'Retrieve current Supabase session', status: 'pending' },
      { id: 'user', label: 'Fetch authenticated user profile', status: 'pending' },
      { id: 'products', label: 'Query product table metadata', status: 'pending' }
    ]
    setDiagnostics(steps)
    setRunningDiagnostics(true)

    const results: DiagnosticResult[] = []

    const executeStep = async (
      id: string,
      label: string,
      fn: () => Promise<{ summary?: string; details?: unknown }>
    ) => {
      const startedAt = performance.now()
      try {
        const { summary, details } = await fn()
        results.push({
          id,
          label,
          status: 'success',
          durationMs: performance.now() - startedAt,
          summary,
          details: details ? stringify(redactSensitive(details)) : undefined
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        const payload = error instanceof Error ? { message, stack: error.stack } : { message }
        results.push({
          id,
          label,
          status: 'error',
          durationMs: performance.now() - startedAt,
          summary: message,
          details: stringify(redactSensitive(payload))
        })
      }
      setDiagnostics((prev) => {
        const without = prev.filter((item) => item.id !== id)
        return [...without, results[results.length - 1]].sort((a, b) => steps.findIndex((s) => s.id === a.id) - steps.findIndex((s) => s.id === b.id))
      })
    }

    await executeStep('session', 'Retrieve current Supabase session', async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      const session = data?.session
      return {
        summary: session ? 'Active session detected.' : 'No active session present.',
        details: session ? { expires_at: session.expires_at, user: session.user } : data
      }
    })

    await executeStep('user', 'Fetch authenticated user profile', async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error) throw error
      return {
        summary: data?.user ? 'User profile fetched.' : 'No authenticated user.',
        details: data
      }
    })

    await executeStep('products', 'Query product table metadata', async () => {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'estimated', head: true })
      if (error) throw error
      return {
        summary: typeof count === 'number' ? `Products table reachable (count ≈ ${count}).` : 'Products table reachable.',
        details: { count }
      }
    })

    setLastRunAt(new Date())
    setRunningDiagnostics(false)
  }, [])

  useEffect(() => {
    void runDiagnostics()
  }, [runDiagnostics])

  const adminStatus = sessionChecked
    ? isAdmin
      ? 'Authenticated as admin user.'
      : 'No admin session detected.'
    : 'Checking existing session…'

  return (
    <Paper elevation={6} sx={{ p: { xs: 3, md: 4 }, height: '100%' }}>
      <Stack spacing={3} alignItems="flex-start">
        <Stack spacing={1} width="100%">
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Admin diagnostics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review the runtime environment, bootstrap attempts, and Supabase connectivity checks to troubleshoot why the admin dashboard is not loading as expected.
          </Typography>
          <Alert severity={isAdmin ? 'success' : sessionChecked ? 'warning' : 'info'} sx={{ mt: 1 }}>
            {adminStatus}
            {sessionError ? ` Last session error: ${sessionError}` : ''}
          </Alert>
        </Stack>

        <Stack spacing={2} width="100%">
          <Typography variant="subtitle1" fontWeight={600}>
            Runtime environment
          </Typography>
          <Grid container spacing={1}>
            {Object.entries(runtimeEnv).map(([key, value]) => (
              <Grid item xs={12} sm={6} key={key}>
                <Stack spacing={0.25}>
                  <Typography variant="caption" color="text.secondary">
                    {key}
                  </Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    {String(value)}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Stack>

        <Divider flexItem />

        <Stack spacing={2} width="100%">
          <Typography variant="subtitle1" fontWeight={600}>
            Admin configuration
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Stack spacing={0.25}>
                <Typography variant="caption" color="text.secondary">
                  Supabase URL
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {supabaseUrl}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={0.25}>
                <Typography variant="caption" color="text.secondary">
                  Supabase anon key (masked)
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {maskSensitiveString(anonKey)}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={0.25}>
                <Typography variant="caption" color="text.secondary">
                  Configured admin email
                </Typography>
                <Typography variant="body2">{configuredAdminEmail ?? '(not configured)'}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={0.25}>
                <Typography variant="caption" color="text.secondary">
                  Normalized admin email
                </Typography>
                <Typography variant="body2">{normalizedAdminEmail ?? '(not configured)'}</Typography>
              </Stack>
            </Grid>
          </Grid>
        </Stack>

        <Divider flexItem />

        <Stack spacing={1.5} width="100%">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle1" fontWeight={600}>
              Bootstrap attempts
            </Typography>
            <Chip
              size="small"
              label={`${bootState.attempts?.length ?? 0} attempt${
                (bootState.attempts?.length ?? 0) === 1 ? '' : 's'
              }`}
            />
          </Stack>
          <Stack spacing={1.5} width="100%">
            {(bootState.attempts ?? []).length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No bootstrap attempts were recorded. The admin bundle may not have executed yet.
              </Typography>
            ) : (
              (bootState.attempts ?? []).map((attempt, index) => (
                <Paper key={`${attempt.label}-${attempt.url}-${index}`} variant="outlined" sx={{ p: 1.5 }}>
                  <Stack spacing={0.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" fontWeight={600}>
                        {attempt.label ?? 'Unknown module'}
                      </Typography>
                      <Chip
                        size="small"
                        color={
                          attempt.status === 'success'
                            ? 'success'
                            : attempt.status === 'error'
                            ? 'error'
                            : 'default'
                        }
                        label={attempt.status ?? 'pending'}
                      />
                    </Stack>
                    {attempt.url && (
                      <Typography variant="caption" sx={{ wordBreak: 'break-all' }} color="text.secondary">
                        {attempt.url}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      Duration: {formatDuration(
                        typeof attempt.startedAt === 'number' && typeof attempt.finishedAt === 'number'
                          ? attempt.finishedAt - attempt.startedAt
                          : undefined
                      )}
                    </Typography>
                    {attempt.error?.message && (
                      <Tooltip title={attempt.error?.stack ?? ''} placement="top-start">
                        <Alert severity="error" icon={false} sx={{ mt: 0.5 }}>
                          {attempt.error.message}
                        </Alert>
                      </Tooltip>
                    )}
                  </Stack>
                </Paper>
              ))
            )}
          </Stack>
          {bootErrorCount > 0 && (
            <Alert severity="warning">
              {bootErrorCount} error{bootErrorCount === 1 ? '' : 's'} recorded during bootstrap. Inspect
              <code>window.HarmonySheetsAdminBoot</code> in the console for full details.
            </Alert>
          )}
        </Stack>

        <Divider flexItem />

        <Stack spacing={1.5} width="100%">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle1" fontWeight={600}>
              Supabase connectivity checks
            </Typography>
            {runningDiagnostics && <CircularProgress size={16} thickness={5} />}
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <Button variant="contained" onClick={() => void runDiagnostics()} disabled={runningDiagnostics}>
              {runningDiagnostics ? 'Running diagnostics…' : 'Run diagnostics again'}
            </Button>
            <Typography variant="caption" color="text.secondary">
              {lastRunAt ? `Last run: ${lastRunAt.toLocaleString()}` : 'Diagnostics have not been run yet.'}
            </Typography>
          </Stack>
          <Stack spacing={1} width="100%">
            {diagnostics.map((result) => (
              <Paper key={result.id} variant="outlined" sx={{ p: 1.5 }}>
                <Stack spacing={0.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" fontWeight={600}>
                      {result.label}
                    </Typography>
                    <Chip
                      size="small"
                      color={
                        result.status === 'success'
                          ? 'success'
                          : result.status === 'error'
                          ? 'error'
                          : 'default'
                      }
                      label={result.status}
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Duration: {formatDuration(result.durationMs)}
                  </Typography>
                  {result.summary && (
                    <Typography variant="body2" color="text.primary">
                      {result.summary}
                    </Typography>
                  )}
                  {result.details && (
                    <Box
                      component="pre"
                      sx={{
                        bgcolor: 'grey.100',
                        borderRadius: 1,
                        p: 1,
                        fontSize: '0.75rem',
                        lineHeight: 1.4,
                        overflow: 'auto'
                      }}
                    >
                      {result.details}
                    </Box>
                  )}
                </Stack>
              </Paper>
            ))}
            {!runningDiagnostics && diagnostics.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Diagnostics not yet available.
              </Typography>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  )
}
