"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { UseFormSetValue } from "react-hook-form";

interface SpyToolSectionProps {
  setValue: UseFormSetValue<any>;
  setScrapedImageUrl: (url: string | null) => void;
  scrapedImageUrl: string | null;
}

export function SpyToolSection({ setValue, setScrapedImageUrl, scrapedImageUrl }: SpyToolSectionProps) {
  const [spyUrl, setSpyUrl] = useState("");
  const [isSpying, setIsSpying] = useState(false);

  const handleSpyUrl = async () => {
    if (!spyUrl) {
      toast.error("Por favor, insira uma URL para espionar.");
      return;
    }
    setIsSpying(true);
    const toastId = toast.loading("Espionando URL...");

    try {
      const { data, error } = await supabase.functions.invoke("scrape-url", {
        body: { url: spyUrl },
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      let successMessage = "Espionagem concluída!";
      if (data.title) {
        setValue("name", data.title);
        successMessage = "Nome da oferta preenchido!";
      }
      if (data.imageUrl) {
        setScrapedImageUrl(data.imageUrl);
      }
      
      toast.success(successMessage, { id: toastId });

    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Falha ao espionar a URL.",
        { id: toastId }
      );
    } finally {
      setIsSpying(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="text-lg font-medium">Ferramenta Spy</h3>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="url"
          placeholder="Cole a URL da página de vendas aqui..."
          value={spyUrl}
          onChange={(e) => setSpyUrl(e.target.value)}
          disabled={isSpying}
        />
        <Button type="button" onClick={handleSpyUrl} disabled={isSpying || !spyUrl} className="shrink-0">
          <Wand2 className="mr-2 h-4 w-4" />
          {isSpying ? "Espionando..." : "Espionar"}
        </Button>
      </div>
      {scrapedImageUrl && (
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">Imagem encontrada (será usada se nenhuma for enviada):</p>
          <div className="relative h-40 w-full overflow-hidden rounded-md border">
            <Image src={scrapedImageUrl} alt="Imagem espionada" layout="fill" objectFit="cover" />
          </div>
        </div>
      )}
    </div>
  );
}