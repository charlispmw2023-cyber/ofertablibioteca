"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { MadeWithDyad } from "@/components/made-with-dyad";
import Link from "next/link";
import { OfferCard, type Offer } from "@/components/offers/offer-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: offersData, error } = await supabase
        .from("offers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching offers:", error);
      } else {
        setOffers(offersData || []);
      }

      setLoading(false);
    };

    getData();
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[160px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (offers.length === 0) {
      return (
        <div className="rounded-lg border bg-white p-8 text-center">
          <p className="text-gray-500">
            Você ainda não adicionou nenhuma oferta. Clique no botão acima para
            começar.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    );
  };

  if (!user && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }
  
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-semibold">Dashboard de Ofertas</h1>
          <Button variant="outline" onClick={handleSignOut}>
            Sair
          </Button>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Suas Ofertas</h2>
          <Link href="/offers/new" passHref>
            <Button>Adicionar Nova Oferta</Button>
          </Link>
        </div>
        {renderContent()}
      </main>
      <MadeWithDyad />
    </div>
  );
}