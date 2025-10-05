"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OfferForm } from "@/components/offers/offer-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewOfferPage() {
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
              <CardTitle className="text-2xl">Adicionar Nova Oferta</CardTitle>
            </CardHeader>
            <CardContent>
              <OfferForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}