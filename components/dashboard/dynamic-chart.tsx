'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { RatingDistribution } from '../../lib/types';

export default function DynamicChart({ data }: { data: RatingDistribution[] }) {
  const sortedData = [...data].sort((a, b) => a.rating - b.rating);

  const getColor = (rating: number) => {
    switch (rating) {
      case 5: return '#10b981';
      case 4: return '#8b5cf6';
      case 3: return '#f59e0b';
      case 2: return '#f97316';
      case 1: return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="rating" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {sortedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.rating)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}