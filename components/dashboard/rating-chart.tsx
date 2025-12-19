'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { RatingDistribution } from '../../lib/types';

interface RatingChartProps {
  data: RatingDistribution[];
}

export function RatingChart({ data }: RatingChartProps) {
  // Sort by rating
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Rating Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="rating" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.rating)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center space-x-4 mt-4">
          {sortedData.map((item) => (
            <div key={item.rating} className="flex flex-col items-center">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-lg ${i < item.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-600 mt-1">{item.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}