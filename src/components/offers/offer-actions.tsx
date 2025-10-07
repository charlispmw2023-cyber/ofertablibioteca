"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Link as LinkIcon, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DeleteOfferDialog } from "./delete-offer-dialog";
import type { Offer } from "./offer-card";

interface OfferActionsProps {
  offer: Offer;
}

export function OfferActions({ offer }: OfferActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const links = [
    { label: "Página de Vendas", href: offer.sales_page_link },
    { label: "Checkout", href: offer.checkout_link },
    { label: "Upsell 1", href: offer.upsell_1_link },
    { label: "Upsell 2", href: offer.upsell_2_link },
    { label: "Upsell 3", href: offer.upsell_3_link },
    { label: "Upsell 4", href: offer.upsell_4_link }, // Adicionado aqui
    { label: "Upsell 5", href: offer.upsell_5_link }, // Adicionado aqui
    { label: "Upsell 6", href: offer.upsell_6_link }, // Adicionado aqui
    { label: "Upsell 7", href: offer.upsell_7_link }, // Adicionado aqui
    { label: "Página de Obrigado", href: offer.thank_you_page_link },
    { label: "Drive", href: offer.drive_link },
    { label: "Biblioteca de Anúncios", href: offer.ad_library_link },
  ].filter((link) => link.href);

  const handleDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Excluindo oferta...");

    try {
      const imageUrl = new URL(offer.image_url);
      const imagePath = decodeURIComponent(imageUrl.pathname.split("/").slice(5).join("/"));
      
      if (imagePath) {
        const { error: storageError } = await supabase.storage
          .from("offer_images")
          .remove([imagePath]);
        if (storageError) {
          throw new Error(`Erro ao excluir a imagem: ${storageError.message}`);
        }
      }

      const { error: dbError } = await supabase
        .from("offers")
        .delete()
        .eq("id", offer.id);

      if (dbError) {
        throw new Error(`Erro ao excluir a oferta: ${dbError.message}`);
      }

      toast.success("Oferta excluída com sucesso!", { id: toastId });
      setIsDeleteDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        { id: toastId }
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {links.length > 0 && (
            <>
              {links.map((link) => (
                <DropdownMenuItem key={link.label} asChild>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <LinkIcon size={14} />
                    <span>{link.label}</span>
                  </a>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem asChild>
            <Link
              href={`/offers/${offer.id}/edit`}
              className="flex cursor-pointer items-center"
            >
              <Edit size={14} className="mr-2" />
              Editar
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-500"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 size={14} className="mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteOfferDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        isPending={isDeleting}
      />
    </>
  );
}