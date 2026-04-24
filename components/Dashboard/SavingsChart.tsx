'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
  TooltipItem,
} from 'chart.js';
import { useContract } from '@/hooks/useContract';
import { calculateTotalReturn } from '@/lib/contract';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Type for chart dataset
interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  fill: boolean;
  tension: number;
}

// Type for complete chart data
interface ChartDataType {
  labels: string[];
  datasets: ChartDataset[];
}

export default function SavingsChart() {
  const { userPosition } = useContract();
  const [chartData, setChartData] = useState<ChartDataType | null>(null);

  useEffect(() => {
    if (!userPosition || userPosition.withdrawn) {
      // Demo data for new users
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const deposits = [0.5, 0.8, 1.2, 1.5, 1.8, 2.2, 2.5, 2.9, 3.2, 3.6, 3.9, 4.3];
      const withInterest = deposits.map((d, i) => d * (1 + 0.08 * (i + 1) / 12));
      
      setChartData({
        labels: months,
        datasets: [
          {
            label: 'Total Deposited',
            data: deposits,
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.4,
          },
          {
            label: 'With Interest (Projected)',
            data: withInterest,
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.05)',
            fill: true,
            tension: 0.4,
          },
        ],
      });
    } else {
      // Generate projection based on user's actual position
      const months: string[] = [];
      const deposits: number[] = [];
      const withInterest: number[] = [];
      const startDate = new Date(userPosition.startTime * 1000);
      const endDate = new Date(userPosition.endTime * 1000);
      const totalMonths = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      
      for (let i = 0; i <= totalMonths; i++) {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + i);
        months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
        
        const progress = i / totalMonths;
        const currentAmount = userPosition.amount;
        const finalAmount = calculateTotalReturn(Number(userPosition.amount), totalMonths * 30);
        const interpolated = currentAmount + (finalAmount - currentAmount) * progress;
        
        deposits.push(currentAmount);
        withInterest.push(interpolated);
      }
      
      setChartData({
        labels: months,
        datasets: [
          {
            label: 'Principal Amount',
            data: deposits,
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Total Value (Principal + Interest)',
            data: withInterest,
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.05)',
            fill: true,
            tension: 0.4,
          },
        ],
      });
    }
  }, [userPosition]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 10,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: TooltipItem<'line'>) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            const value = context.parsed.y;
            if (value !== null && value !== undefined) {
              label += new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
              }).format(value) + ' ETH';
            }
            return label;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount (ETH)',
        },
        ticks: {
          callback: function(value: string | number) {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            return numValue.toFixed(2) + ' ETH';
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Timeline',
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  if (!chartData) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            role="status"
            aria-label="Loading chart data"
          />
          <p className="text-gray-500">Loading chart data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80">
      <Line data={chartData as ChartData<'line'>} options={options} />
    </div>
  );
}
