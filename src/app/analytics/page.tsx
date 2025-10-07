"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";

import { supabase } from "@/integrations/supabase/client";
import type { Offer } from "@/components/offers/offer-card";
import { useAnalyticsData } from "@/hooks/use-analytics-data";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { TopOffersList } from "@/components/analytics/top-offers-list";
import { SummaryCardsGrid } from "@/components/analytics/SummaryCardsGrid";
import { PerformanceOverTimeChart } from "@/components/analytics/PerformanceOverTimeChart";
import { ProfitByPlatformChart } from "@/components/analytics/ProfitByPlatformChart";
import { ProfitByNicheChart } from "@/components/analytics/ProfitByNicheChart";
import { NicheDistributionPieChart } from "@/components/analytics/NicheDistributionPieChart";

export default function AnalyticsPage() {
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
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
    currentPeriodMetrics,
    trends,
    performanceOverTimeData,
    profitByPlatformData,
    offersByNicheData,
    profitByNicheData,
    top5ProfitableOffers,
  } = useAnalyticsData(allOffers, dateRange);

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

        <SummaryCardsGrid metrics={currentPeriodMetrics} trends={trends} />

        <div className="mb-6 grid grid-cols-1 gap-4">
          <PerformanceOverTimeChart data={performanceOverTimeData} />
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <ProfitByPlatformChart data={profitByPlatformData} isMobile={isMobile} />
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
          <ProfitByNicheChart data={profitByNicheData} isMobile={isMobile} />
          <NicheDistributionPieChart data={offersByNicheData} />
        </div>
      </main>
    </div>
  );
}