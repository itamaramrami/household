import React, { useState, useEffect, useMemo } from 'react';
import { fetchTransactions } from '../../api/transactionsAPI';
import { fetchFixedPayments } from '../../api/Fixed';
import { fetchSavings } from '../../api/Saving';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ComposedChart
} from 'recharts';
import { Transaction } from '../../interfaces/TransactionModel'; // Import Transaction interface

// Interfaces
interface FixedPayment {
  _id: string;
  amount: number;
  description: string;
  date: string;
}

interface Saving {
  _id: string;
  amount: number;
  description: string;
  date: string;
}

interface AppState {
  transactions: Transaction[];
  fixedPayments: FixedPayment[];
  savings: Saving[];
}

interface CircularChartData {
  name: string;
  value: number;
  color: string;
}

// Utility Functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Custom Tooltip Component
const CustomTooltipContent = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="backdrop-blur-sm bg-white/90 px-4 py-3 rounded-xl shadow-lg border border-gray-200/50">
        <p className="font-medium text-gray-600 mb-2">{label}</p>
        {payload.map((entry, index) => {
          const value = entry.value ?? 0;
          const name = entry.name ?? 'ללא שם';
          const color = entry.color ?? '#000000';

          return (
            <p key={index} className="flex items-center gap-2 font-semibold">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span>{name}:</span>
              <span style={{ color }}>
                {formatCurrency(value)}
              </span>
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

const CircularChart: React.FC<{ transactions: Transaction[], savings: Saving[] }> = ({ transactions, savings }) => {
  const RADIAN = Math.PI / 180;

  const currentMonthData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });

    const currentMonthSavings = savings.filter(s => {
      const savingDate = new Date(s.date);
      return savingDate.getMonth() === currentMonth && savingDate.getFullYear() === currentYear;
    });

    const income = currentMonthTransactions.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum, 0);
    const expenses = currentMonthTransactions.reduce((sum, t) => t.type !== 'income' ? sum + t.amount : sum, 0);
    const savingsAmount = currentMonthSavings.reduce((sum, s) => sum + s.amount, 0);

    return {
      הכנסות: income,
      הוצאות: expenses,
      חסכונות: savingsAmount
    };
  }, [transactions, savings]);

  const chartData: CircularChartData[] = [
    { name: 'הכנסות', value: currentMonthData.הכנסות, color: '#10B981' },
    { name: 'הוצאות', value: currentMonthData.הוצאות, color: '#EF4444' },
    { name: 'חסכונות', value: currentMonthData.חסכונות, color: '#6366F1' }
  ];

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent
  }: {
    cx: number,
    cy: number,
    midAngle: number,
    innerRadius: number,
    outerRadius: number,
    percent: number
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="font-bold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
        סיכום החודש הנוכחי 
      </h2>

      <div className="flex flex-col md:flex-row items-center justify-center">
        <div className="h-[400px] md:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius="90%"
                innerRadius="50%"
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip content={CustomTooltipContent} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-7 md:mt-0 md:ml-8 md:w-1/2 flex flex-col items-center">
          {chartData.map((item, index) => (
            <div key={index} className="text-center mb-8">
              <div
                className="w-6 h-4 inline-block mr-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xl font-semibold text-gray-800">
                {item.name}: <span className="font-bold text-2xl">{formatCurrency(item.value)}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FinancialDashboard: React.FC = () => {
  const [data, setData] = useState<AppState>({
    transactions: [],
    fixedPayments: [],
    savings: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [transactions, fixedPayments, savings] = await Promise.all([
          fetchTransactions(),
          fetchFixedPayments(),
          fetchSavings()
        ]);
        setData({ transactions, fixedPayments, savings });
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="mt-6">
        <CircularChart 
          transactions={data.transactions} 
          savings={data.savings} 
        />
      </div>
    </div>
  );
};

export default FinancialDashboard;