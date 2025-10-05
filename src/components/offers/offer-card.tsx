"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { OfferActions } from "./offer-actions";

export type Offer = {
  id: string;
  name: string;
  image_url: string;
  platform: string;
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

export function OfferCard({ offer }: OfferCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden">
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
      <CardContent className="flex-grow p-4">
        <CardTitle className="mb-1 text-lg">{offer.name}</CardTitle>
        <CardDescription>
          Plataforma: <span className="font-semibold">{offer.platform}</span>
        </CardDescription>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <p className="text-sm text-gray-500">
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