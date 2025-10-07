import { useMemo } from "react";
import { PieChart, Pie, ResponsiveContainer, Cell } from "recharts";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { truncateLabel } from "@/lib/analytics-utils";

interface NicheDistributionPieChartProps {
  data: { name: string; value: number }[];
  selectedNiche: string | null;
  onNicheSelect: (niche: string | null) => void;
}

export function NicheDistributionPieChart({
  data,
  selectedNiche,
  onNicheSelect,
}: NicheDistributionPieChartProps) {
  const { resolvedTheme } = useTheme();

  const handlePieClick = (payload: any) => {
    if (payload && payload.name) {
      onNicheSelect(payload.name === selectedNiche ? null : payload.name);
    }
  };

  const chartConfig = useMemo(
    () =>
      data.reduce((acc, item, index) => {
        const colors = [
          "hsl(var(--primary))",
          "hsl(var(--secondary))",
          "hsl(var(--accent))",
          "hsl(var(--muted))",
          "hsl(var(--destructive))",
          "#8884d8",
          "#82ca9d",
        ];
        acc[item.name] = {
          label: item.name,
          color: colors[index % colors.length],
        };
        return acc;
      }, {} as Record<string, { label: string; color: string }>),
    [data]
  );

  const renderCustomizedPieLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    name,
    value,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 15;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const textAnchor = x > cx ? "start" : "end";
    if (percent < 0.05) return null;
    return (
      <text
        x={x}
        y={y}
        fill={resolvedTheme === "dark" ? "#f9fafb" : "#111827"}
        textAnchor={textAnchor}
        dominantBaseline="central"
        className="text-xs"
      >
        {`${truncateLabel(name, 12)} (${value})`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Nicho</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer>
            <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                innerRadius={30}
                label={renderCustomizedPieLabel}
                labelLine={false}
                onClick={handlePieClick}
                className="cursor-pointer"
              >
                {data.map((entry) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={chartConfig[entry.name]?.color || "gray"}
                    opacity={
                      !selectedNiche || selectedNiche === entry.name ? 1 : 0.3
                    }
                  />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}