"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MadeWithDyad } from "@/components/made-with-dyad";
import Link from "next/link";
import { OfferCard, type Offer } from "@/components/offers/offer-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const getOffers = async () => {
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

    getOffers();
  }, []);

  const filteredOffers = offers.filter((offer) =>
    offer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
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

    if (filteredOffers.length === 0) {
      return (
        <div className="rounded-lg border bg-white p-8 text-center">
          <p className="text-gray-500">
            {searchTerm
              ? "Nenhuma oferta encontrada com esse nome."
              : "Nenhuma oferta adicionada ainda. Clique no botão acima para começar."}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredOffers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-semibold">Biblioteca de Ofertas</h1>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6">
        <div className="mb-6 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Buscar ofertas pelo nome..."
              className="w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link href="/offers/new" passHref>
            <Button className="w-full sm:w-auto">Adicionar Nova Oferta</Button>
          </Link>
        </div>
        {renderContent()}
      </main>
      <MadeWithDyad />
    </div>
  );
}