import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  onClick 
}) => {
  return (
    <div 
      className={`
        bg-white rounded-lg p-6 shadow-sm border border-gray-200 transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">dari bulan lalu</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;