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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsCheckingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!isCheckingAuth && !user) {
      router.push("/login");
    }
  }, [isCheckingAuth, user, router]);

  useEffect(() => {
    if (!user) return;

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
  }, [user, supabase]);

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Verificando autenticação...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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