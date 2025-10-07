import {
  BarChart as BarChartIcon,
  DollarSign,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { SummaryCard } from "./summary-card";
import { formatCurrency } from "@/lib/analytics-utils";

interface SummaryCardsGridProps {
  metrics: {
    revenue: number;
    cost: number;
    profit: number;
    roi: number;
  };
  trends: {
    revenue: number;
    cost: number;
    profit: number;
  };
}

export function SummaryCardsGrid({ metrics, trends }: SummaryCardsGridProps) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        title="Receita Total"
        value={formatCurrency(metrics.revenue)}
        icon={DollarSign}
        trend={trends.revenue}
        trendLabel="vs. período anterior"
      />
      <SummaryCard
        title="Custo Total"
        value={formatCurrency(metrics.cost)}
        icon={Wallet}
        trend={trends.cost}
        trendLabel="vs. período anterior"
        invertTrendColor
      />
      <SummaryCard
        title="Lucro Total"
        value={formatCurrency(metrics.profit)}
        icon={BarChartIcon}
        trend={trends.profit}
        trendLabel="vs. período anterior"
      />
      <SummaryCard
        title="ROI Médio"
        value={`${metrics.roi.toFixed(2)}%`}
        icon={TrendingUp}
      />
    </div>
  );
}