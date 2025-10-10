import { useEffect, useRef } from 'react'
import { Card, CardContent, Typography } from '@mui/material'
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

  useEffect(() => {
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
            borderColor: '#6054d0',
            backgroundColor: 'rgba(96, 84, 208, 0.2)',
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
  }, [data])

  return (
    <Card elevation={2}>
      <CardContent sx={{ height: 360 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Monthly revenue
        </Typography>
        <canvas ref={canvasRef} />
      </CardContent>
    </Card>
  )
}
