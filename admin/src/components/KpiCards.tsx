import { Card, CardContent, Stack, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import Grid2 from '@mui/material/Grid2'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import type { Kpi } from '../lib/types'

type KpiCardsProps = {
  kpis: Kpi[]
}

export default function KpiCards({ kpis }: KpiCardsProps) {
  const theme = useTheme()
  const positiveColor = alpha(theme.palette.success.main, 0.12)
  const negativeColor = alpha(theme.palette.error.main, 0.12)
  const surfaceColor = alpha(theme.palette.primary.main, 0.08)

  return (
    <Grid2 container spacing={3} columns={{ xs: 1, md: 12 }}>
      {kpis.map((kpi) => {
        const isPositive = kpi.change >= 0
        return (
          <Grid2 key={kpi.label} size={{ xs: 12, md: 4 }}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                borderRadius: 3,
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.12),
                backgroundColor: surfaceColor,
                backdropFilter: 'blur(6px)'
              }}
            >
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="overline" color="text.secondary">
                    {kpi.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {kpi.value}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 2,
                      bgcolor: isPositive ? positiveColor : negativeColor
                    }}
                  >
                    {isPositive ? (
                      <TrendingUpIcon fontSize="small" color="success" />
                    ) : (
                      <TrendingDownIcon fontSize="small" color="error" />
                    )}
                    <Typography variant="body2" color={isPositive ? 'success.main' : 'error.main'}>
                      {isPositive ? '+' : ''}
                      {kpi.change}% vs last month
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid2>
        )
      })}
    </Grid2>
  )
}
