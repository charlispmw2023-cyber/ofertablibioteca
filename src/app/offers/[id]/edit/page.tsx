"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OfferForm } from "@/components/offers/offer-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Offer } from "@/components/offers/offer-card";
import { toast } from "sonner";

export default function EditOfferPage() {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const offerId = params.id as string;

  useEffect(() => {
    const getOffer = async () => {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("id", offerId)
        .single();

      if (error || !data) {
        console.error("Error fetching offer:", error);
        toast.error("Não foi possível carregar a oferta.");
        router.push("/");
        return;
      }

      setOffer(data);
      setLoading(false);
    };

    if (offerId) {
      getOffer();
    }
  }, [router, offerId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Carregando oferta...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Voltar para o Dashboard
          </Link>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Editar Oferta</CardTitle>
            </CardHeader>
            <CardContent>
              <OfferForm initialData={offer} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}