"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
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
import { Download, Upload, Kanban } from "lucide-react";
import { exportToCsv } from "@/lib/csv-export";
import { toast } from "sonner";
import { ImportOffersDialog } from "@/components/offers/import-offers-dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from "@/components/ui/pagination";

type SortOption = "created_at" | "profit" | "roi" | "name";
const OFFERS_PER_PAGE = 12;

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isFetchingOffers, setIsFetchingOffers] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [nicheFilter, setNicheFilter] = useState("all");
  const [scaleFilter, setScaleFilter] = useState("all");
  const [sortOption, setSortOption] = useState<SortOption>("created_at");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOffers, setTotalOffers] = useState(0);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const checkSessionAndSubscribe = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      setUser(session.user);
      setIsCheckingAuth(false);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
        if (!newSession) {
          router.push('/login');
        } else {
          setUser(newSession.user);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    checkSessionAndSubscribe();
  }, [supabase, router]);

  useEffect(() => {
    if (!user) return;

    const getOffers = async () => {
      setIsFetchingOffers(true);
      
      let query = supabase.from("offers").select("*", { count: "exact" });

      if (searchTerm) query = query.ilike("name", `%${searchTerm}%`);
      if (platformFilter !== "all") query = query.eq("platform", platformFilter);
      if (nicheFilter !== "all") query = query.eq("niche", nicheFilter);
      if (scaleFilter !== "all") query = query.eq("scale_status", scaleFilter);

      switch (sortOption) {
        case "name":
          query = query.order("name", { ascending: true });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const from = (currentPage - 1) * OFFERS_PER_PAGE;
      const to = from + OFFERS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data: offersData, error, count } = await query;

      if (error) {
        console.error("Error fetching offers:", error);
        toast.error("Falha ao carregar as ofertas.");
      } else {
        setOffers(offersData || []);
        setTotalOffers(count || 0);
      }
      setIsFetchingOffers(false);
    };

    getOffers();
  }, [currentPage, searchTerm, platformFilter, nicheFilter, scaleFilter, sortOption, user, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const uniqueNiches = [
    ...new Set(offers.map((offer) => offer.niche).filter(Boolean)),
  ] as string[];

  const sortedOffers = [...offers].sort((a, b) => {
      switch (sortOption) {
        case "profit":
          const profitA = (a.revenue ?? 0) - (a.cost ?? 0);
          const profitB = (b.revenue ?? 0) - (b.cost ?? 0);
          return profitB - profitA;
        case "roi":
          const roiA = (a.cost ?? 0) > 0 ? ((a.revenue ?? 0) - (a.cost ?? 0)) / (a.cost ?? 1) : -Infinity;
          const roiB = (b.cost ?? 0) > 0 ? ((b.revenue ?? 0) - (b.cost ?? 0)) / (b.cost ?? 1) : -Infinity;
          return roiB - roiA;
        default:
          return 0;
      }
    });

  const handleExport = async () => {
    toast.info("Exportando todas as suas ofertas...");
    const { data: allOffers, error } = await supabase.from("offers").select("*");
    if (error || !allOffers) {
      toast.error("Falha ao buscar dados para exportação.");
      return;
    }
    const fileName = `suas_ofertas_${new Date().toISOString().split("T")[0]}.csv`;
    exportToCsv(allOffers, fileName);
    toast.success(`${allOffers.length} ofertas exportadas com sucesso!`);
  };

  const totalPages = Math.ceil(totalOffers / OFFERS_PER_PAGE);

  if (isCheckingAuth) {
    return <div className="flex min-h-screen items-center justify-center"><p>Carregando...</p></div>;
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-semibold">Biblioteca de Ofertas</h1>
          <div className="flex items-center gap-2">
            <Link href="/board" passHref>
              <Button variant="outline" size="icon" aria-label="Quadro Kanban">
                <Kanban className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" onClick={handleSignOut}>Sair</Button>
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
        
        {isFetchingOffers ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(OFFERS_PER_PAGE)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[160px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedOffers.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center text-card-foreground">
            <p className="text-muted-foreground">
              Nenhuma oferta encontrada.
            </p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-opacity duration-200 ${isFetchingOffers ? 'opacity-50' : 'opacity-100'}`}>
            {sortedOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              <PaginationItem className="hidden sm:flex">
                <span className="px-4 py-2 text-sm">
                  Página {currentPage} de {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </main>
      <ImportOffersDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
      />
    </div>
  );
}