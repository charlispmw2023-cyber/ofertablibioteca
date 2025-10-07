import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { formatCurrency, truncateLabel } from "@/lib/analytics-utils";

interface ProfitByPlatformChartProps {
  data: { platform: string; profit: number }[];
  isMobile: boolean;
}

export function ProfitByPlatformChart({
  data,
  isMobile,
}: ProfitByPlatformChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lucro por Plataforma</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[300px] w-full">
          <ResponsiveContainer>
            <BarChart data={data} margin={{ left: -24, right: 4 }}>
              <XAxis
                dataKey="platform"
                stroke="hsl(var(--foreground))"
                fontSize={isMobile ? 10 : 12}
                tickLine={false}
                axisLine={false}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? "end" : "middle"}
                interval={0}
                tickFormatter={(value) => truncateLabel(value, isMobile ? 7 : 10)}
                height={isMobile ? 60 : 30}
              />
              <YAxis
                stroke="hsl(var(--foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value as number)}
              />
              <ChartTooltip />
              <Bar
                dataKey="profit"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}