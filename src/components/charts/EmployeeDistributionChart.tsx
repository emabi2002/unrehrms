'use client'

import { Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface EmployeeDistributionChartProps {
  academic: number
  administrative: number
  technical: number
}

export default function EmployeeDistributionChart({
  academic,
  administrative,
  technical
}: EmployeeDistributionChartProps) {
  const data = {
    labels: ['Academic Staff', 'Administrative Staff', 'Technical Staff'],
    datasets: [
      {
        label: 'Employees',
        data: [academic, administrative, technical],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)', // Blue
          'rgba(168, 85, 247, 0.8)', // Purple
          'rgba(251, 146, 60, 0.8)', // Orange
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(251, 146, 60, 1)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function(context) {
            const label = context.label || ''
            const value = context.parsed || 0
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${value} (${percentage}%)`
          }
        }
      },
    },
  }

  return (
    <div className="h-[300px]">
      <Pie data={data} options={options} />
    </div>
  )
}
