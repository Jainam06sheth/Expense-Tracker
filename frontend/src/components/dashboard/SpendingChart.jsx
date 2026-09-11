import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '../../utils/currencyFormatter';
import { Tabs } from '../common/Tabs';

const CATEGORY_COLORS = {
  Food: '#3b82f6',
  Travel: '#10b981',
  Hostel: '#8b5cf6',
  Bills: '#f59e0b',
  Entertainment: '#ec4899',
  Shopping: '#06b6d4',
  College: '#6366f1',
  Other: '#64748b',
};

export const SpendingChart = ({ monthlyData = [], categoryData = [] }) => {
  const [chartView, setChartView] = useState('monthly');

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg text-xs font-medium border border-slate-700">
          <p className="font-bold text-slate-300">{label || payload[0]?.name}</p>
          <p className="text-blue-400 font-extrabold mt-0.5">
            {formatCurrency(payload[0]?.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Spending Analytics</h3>
          <p className="text-xs text-slate-500">
            {chartView === 'monthly'
              ? 'Monthly expense trajectory'
              : 'Distribution across expense categories'}
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <Tabs
            tabs={[
              { id: 'monthly', label: 'Monthly' },
              { id: 'category', label: 'By Category' },
            ]}
            activeTab={chartView}
            onChange={setChartView}
          />
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        {chartView === 'monthly' ? (
          monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="amount"
                  fill="#2563eb"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No monthly spending recorded
            </div>
          )
        ) : categoryData.length > 0 ? (
          <div className="h-full flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="h-48 sm:h-full w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {categoryData.map((entry) => (
                      <Cell
                        key={entry.category}
                        fill={CATEGORY_COLORS[entry.category] || '#64748b'}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full sm:w-1/2 grid grid-cols-2 gap-2 text-xs">
              {categoryData.map((item) => (
                <div key={item.category} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: CATEGORY_COLORS[item.category] || '#64748b',
                    }}
                  />
                  <span className="text-slate-600 truncate">{item.category}</span>
                  <span className="font-bold text-slate-900 ml-auto">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No category spending recorded
          </div>
        )}
      </div>
    </div>
  );
};
