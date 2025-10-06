"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import type { Offer } from "@/components/offers/offer-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";

export default function BoardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data, error } = await supabase.from("offers").select("*");
        if (error) {
          console.error("Error fetching offers for board:", error);
        } else {
          setOffers(data || []);
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    };
    checkUserAndFetchData();
  }, [supabase, router]);

  if (loading || !user) {
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