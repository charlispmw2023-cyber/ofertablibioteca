import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/analytics-utils";

interface PerformanceOverTimeChartProps {
  data: { date: string; Receita: number; Custo: number }[];
}

export function PerformanceOverTimeChart({
  data,
}: PerformanceOverTimeChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Desempenho ao Longo do Tempo</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            Receita: { label: "Receita", color: "hsl(var(--primary))" },
            Custo: { label: "Custo", color: "hsl(var(--destructive))" },
          }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                tickFormatter={(value) => formatCurrency(value as number)}
              />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              <ChartLegend />
              <Line
                dataKey="Receita"
                type="monotone"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="Custo"
                type="monotone"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}