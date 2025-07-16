'use client';
import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

type DoctorChartsProps = {
  regionData: { name: string; value: number }[];
  dateData: { date: string; count: number }[];
};

const COLORS = [
  '#ec4899', '#a78bfa', '#f472b6', '#fbbf24',
  '#34d399', '#60a5fa', '#f87171', '#38bdf8'
];

const DoctorCharts: React.FC<DoctorChartsProps> = ({ regionData, dateData }) => {
  // Pie chart data
  const pieData = {
    labels: regionData.map(d => d.name),
    datasets: [
      {
        data: regionData.map(d => d.value),
        backgroundColor: COLORS,
      },
    ],
  };

  // Bar chart data
  const barData = {
    labels: dateData.map(d => d.date),
    datasets: [
      {
        label: 'Assessments',
        data: dateData.map(d => d.count),
        backgroundColor: '#a78bfa',
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold mb-4 gradient-text">Results by Region</h3>
        {regionData.length > 0 ? (
          <Pie data={pieData} />
        ) : (
          <div className="text-center text-gray-400 h-64 flex items-center justify-center">No region data available</div>
        )}
      </div>
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold mb-4 gradient-text">Assessments Over Time</h3>
        {dateData.length > 0 ? (
          <Bar data={barData} />
        ) : (
          <div className="text-center text-gray-400 h-64 flex items-center justify-center">No assessment data available</div>
        )}
      </div>
    </div>
  );
};

export default DoctorCharts; 