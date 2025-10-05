"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { OfferCard, type Offer } from "@/components/offers/offer-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { BarChart } from "lucide-react";

export default function Home() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [nicheFilter, setNicheFilter] = useState("all");
  const [scaleFilter, setScaleFilter] = useState("all");

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

  const uniqueNiches = [
    ...new Set(offers.map((offer) => offer.niche).filter(Boolean)),
  ] as string[];

  const filteredOffers = offers
    .filter((offer) =>
      offer.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (offer) =>
        platformFilter === "all" || offer.platform === platformFilter
    )
    .filter((offer) => nicheFilter === "all" || offer.niche === nicheFilter)
    .filter(
      (offer) => scaleFilter === "all" || offer.scale_status === scaleFilter
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
        <div className="rounded-lg border bg-card p-8 text-center text-card-foreground">
          <p className="text-muted-foreground">
            Nenhuma oferta encontrada com os filtros atuais.
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
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-semibold">Biblioteca de Ofertas</h1>
          <div className="flex items-center gap-2">
            <Link href="/analytics" passHref>
              <Button variant="outline" size="icon" aria-label="Analytics">
                <BarChart className="h-4 w-4" />
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6">
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Input
              type="text"
              placeholder="Buscar ofertas pelo nome..."
              className="w-full sm:flex-grow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Link href="/offers/new" passHref className="w-full sm:w-auto">
              <Button className="w-full shrink-0 sm:w-auto">
                Adicionar Nova Oferta
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por plataforma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Plataformas</SelectItem>
                <SelectItem value="Google Ads">Google Ads</SelectItem>
                <SelectItem value="Facebook Ads">Facebook Ads</SelectItem>
                <SelectItem value="TikTok Ads">TikTok Ads</SelectItem>
                <SelectItem value="Outra">Outra</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={nicheFilter}
              onValueChange={setNicheFilter}
              disabled={uniqueNiches.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por nicho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Nichos</SelectItem>
                {uniqueNiches.map((niche) => (
                  <SelectItem key={niche} value={niche}>
                    {niche}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={scaleFilter} onValueChange={setScaleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por escala" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Inicio">Inicio</SelectItem>
                <SelectItem value="Pré escala">Pré escala</SelectItem>
                <SelectItem value="Escalando">Escalando</SelectItem>
                <SelectItem value="ESCALADISSIMA">ESCALADISSIMA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {renderContent()}
      </main>
    </div>
  );
}