import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendIndicator } from "./trend-indicator";

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  invertTrendColor?: boolean;
}

export function SummaryCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  invertTrendColor = false,
}: SummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend !== undefined && trendLabel && (
          <TrendIndicator
            value={trend}
            label={trendLabel}
            invertColor={invertTrendColor}
          />
        )}
      </CardContent>
    </Card>
  );
}