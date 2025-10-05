"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { OfferActions } from "./offer-actions";
import { NotebookText } from "lucide-react";

export type Offer = {
  id: string;
  name: string;
  image_url: string;
  platform: string;
  niche?: string | null;
  cost?: number | null;
  revenue?: number | null;
  scale_status?: string | null;
  observations?: string | null;
  running_since?: string | null;
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

const scaleValues: { [key: string]: number } = {
  "Inicio": 25,
  "Pré escala": 50,
  "Escalando": 75,
  "ESCALADISSIMA": 100,
};

export function OfferCard({ offer }: OfferCardProps) {
  const cost = offer.cost ?? 0;
  const revenue = offer.revenue ?? 0;
  const profit = revenue - cost;
  const roi = cost > 0 ? (profit / cost) * 100 : 0;
  const progressValue = offer.scale_status ? scaleValues[offer.scale_status] : 0;

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
            {offer.running_since && (
              <CardDescription className="text-xs">
                Rodando desde:{" "}
                <span className="font-semibold">
                  {format(new Date(offer.running_since), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </span>
              </CardDescription>
            )}
          </div>
          {offer.scale_status && (
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs font-medium text-muted-foreground">
                <span>Grau de Escala</span>
                <span>{offer.scale_status}</span>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>
          )}
        </div>
        {hasFinancials && (
          <>
            <Separator className="my-3" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="text-muted-foreground">Custo</div>
              <div className="text-right font-medium">{formatCurrency(cost)}</div>
              <div className="text-muted-foreground">Receita</div>
              <div className="text-right font-medium">
                {formatCurrency(revenue)}
              </div>
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
        <div className="flex items-center gap-2">
          {offer.observations && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <NotebookText className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Observações sobre "{offer.name}"</DialogTitle>
                </DialogHeader>
                <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                  {offer.observations}
                </div>
              </DialogContent>
            </Dialog>
          )}
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(offer.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </p>
        </div>
        <OfferActions offer={offer} />
      </CardFooter>
    </Card>
  );
}