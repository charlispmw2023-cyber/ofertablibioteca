"use client";

import Papa from "papaparse";
import type { Offer } from "@/components/offers/offer-card";

export const exportToCsv = (data: Offer[], fileName: string) => {
  const formattedData = data.map((offer) => ({
    "Nome da Oferta": offer.name,
    Plataforma: offer.platform,
    Nicho: offer.niche,
    "Status da Escala": offer.scale_status,
    Custo: offer.cost,
    Receita: offer.revenue,
    "Link da Página de Vendas": offer.sales_page_link,
    "Link do Checkout": offer.checkout_link,
    "Link do Upsell 1": offer.upsell_1_link,
    "Link do Upsell 2": offer.upsell_2_link,
    "Link do Upsell 3": offer.upsell_3_link,
    "Link do Upsell 4": offer.upsell_4_link, // Novo campo
    "Link do Upsell 5": offer.upsell_5_link, // Novo campo
    "Link do Upsell 6": offer.upsell_6_link, // Novo campo
    "Link do Upsell 7": offer.upsell_7_link, // Novo campo
    "Link da Página de Obrigado": offer.thank_you_page_link,
    "Link do Drive": offer.drive_link,
    "Link da Biblioteca de Anúncios": offer.ad_library_link,
    "Data de Criação": new Date(offer.created_at).toLocaleString("pt-BR"),
    "URL da Imagem": offer.image_url,
  }));

  const csv = Papa.unparse(formattedData);

  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};