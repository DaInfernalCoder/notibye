/**
 * Stats Card Component
 * 
 * Displays a single statistic with icon, value, and description.
 * Used on the dashboard to show key metrics.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { useDebug } from '@/hooks/useDebug';

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  iconColor = 'text-muted-foreground',
  trend 
}: StatsCardProps) => {
  const debug = useDebug({ component: 'StatsCard' });

  // Format large numbers for better readability
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toString();
    }
    return val;
  };

  debug.log('Rendering stats card', { title, value, description });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold">{formatValue(value)}</div>
          {trend && (
            <div className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};