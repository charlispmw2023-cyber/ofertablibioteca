"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import type { Offer } from "@/components/offers/offer-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";

export default function BoardPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getOffers = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("offers").select("*");
      if (error) {
        console.error("Error fetching offers for board:", error);
      } else {
        setOffers(data || []);
      }
      setLoading(false);
    };
    getOffers();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </header>
        <div className="flex flex-grow p-4">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card/95 px-4">
        <h1 className="text-xl font-semibold">Quadro Kanban</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <LayoutGrid size={16} />
            Voltar para o Dashboard
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <KanbanBoard initialOffers={offers} />
    </div>
  );
}