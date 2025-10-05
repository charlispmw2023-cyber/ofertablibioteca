"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewOfferPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
      if (!user) {
        router.push("/login");
      }
    };

    getUser();
  }, [supabase, router]);

  if (loading) {
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
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Voltar para o Dashboard
          </Link>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-6 text-3xl font-bold">Adicionar Nova Oferta</h1>
          {/* O formulário será adicionado aqui */}
          <div className="rounded-lg border bg-white p-8 text-center">
            <p className="text-gray-500">
              O formulário para adicionar a oferta será implementado aqui.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}