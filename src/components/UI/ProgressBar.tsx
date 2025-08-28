import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
  color?: 'indigo' | 'green' | 'amber' | 'red';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  max = 100, 
  label, 
  showPercentage = true,
  className = '',
  color = 'indigo'
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colorClasses = {
    indigo: 'bg-indigo-600',
    green: 'bg-green-600',
    amber: 'bg-amber-600',
    red: 'bg-red-600',
  };

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
          <span>{label}</span>
          {showPercentage && <span>{percentage.toFixed(0)}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;