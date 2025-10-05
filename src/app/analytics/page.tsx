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
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import type { Offer } from "@/components/offers/offer-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { SummaryCard } from "../../components/analytics/summary-card";

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

  const totalCost = offers.reduce((acc, offer) => acc + (offer.cost ?? 0), 0);
  const totalRevenue = offers.reduce(
    (acc, offer) => acc + (offer.revenue ?? 0),
    0
  );
  const totalProfit = totalRevenue - totalCost;
  const averageRoi = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  const profitByPlatform = offers.reduce(
    (acc, offer) => {
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
    (acc, offer) => {
      const niche = offer.niche || "Sem Nicho";
      acc[niche] = (acc[niche] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const offersByNicheData = Object.entries(offersByNiche).map(
    ([name, value]) => ({ name, value })
  );

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
      <main className="container mx-auto p-4 sm:p-6">
        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
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
                      tickFormatter={(value) => `${formatCurrency(value as number)}`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
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
              <ChartContainer config={{}} className="h-[300px] w-full">
                <ResponsiveContainer>
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={offersByNicheData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="hsl(var(--primary))"
                      label
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