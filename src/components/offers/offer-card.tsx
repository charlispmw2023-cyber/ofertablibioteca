"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Link as LinkIcon, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  const links = [
    { label: "Página de Vendas", href: offer.sales_page_link },
    { label: "Checkout", href: offer.checkout_link },
    { label: "Upsell 1", href: offer.upsell_1_link },
    { label: "Upsell 2", href: offer.upsell_2_link },
    { label: "Upsell 3", href: offer.upsell_3_link },
    { label: "Página de Obrigado", href: offer.thank_you_page_link },
    { label: "Drive", href: offer.drive_link },
  ].filter((link) => link.href);

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {links.length > 0 && (
              <>
                {links.map((link) => (
                  <DropdownMenuItem key={link.label} asChild>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <LinkIcon size={14} />
                      <span>{link.label}</span>
                    </a>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem disabled>
              <Edit size={14} className="mr-2" />
              Editar (em breve)
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-500" disabled>
              <Trash2 size={14} className="mr-2" />
              Excluir (em breve)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}