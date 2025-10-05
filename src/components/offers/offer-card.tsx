"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { OfferActions } from "./offer-actions";

export type Offer = {
  id: string;
  name: string;
  image_url: string;
  platform: string;
  niche?: string | null;
  cost?: number | null;
  revenue?: number | null;
  scale_status?: string | null;
  created_at: string;
  sales_page_link?: string;
  checkout_link?: string;
  upsell_1_link?: string;
  upsell_2_link?: string;
  upsell_3_link?: string;
  thank_you_page_link?: string;
  drive_link?: string;
};

interface OfferCardProps {
  offer: Offer;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const getScaleBadgeClass = (status: string) => {
  switch (status) {
    case "Inicio":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "Pré escala":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "Escalando":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    case "ESCALADISSIMA":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 font-bold";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
};

export function OfferCard({ offer }: OfferCardProps) {
  const cost = offer.cost ?? 0;
  const revenue = offer.revenue ?? 0;
  const profit = revenue - cost;
  const roi = cost > 0 ? (profit / cost) * 100 : 0;

  const hasFinancials = offer.cost != null || offer.revenue != null;

  return (
    <Card className="flex flex-col overflow-hidden border-border">
      <CardHeader className="p-0">
        <div className="relative h-40 w-full">
          <Image
            src={offer.image_url}
            alt={offer.name}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 hover:scale-105"
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col p-4">
        <div className="flex-grow">
          {offer.scale_status && (
            <div
              className={`mb-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getScaleBadgeClass(
                offer.scale_status
              )}`}
            >
              {offer.scale_status}
            </div>
          )}
          <CardTitle className="mb-1 text-lg">{offer.name}</CardTitle>
          <div className="space-y-1">
            <CardDescription>
              Plataforma: <span className="font-semibold">{offer.platform}</span>
            </CardDescription>
            {offer.niche && (
              <CardDescription>
                Nicho: <span className="font-semibold">{offer.niche}</span>
              </CardDescription>
            )}
          </div>
        </div>
        {hasFinancials && (
          <>
            <Separator className="my-3" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="text-muted-foreground">Custo</div>
              <div className="text-right font-medium">{formatCurrency(cost)}</div>
              <div className="text-muted-foreground">Receita</div>
              <div className="text-right font-medium">{formatCurrency(revenue)}</div>
              <div className="font-semibold text-muted-foreground">Lucro</div>
              <div
                className={`text-right font-bold ${
                  profit > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {formatCurrency(profit)}
              </div>
              <div className="font-semibold text-muted-foreground">ROI</div>
              <div
                className={`text-right font-bold ${
                  roi > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {roi.toFixed(2)}%
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-2">
        <p className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(offer.created_at), {
            addSuffix: true,
            locale: ptBR,
          })}
        </p>
        <OfferActions offer={offer} />
      </CardFooter>
    </Card>
  );
}