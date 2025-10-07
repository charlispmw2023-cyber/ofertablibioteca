"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RoiCalculator } from "@/components/RoiCalculator";
import { AiMentorChat } from "@/components/AiMentorChat";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-semibold">Hub de Performance e Mentoria</h1>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Voltar
          </Link>
        </div>
      </header>
      <main className="container mx-auto flex-grow px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          <RoiCalculator />
          <AiMentorChat />
        </div>
      </main>
    </div>
  );
}