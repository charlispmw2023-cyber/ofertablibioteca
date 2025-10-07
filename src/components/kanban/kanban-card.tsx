"use client";

import type { Offer } from "@/components/offers/offer-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link"; // Importando Link do Next.js

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
      <Link href={`/offers/${offer.id}/edit`} passHref>
        <Card className="mb-4 cursor-grab active:cursor-grabbing hover:bg-accent/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-sm font-medium">{offer.name}</CardTitle>
          </CardHeader>
        </Card>
      </Link>
    </div>
  );
}