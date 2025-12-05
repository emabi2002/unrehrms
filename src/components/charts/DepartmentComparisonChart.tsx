'use client'

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface DepartmentData {
  name: string
  employees: number
  avgSalary: number
}

interface DepartmentComparisonChartProps {
  data: DepartmentData[]
}

export default function DepartmentComparisonChart({ data }: DepartmentComparisonChartProps) {
  const chartData = {
    labels: data.map(d => d.name),
    datasets: [
      {
        label: 'Number of Employees',
        data: data.map(d => d.employees),
        backgroundColor: 'rgba(0, 135, 81, 0.8)', // PNG Green
        borderColor: 'rgba(0, 135, 81, 1)',
        borderWidth: 2,
        borderRadius: 6,
        yAxisID: 'y',
      },
      {
        label: 'Average Salary (K)',
        data: data.map(d => d.avgSalary / 1000),
        backgroundColor: 'rgba(59, 130, 246, 0.8)', // Blue
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 6,
        yAxisID: 'y1',
      },
    ],
  }

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Number of Employees',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Avg Salary (K)',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10,
          },
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          usePointStyle: true,
          pointStyle: 'circle',
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
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            if (context.parsed.y !== null) {
              if (context.datasetIndex === 1) {
                label += 'K' + context.parsed.y.toFixed(1) + 'k'
              } else {
                label += context.parsed.y
              }
            }
            return label
          }
        }
      },
    },
  }

  return (
    <div className="h-[400px]">
      <Bar data={chartData} options={options} />
    </div>
  )
}
