import { useMemo } from "react";
import { DateRange } from "react-day-picker";
import { subDays, differenceInDays, startOfDay, format } from "date-fns";
import type { Offer } from "@/components/offers/offer-card";

const calculatePercentageChange = (current: number, previous: number) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
};

export const useAnalyticsData = (
  allOffers: Offer[],
  dateRange: DateRange | undefined,
  selectedPlatform: string | null,
  selectedNiche: string | null
) => {
  return useMemo(() => {
    const baseReturn = {
      currentPeriodMetrics: { revenue: 0, cost: 0, profit: 0, roi: 0 },
      trends: { revenue: 0, cost: 0, profit: 0 },
      performanceOverTimeData: [],
      profitByPlatformData: [],
      offersByNicheData: [],
      profitByNicheData: [],
    };

    if (!dateRange?.from) {
      return baseReturn;
    }

    const from = dateRange.from;
    const to = dateRange.to || from;
    const duration = differenceInDays(to, from);
    const prevFrom = subDays(from, duration + 1);
    const prevTo = subDays(to, duration + 1);

    const filterOffersByDate = (offers: Offer[], fromDate: Date, toDate: Date) =>
      offers.filter((offer) => {
        const offerDate = startOfDay(new Date(offer.created_at));
        return offerDate >= startOfDay(fromDate) && offerDate <= startOfDay(toDate);
      });

    let currentOffers = filterOffersByDate(allOffers, from, to);
    const previousOffers = filterOffersByDate(allOffers, prevFrom, prevTo);

    // Apply interactive filters
    if (selectedPlatform) {
      currentOffers = currentOffers.filter(
        (o) => o.platform === selectedPlatform
      );
    }
    if (selectedNiche) {
      currentOffers = currentOffers.filter((o) => o.niche === selectedNiche);
    }

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
      const fullPeriodOffers = filterOffersByDate(allOffers, from, to);
      const grouped = fullPeriodOffers.reduce((acc, offer) => {
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
      currentPeriodMetrics: currentMetrics,
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
    };
  }, [allOffers, dateRange, selectedPlatform, selectedNiche]);
};