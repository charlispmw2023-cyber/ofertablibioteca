"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import type { Offer } from "@/components/offers/offer-card";
import { KanbanCard } from "./kanban-card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface KanbanBoardProps {
  initialOffers: Offer[];
}

const columns = [
  { id: "Inicio", title: "🚀 Inicio" },
  { id: "Pré escala", title: "📈 Pré escala" },
  { id: "Escalando", title: "🔥 Escalando" },
  { id: "ESCALADISSIMA", title: "💸 ESCALADISSIMA" },
];

export function KanbanBoard({ initialOffers }: KanbanBoardProps) {
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null);

  const offersByColumn = useMemo(() => {
    const grouped: Record<string, Offer[]> = {};
    columns.forEach((col) => (grouped[col.id] = []));
    offers.forEach((offer) => {
      const status = offer.scale_status || "Inicio";
      if (grouped[status]) {
        grouped[status].push(offer);
      } else {
        // Fallback for offers with no status or an invalid one
        grouped["Inicio"].push(offer);
      }
    });
    return grouped;
  }, [offers]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const offer = offers.find((o) => o.id === active.id);
    if (offer) {
      setActiveOffer(offer);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveOffer(null);
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeOffer = offers.find((o) => o.id === active.id);
    const overContainerId = over.data.current?.sortable?.containerId || over.id;

    if (!activeOffer || activeOffer.scale_status === overContainerId) {
      return;
    }

    // Update local state immediately for a smooth UI experience
    setOffers((prev) =>
      prev.map((offer) =>
        offer.id === active.id
          ? { ...offer, scale_status: overContainerId }
          : offer
      )
    );

    // Update the database in the background
    const { error } = await supabase
      .from("offers")
      .update({ scale_status: overContainerId })
      .eq("id", active.id);

    if (error) {
      toast.error("Falha ao atualizar o status da oferta.");
      // Revert local state if the update fails
      setOffers((prev) =>
        prev.map((offer) =>
          offer.id === active.id
            ? { ...offer, scale_status: activeOffer.scale_status }
            : offer
        )
      );
    } else {
      toast.success(`Oferta movida para "${overContainerId}"!`);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full flex-grow gap-6 overflow-x-auto p-4">
        <SortableContext items={columns.map((c) => c.id)}>
          {columns.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              offers={offersByColumn[col.id] || []}
            />
          ))}
        </SortableContext>
      </div>
      <DragOverlay>
        {activeOffer ? <KanbanCard offer={activeOffer} /> : null}
      </DragOverlay>
    </DndContext>
  );
}