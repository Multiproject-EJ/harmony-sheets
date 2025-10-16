import { useEffect, useRef } from 'react'
import { Card, CardContent, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend
} from 'chart.js'
import type { Sale } from '../lib/types'

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, Legend)

interface SalesChartProps {
  data: Sale[]
}

export default function SalesChart({ data }: SalesChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart<'line'> | null>(null)
  const theme = useTheme()
  const chartBackground = alpha(theme.palette.background.paper, 0.64)
  const borderColor = alpha(theme.palette.primary.main, 0.16)

  useEffect(() => {
    const primaryColor = theme.palette.primary.main
    const primaryFill = alpha(primaryColor, 0.2)

    if (!canvasRef.current) return

    if (chartRef.current) {
      chartRef.current.destroy()
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: data.map((sale) => sale.date),
        datasets: [
          {
            label: 'Revenue',
            data: data.map((sale) => sale.amount),
            borderColor: primaryColor,
            backgroundColor: primaryFill,
            tension: 0.4,
            fill: true,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            ticks: {
              callback: (value) => `$${value as number}`
            }
          }
        }
      }
    })

    return () => {
      chartRef.current?.destroy()
    }
  }, [data, theme])

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor,
        backgroundColor: chartBackground,
        backdropFilter: 'blur(6px)'
      }}
    >
      <CardContent sx={{ height: 360 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Monthly revenue
        </Typography>
        <canvas ref={canvasRef} />
      </CardContent>
    </Card>
  )
}
