"use client";

import { useEffect, useMemo, useState } from "react";
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
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Cell as RechartsPrimitiveCell,
  CartesianGrid,
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
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { subDays, format, differenceInDays, startOfDay } from "date-fns";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const truncateLabel = (label: string, maxLength: number = 10) => {
  if (label.length > maxLength) {
    return `${label.substring(0, maxLength)}...`;
  }
  return label;
};

const calculatePercentageChange = (current: number, previous: number) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
};

export default function AnalyticsPage() {
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { resolvedTheme } = useTheme();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const getOffers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching offers for analytics:", error);
      } else {
        setAllOffers(
          data.map((d) => ({ ...d, created_at: new Date(d.created_at) })) || []
        );
      }
      setLoading(false);
    };
    getOffers();
  }, []);

  const {
    currentPeriodOffers,
    previousPeriodOffers,
    currentPeriodMetrics,
    previousPeriodMetrics,
    trends,
    performanceOverTimeData,
    profitByPlatformData,
    offersByNicheData,
    profitByNicheData,
    top5ProfitableOffers,
  } = useMemo(() => {
    if (!dateRange?.from) {
      return {
        currentPeriodOffers: [],
        previousPeriodOffers: [],
        currentPeriodMetrics: { revenue: 0, cost: 0, profit: 0, roi: 0 },
        previousPeriodMetrics: { revenue: 0, cost: 0, profit: 0, roi: 0 },
        trends: { revenue: 0, cost: 0, profit: 0 },
        performanceOverTimeData: [],
        profitByPlatformData: [],
        offersByNicheData: [],
        profitByNicheData: [],
        top5ProfitableOffers: [],
      };
    }

    const to = dateRange.to || dateRange.from;
    const duration = differenceInDays(to, dateRange.from);
    const prevFrom = subDays(dateRange.from, duration + 1);
    const prevTo = subDays(to, duration + 1);

    const filterOffersByDate = (offers: Offer[], from: Date, to: Date) =>
      offers.filter((offer) => {
        const offerDate = startOfDay(new Date(offer.created_at));
        return offerDate >= startOfDay(from) && offerDate <= startOfDay(to);
      });

    const currentOffers = filterOffersByDate(allOffers, dateRange.from, to);
    const previousOffers = filterOffersByDate(allOffers, prevFrom, prevTo);

    const calculateMetrics = (offers: Offer[]) => {
      const revenue = offers.reduce((acc, o) => acc + (o.revenue ?? 0), 0);
      const cost = offers.reduce((acc, o) => acc + (o.cost ?? 0), 0);
      const profit = revenue - cost;
      const roi = cost > 0 ? (profit / cost) * 100 : 0;
      return { revenue, cost, profit, roi };
    };

    const currentMetrics = calculateMetrics(currentOffers);
    const previousMetrics = calculateMetrics(previousOffers);

    const trendValues = {
      revenue: calculatePercentageChange(
        currentMetrics.revenue,
        previousMetrics.revenue
      ),
      cost: calculatePercentageChange(
        currentMetrics.cost,
        previousMetrics.cost
      ),
      profit: calculatePercentageChange(
        currentMetrics.profit,
        previousMetrics.profit
      ),
    };

    const performanceData = Array.from(
      { length: duration + 1 },
      (_, i) => subDays(to, i)
    ).map((date) => ({
      date: format(date, "dd/MM"),
      Receita: 0,
      Custo: 0,
    }));

    currentOffers.forEach((offer) => {
      const dateStr = format(new Date(offer.created_at), "dd/MM");
      const entry = performanceData.find((d) => d.date === dateStr);
      if (entry) {
        entry.Receita += offer.revenue ?? 0;
        entry.Custo += offer.cost ?? 0;
      }
    });

    const processGroupedData = (
      offers: Offer[],
      key: keyof Offer,
      aggregator: (acc: number, offer: Offer) => number
    ) => {
      const grouped = offers.reduce((acc, offer) => {
        const groupKey = (offer[key] as string) || "N/A";
        acc[groupKey] = aggregator(acc[groupKey] || 0, offer);
        return acc;
      }, {} as Record<string, number>);
      return Object.entries(grouped)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    };

    const profitAggregator = (acc: number, offer: Offer) =>
      acc + (offer.revenue ?? 0) - (offer.cost ?? 0);

    return {
      currentPeriodOffers: currentOffers,
      previousPeriodOffers: previousOffers,
      currentPeriodMetrics: currentMetrics,
      previousPeriodMetrics: previousMetrics,
      trends: trendValues,
      performanceOverTimeData: performanceData.reverse(),
      profitByPlatformData: processGroupedData(
        currentOffers,
        "platform",
        profitAggregator
      ).map((d) => ({ platform: d.name, profit: d.value })),
      offersByNicheData: processGroupedData(
        currentOffers,
        "niche",
        (acc) => acc + 1
      ),
      profitByNicheData: processGroupedData(
        currentOffers,
        "niche",
        profitAggregator
      ).map((d) => ({ niche: d.name, profit: d.value })),
      top5ProfitableOffers: [...currentOffers]
        .sort(
          (a, b) =>
            (b.revenue ?? 0) -
            (b.cost ?? 0) -
            ((a.revenue ?? 0) - (a.cost ?? 0))
        )
        .slice(0, 5),
    };
  }, [allOffers, dateRange]);

  const nicheChartConfig = useMemo(
    () =>
      offersByNicheData.reduce((acc, item, index) => {
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
    [offersByNicheData]
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
          <h1 className="text-xl font-semibold">Dashboard Analítico 4.0</h1>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Voltar
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex justify-end">
          <DateRangePicker date={dateRange} onDateChange={setDateRange} />
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Receita Total"
            value={formatCurrency(currentPeriodMetrics.revenue)}
            icon={DollarSign}
            trend={trends.revenue}
            trendLabel="vs. período anterior"
          />
          <SummaryCard
            title="Custo Total"
            value={formatCurrency(currentPeriodMetrics.cost)}
            icon={Wallet}
            trend={trends.cost}
            trendLabel="vs. período anterior"
            invertTrendColor
          />
          <SummaryCard
            title="Lucro Total"
            value={formatCurrency(currentPeriodMetrics.profit)}
            icon={BarChartIcon}
            trend={trends.profit}
            trendLabel="vs. período anterior"
          />
          <SummaryCard
            title="ROI Médio"
            value={`${currentPeriodMetrics.roi.toFixed(2)}%`}
            icon={TrendingUp}
          />
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4">
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
                  <LineChart data={performanceOverTimeData}>
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
                    <ChartTooltip
                      content={<ChartTooltipContent indicator="dot" />}
                    />
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
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-3">
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
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Ofertas Lucrativas</CardTitle>
            </CardHeader>
            <CardContent>
              <TopOffersList offers={top5ProfitableOffers} />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
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
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Nicho</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={nicheChartConfig}
                className="h-[300px] w-full"
              >
                <ResponsiveContainer>
                  <PieChart
                    margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
                  >
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