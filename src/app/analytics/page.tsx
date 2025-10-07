"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart as BarChartIcon,
  DollarSign,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Cell as RechartsPrimitiveCell,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import type { Offer } from "@/components/offers/offer-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { SummaryCard } from "../../components/analytics/summary-card";
import { TopOffersList } from "../../components/analytics/top-offers-list";
import { useTheme } from "next-themes";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

// Função para truncar rótulos longos
const truncateLabel = (label: string, maxLength: number = 10) => {
  if (label.length > maxLength) {
    return `${label.substring(0, maxLength)}...`;
  }
  return label;
};

export default function AnalyticsPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint for Tailwind CSS
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const getOffers = async () => {
      const { data, error } = await supabase.from("offers").select("*");
      if (error) {
        console.error("Error fetching offers for analytics:", error);
      } else {
        setOffers(data || []);
      }
      setLoading(false);
    };
    getOffers();
  }, []);

  // --- Calculations ---
  const totalCost = offers.reduce((acc, offer) => acc + (offer.cost ?? 0), 0);
  const totalRevenue = offers.reduce(
    (acc, offer) => acc + (offer.revenue ?? 0),
    0
  );
  const totalProfit = totalRevenue - totalCost;
  const averageRoi = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  const profitByPlatform = offers.reduce(
    (acc: Record<string, number>, offer) => {
      const platform = offer.platform || "N/A";
      const profit = (offer.revenue ?? 0) - (offer.cost ?? 0);
      acc[platform] = (acc[platform] || 0) + profit;
      return acc;
    },
    {} as Record<string, number>
  );
  const profitByPlatformData = Object.entries(profitByPlatform)
    .map(([platform, profit]) => ({ platform, profit }))
    .sort((a, b) => b.profit - a.profit);

  const offersByNiche = offers.reduce(
    (acc: Record<string, number>, offer) => {
      const niche = offer.niche || "Sem Nicho";
      acc[niche] = (acc[niche] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const offersByNicheData = Object.entries(offersByNiche).map(
    ([name, value]) => ({ name, value })
  );

  const profitByNiche = offers.reduce(
    (acc: Record<string, number>, offer) => {
      const niche = offer.niche || "Sem Nicho";
      const profit = (offer.revenue ?? 0) - (offer.cost ?? 0);
      acc[niche] = (acc[niche] || 0) + profit;
      return acc;
    },
    {} as Record<string, number>
  );
  const profitByNicheData = Object.entries(profitByNiche)
    .map(([niche, profit]) => ({ niche, profit }))
    .sort((a, b) => b.profit - a.profit);

  const top5ProfitableOffers = [...offers]
    .sort(
      (a, b) =>
        (b.revenue ?? 0) - (b.cost ?? 0) - ((a.revenue ?? 0) - (a.cost ?? 0))
    )
    .slice(0, 5);

  // Chart config for Niche Distribution
  const nicheChartConfig = offersByNicheData.reduce((acc, item, index) => {
    const colors = [
      "hsl(var(--primary))",
      "hsl(var(--secondary))",
      "hsl(var(--accent))",
      "hsl(var(--muted))",
      "hsl(var(--destructive))",
      "#8884d8", // Exemplo de cor adicional
      "#82ca9d", // Exemplo de cor adicional
    ];
    acc[item.name] = {
      label: item.name,
      color: colors[index % colors.length],
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

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
    const radius = outerRadius + 15; // Reduced distance
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const textAnchor = x > cx ? "start" : "end";

    if (percent < 0.05) {
      return null;
    }

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Carregando análises...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-semibold">Dashboard Analítico</h1>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Voltar para Ofertas
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 grid gap-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Receita Total"
            value={formatCurrency(totalRevenue)}
            icon={DollarSign}
          />
          <SummaryCard
            title="Custo Total"
            value={formatCurrency(totalCost)}
            icon={Wallet}
          />
          <SummaryCard
            title="Lucro Total"
            value={formatCurrency(totalProfit)}
            icon={BarChartIcon}
          />
          <SummaryCard
            title="ROI Médio"
            value={`${averageRoi.toFixed(2)}%`}
            icon={TrendingUp}
          />
        </div>

        <div className="mb-6 grid gap-2 sm:gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Lucro por Plataforma</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px] w-full">
                <ResponsiveContainer>
                  <BarChart
                    data={profitByPlatformData}
                    margin={{ left: -24, right: 4 }}
                  >
                    <XAxis
                      dataKey="platform"
                      stroke="hsl(var(--foreground))"
                      fontSize={isMobile ? 10 : 12}
                      tickLine={false}
                      axisLine={false}
                      angle={isMobile ? -45 : 0}
                      textAnchor={isMobile ? "end" : "middle"}
                      interval={0}
                      tickFormatter={(value: string) => truncateLabel(value, isMobile ? 7 : 10)}
                      height={isMobile ? 60 : 30}
                    />
                    <YAxis
                      stroke="hsl(var(--foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value: number) => `${formatCurrency(value)}`}
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
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Ofertas Lucrativas</CardTitle>
            </CardHeader>
            <CardContent>
              <TopOffersList offers={top5ProfitableOffers} />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-2 sm:gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Lucro por Nicho</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px] w-full">
                <ResponsiveContainer>
                  <BarChart
                    data={profitByNicheData}
                    margin={{ left: -24, right: 4 }}
                  >
                    <XAxis
                      dataKey="niche"
                      stroke="hsl(var(--foreground))"
                      fontSize={isMobile ? 10 : 12}
                      tickLine={false}
                      axisLine={false}
                      angle={isMobile ? -45 : 0}
                      textAnchor={isMobile ? "end" : "middle"}
                      interval={0}
                      tickFormatter={(value: string) => truncateLabel(value, isMobile ? 7 : 10)}
                      height={isMobile ? 60 : 30}
                    />
                    <YAxis
                      stroke="hsl(var(--foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value: number) => `${formatCurrency(value)}`}
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
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Nicho</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={nicheChartConfig} className="h-[300px] w-full">
                <ResponsiveContainer>
                  <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                    <ChartTooltip
                      content={<ChartTooltipContent nameKey="name" />}
                    />
                    <Pie
                      data={offersByNicheData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      innerRadius={30}
                      label={renderCustomizedPieLabel}
                      labelLine={false}
                    >
                      {offersByNicheData.map((entry, index) => (
                        <RechartsPrimitiveCell
                          key={`cell-${index}`}
                          fill={nicheChartConfig[entry.name]?.color || "gray"}
                        />
                      ))}
                    </Pie>
                    <ChartLegend
                      content={<ChartLegendContent nameKey="name" />}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}