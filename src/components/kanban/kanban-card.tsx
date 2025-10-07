"use client";

import type { Offer } from "@/components/offers/offer-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Dialog, DialogTrigger } from "@/components/ui/dialog"; // Importando Dialog e DialogTrigger
import { OfferLinksDialog } from "../offers/offer-links-dialog"; // Importando o modal de links

interface KanbanCardProps {
  offer: Offer;
}

export function KanbanCard({ offer }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: offer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Dialog>
        <DialogTrigger asChild>
          <Card className="mb-4 cursor-pointer active:cursor-grabbing hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-sm font-medium">{offer.name}</CardTitle>
            </CardHeader>
          </Card>
        </DialogTrigger>
        <OfferLinksDialog offer={offer} />
      </Dialog>
    </div>
  );
}