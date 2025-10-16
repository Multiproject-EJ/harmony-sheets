import { Card, CardContent, Stack, Typography } from '@mui/material'
import Grid2 from '@mui/material/Grid2'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import type { Kpi } from '../lib/types'

type KpiCardsProps = {
  kpis: Kpi[]
}

export default function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <Grid2 container spacing={3} columns={{ xs: 1, md: 12 }}>
      {kpis.map((kpi) => {
        const isPositive = kpi.change >= 0
        return (
          <Grid2 key={kpi.label} size={{ xs: 12, md: 4 }}>
            <Card elevation={2}>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="overline" color="text.secondary">
                    {kpi.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {kpi.value}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
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
