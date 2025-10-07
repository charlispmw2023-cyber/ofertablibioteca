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
  Cell as RechartsPrimitiveCell, // Importando Cell com alias
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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

export default function AnalyticsPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

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
      <main className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
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
                  <BarChart data={profitByPlatformData}>
                    <XAxis
                      dataKey="platform"
                      stroke="hsl(var(--foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value: number) => `${formatCurrency(value)}`}
                    />
                    <ChartTooltip content={ChartTooltipContent} />
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
                  <BarChart data={profitByNicheData}>
                    <XAxis
                      dataKey="niche"
                      stroke="hsl(var(--foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value: number) => `${formatCurrency(value)}`}
                    />
                    <ChartTooltip content={ChartTooltipContent} />
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
                  <PieChart>
                    <ChartTooltip content={ChartTooltipContent} nameKey="name" />
                    <Pie
                      data={offersByNicheData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={30}
                      label={({ name, value }: { name: string; value: number }) => `${name} (${value})`}
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
                      content={ChartLegendContent}
                      nameKey="name"
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