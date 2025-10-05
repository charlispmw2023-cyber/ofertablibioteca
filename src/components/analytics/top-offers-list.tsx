"use client";

import type { Offer } from "@/components/offers/offer-card";
import Image from "next/image";
import Link from "next/link";

interface TopOffersListProps {
  offers: Offer[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

export function TopOffersList({ offers }: TopOffersListProps) {
  if (offers.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Nenhuma oferta com dados de lucro para exibir.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => {
        const profit = (offer.revenue ?? 0) - (offer.cost ?? 0);
        return (
          <div key={offer.id} className="flex items-center gap-4">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md">
              <Image
                src={offer.image_url}
                alt={offer.name}
                layout="fill"
                objectFit="cover"
              />
            </div>
            <div className="flex-grow">
              <Link
                href={`/offers/${offer.id}/edit`}
                className="font-medium hover:underline"
              >
                {offer.name}
              </Link>
              <p className="text-sm text-muted-foreground">{offer.platform}</p>
            </div>
            <div
              className={`text-right font-bold ${
                profit > 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {formatCurrency(profit)}
            </div>
          </div>
        );
      })}
    </div>
  );
}