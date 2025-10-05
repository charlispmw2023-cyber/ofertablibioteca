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
import { Download, Upload } from "lucide-react";
import { exportToCsv } from "@/lib/csv-export";
import { toast } from "sonner";
import { ImportOffersDialog } from "@/components/offers/import-offers-dialog";

type SortOption = "created_at" | "profit" | "roi" | "name";

export default function Home() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [nicheFilter, setNicheFilter] = useState("all");
  const [scaleFilter, setScaleFilter] = useState("all");
  const [sortOption, setSortOption] = useState<SortOption>("created_at");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

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

  const sortedAndFilteredOffers = offers
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
    )
    .sort((a, b) => {
      switch (sortOption) {
        case "profit":
          const profitA = (a.revenue ?? 0) - (a.cost ?? 0);
          const profitB = (b.revenue ?? 0) - (b.cost ?? 0);
          return profitB - profitA;
        case "roi":
          const roiA = (a.cost ?? 0) > 0 ? ((a.revenue ?? 0) - (a.cost ?? 0)) / (a.cost ?? 1) : -Infinity;
          const roiB = (b.cost ?? 0) > 0 ? ((b.revenue ?? 0) - (b.cost ?? 0)) / (b.cost ?? 1) : -Infinity;
          return roiB - roiA;
        case "name":
          return a.name.localeCompare(b.name);
        case "created_at":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const handleExport = () => {
    if (sortedAndFilteredOffers.length === 0) {
      toast.error("Nenhuma oferta para exportar com os filtros atuais.");
      return;
    }
    const fileName = `ofertas_${new Date().toISOString().split("T")[0]}.csv`;
    exportToCsv(sortedAndFilteredOffers, fileName);
    toast.success(`${sortedAndFilteredOffers.length} ofertas exportadas com sucesso!`);
  };

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

    if (sortedAndFilteredOffers.length === 0) {
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
        {sortedAndFilteredOffers.map((offer) => (
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
          <ThemeToggle />
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
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setIsImportDialogOpen(true)}
                className="w-1/3 sm:w-auto"
              >
                <Upload className="mr-2 h-4 w-4" />
                Importar
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
                className="w-1/3 sm:w-auto"
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Link
                href="/offers/new"
                passHref
                className="w-1/3 sm:w-auto"
              >
                <Button className="w-full shrink-0">
                  Adicionar Nova Oferta
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
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
            <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Mais Recentes</SelectItem>
                <SelectItem value="profit">Maior Lucro</SelectItem>
                <SelectItem value="roi">Maior ROI</SelectItem>
                <SelectItem value="name">Nome (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {renderContent()}
      </main>
      <ImportOffersDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
      />
    </div>
  );
}