"use client";

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Link as LinkIcon } from "lucide-react";
import type { Offer } from "./offer-card";

interface OfferLinksDialogProps {
  offer: Offer;
}

export function OfferLinksDialog({ offer }: OfferLinksDialogProps) {
  const links = [
    { label: "Página de Vendas", href: offer.sales_page_link },
    { label: "Checkout", href: offer.checkout_link },
    { label: "Upsell 1", href: offer.upsell_1_link },
    { label: "Upsell 2", href: offer.upsell_2_link },
    { label: "Upsell 3", href: offer.upsell_3_link },
    { label: "Página de Obrigado", href: offer.thank_you_page_link },
    { label: "Drive", href: offer.drive_link },
    { label: "Biblioteca de Anúncios", href: offer.ad_library_link },
  ].filter((link) => link.href); // Filtra apenas links que existem

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Links da Oferta: {offer.name}</DialogTitle>
        <DialogDescription>
          Clique em um link para abrir em uma nova aba.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        {links.length > 0 ? (
          links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-500 hover:underline"
            >
              <LinkIcon className="h-4 w-4" />
              {link.label}
            </a>
          ))
        ) : (
          <p className="text-muted-foreground">Nenhum link disponível para esta oferta.</p>
        )}
      </div>
    </DialogContent>
  );
}