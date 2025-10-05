"use client";

import type { Offer } from "@/components/offers/offer-card";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "./kanban-card";

interface KanbanColumnProps {
  id: string;
  title: string;
  offers: Offer[];
}

export function KanbanColumn({ id, title, offers }: KanbanColumnProps) {
  return (
    <div className="flex w-72 shrink-0 flex-col rounded-md bg-muted/50 p-4">
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      <div className="flex-grow overflow-y-auto">
        <SortableContext
          id={id}
          items={offers.map((o) => o.id)}
          strategy={verticalListSortingStrategy}
        >
          {offers.map((offer) => (
            <KanbanCard key={offer.id} offer={offer} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}