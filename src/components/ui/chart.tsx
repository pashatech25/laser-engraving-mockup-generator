import React from 'react';
import { cn } from '../../lib/utils';

interface ChartProps {
  data: Array<{ label: string; value: number }>;
  className?: string;
  type?: 'bar' | 'line' | 'pie';
}

export function Chart({ data, className, type = 'bar' }: ChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));

  if (type === 'bar') {
    return (
      <div className={cn("w-full h-64", className)}>
        <div className="flex items-end justify-between h-full space-x-2">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className="w-8 bg-blue-500 rounded-t"
                style={{ height: `${(item.value / maxValue) * 100}%` }}
              />
              <span className="text-xs mt-2 text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'line') {
    return (
      <div className={cn("w-full h-64", className)}>
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            points={data.map((item, index) => 
              `${(index / (data.length - 1)) * 100},${100 - (item.value / maxValue) * 100}`
            ).join(' ')}
          />
        </svg>
      </div>
    );
  }

  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    return (
      <div className={cn("w-full h-64", className)}>
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {data.map((item, index) => {
            const angle = (item.value / total) * 360;
            const x1 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
            const y1 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
            const x2 = 50 + 40 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
            const y2 = 50 + 40 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const pathData = [
              `M 50 50`,
              `L ${x1} ${y1}`,
              `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');

            currentAngle += angle;

            return (
              <path
                key={index}
                d={pathData}
                fill={`hsl(${(index * 360) / data.length}, 70%, 50%)`}
              />
            );
          })}
        </svg>
      </div>
    );
  }

  return null;
}
