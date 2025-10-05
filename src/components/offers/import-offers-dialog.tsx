"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";

interface ImportOffersDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type CsvRow = {
  "Nome da Oferta": string;
  Plataforma: string;
  "URL da Imagem": string;
  Nicho?: string;
  "Status da Escala"?: string;
  Custo?: string;
  Receita?: string;
  "Link da Página de Vendas"?: string;
  "Link do Checkout"?: string;
  "Link do Upsell 1"?: string;
  "Link do Upsell 2"?: string;
  "Link do Upsell 3"?: string;
  "Link da Página de Obrigado"?: string;
  "Link do Drive"?: string;
};

export function ImportOffersDialog({ isOpen, onClose }: ImportOffersDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!file) {
      toast.error("Por favor, selecione um arquivo CSV para importar.");
      return;
    }

    setIsImporting(true);
    const toastId = toast.loading(`Importando ofertas do arquivo ${file.name}...`);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: any) => {
        const rows = results.data as CsvRow[];
        
        if (rows.length === 0) {
          toast.error("O arquivo CSV está vazio ou em um formato inválido.", { id: toastId });
          setIsImporting(false);
          return;
        }

        const offersToInsert = rows.map(row => ({
          name: row["Nome da Oferta"],
          platform: row.Plataforma,
          image_url: row["URL da Imagem"],
          niche: row.Nicho,
          scale_status: row["Status da Escala"],
          cost: row.Custo ? parseFloat(row.Custo) : null,
          revenue: row.Receita ? parseFloat(row.Receita) : null,
          sales_page_link: row["Link da Página de Vendas"],
          checkout_link: row["Link do Checkout"],
          upsell_1_link: row["Link do Upsell 1"],
          upsell_2_link: row["Link do Upsell 2"],
          upsell_3_link: row["Link do Upsell 3"],
          thank_you_page_link: row["Link da Página de Obrigado"],
          drive_link: row["Link do Drive"],
        })).filter(offer => offer.name && offer.platform && offer.image_url);

        if (offersToInsert.length === 0) {
            toast.error("Nenhuma oferta válida encontrada. Verifique se as colunas 'Nome da Oferta', 'Plataforma' e 'URL da Imagem' estão presentes e preenchidas.", { id: toastId });
            setIsImporting(false);
            return;
        }

        try {
          const { error } = await supabase.from("offers").insert(offersToInsert);
          if (error) throw new Error(`Erro ao importar: ${error.message}`);

          toast.success(`${offersToInsert.length} ofertas importadas com sucesso!`, { id: toastId });
          onClose();
          router.refresh();
        } catch (error) {
          console.error(error);
          toast.error(error instanceof Error ? error.message : "Ocorreu um erro inesperado.", { id: toastId });
        } finally {
          setIsImporting(false);
        }
      },
      error: (error: any) => {
        console.error("Error parsing CSV:", error);
        toast.error("Falha ao ler o arquivo CSV.", { id: toastId });
        setIsImporting(false);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Ofertas de CSV</DialogTitle>
          <DialogDescription>
            Selecione um arquivo .csv para importar. As colunas "Nome da Oferta", "Plataforma" e "URL da Imagem" são obrigatórias.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isImporting}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isImporting}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={!file || isImporting}>
            {isImporting ? "Importando..." : "Importar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}