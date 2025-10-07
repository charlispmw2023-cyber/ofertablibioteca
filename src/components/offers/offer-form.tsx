"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import type { Offer } from "./offer-card";

import { SpyToolSection } from "./form-sections/spy-tool-section";
import { BasicInfoSection } from "./form-sections/basic-info-section";
import { ScaleStatusSection } from "./form-sections/scale-status-section";
import { FinancialsSection } from "./form-sections/financials-section";
import { NotesSection } from "./form-sections/notes-section";
import { LinksSection } from "./form-sections/links-section";
import { OrganizationSection } from "./form-sections/organization-section";

const offerFormSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  image: z.any().optional(),
  scale_status: z.string().optional(),
  observations: z.string().optional(),
  running_since: z.date().optional(),
  sales_page_link: z.string().url().optional().or(z.literal("")),
  checkout_link: z.string().url().optional().or(z.literal("")),
  upsell_1_link: z.string().url().optional().or(z.literal("")),
  upsell_2_link: z.string().url().optional().or(z.literal("")),
  upsell_3_link: z.string().url().optional().or(z.literal("")),
  thank_you_page_link: z.string().url().optional().or(z.literal("")),
  platform: z.string().min(1, { message: "Selecione uma plataforma." }),
  niche: z.string().optional(),
  cost: z.coerce.number().optional(),
  revenue: z.coerce.number().optional(),
  drive_link: z.string().url().optional().or(z.literal("")),
  ad_library_link: z.string().url().optional().or(z.literal("")), // Novo campo
});

type OfferFormValues = z.infer<typeof offerFormSchema>;

interface OfferFormProps {
  initialData?: Offer | null;
}

export function OfferForm({ initialData }: OfferFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scrapedImageUrl, setScrapedImageUrl] = useState<string | null>(null);
  const router = useRouter();
  const isEditMode = !!initialData;

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      scale_status: initialData?.scale_status ?? "",
      observations: initialData?.observations ?? "",
      running_since: initialData?.running_since
        ? new Date(initialData.running_since)
        : undefined,
      sales_page_link: initialData?.sales_page_link ?? "",
      checkout_link: initialData?.checkout_link ?? "",
      upsell_1_link: initialData?.upsell_1_link ?? "",
      upsell_2_link: initialData?.upsell_2_link ?? "",
      upsell_3_link: initialData?.upsell_3_link ?? "",
      thank_you_page_link: initialData?.thank_you_page_link ?? "",
      platform: initialData?.platform ?? "",
      niche: initialData?.niche ?? "",
      cost: initialData?.cost ?? undefined,
      revenue: initialData?.revenue ?? undefined,
      drive_link: initialData?.drive_link ?? "",
      ad_library_link: initialData?.ad_library_link ?? "", // Novo campo
    },
  });

  async function onSubmit(values: OfferFormValues) {
    setIsSubmitting(true);
    const toastId = toast.loading(
      isEditMode ? "Atualizando oferta..." : "Salvando oferta..."
    );

    try {
      let imageUrl = initialData?.image_url;
      const imageFile = values.image?.[0];

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("offer_images")
          .upload(fileName, imageFile);

        if (uploadError)
          throw new Error(`Erro no upload da imagem: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage
          .from("offer_images")
          .getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      } else if (!isEditMode && scrapedImageUrl) {
        imageUrl = scrapedImageUrl;
      }

      const { image, ...offerData } = values;
      const dataToUpsert = {
        ...offerData,
        image_url: imageUrl,
      };

      if (isEditMode) {
        const { error } = await supabase
          .from("offers")
          .update(dataToUpsert)
          .eq("id", initialData.id);
        if (error)
          throw new Error(`Erro ao atualizar a oferta: ${error.message}`);
        toast.success("Oferta atualizada com sucesso!", { id: toastId });
      } else {
        if (!imageUrl) {
          throw new Error(
            "A imagem é obrigatória. Espione uma URL ou faça o upload de um arquivo."
          );
        }
        const { error } = await supabase
          .from("offers")
          .insert(dataToUpsert);
        if (error) throw new Error(`Erro ao salvar a oferta: ${error.message}`);
        toast.success("Oferta salva com sucesso!", { id: toastId });
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        { id: toastId }
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <div className="space-y-8">
        {!isEditMode && (
          <SpyToolSection
            setValue={form.setValue}
            setScrapedImageUrl={setScrapedImageUrl}
            scrapedImageUrl={scrapedImageUrl}
          />
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <BasicInfoSection control={form.control} />
          <ScaleStatusSection control={form.control} />
          <FinancialsSection control={form.control} />
          <OrganizationSection control={form.control} />
          <LinksSection control={form.control} />
          <NotesSection control={form.control} />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? isEditMode
                ? "Atualizando..."
                : "Salvando..."
              : isEditMode
              ? "Salvar Alterações"
              : "Salvar Oferta"}
          </Button>
        </form>
      </div>
    </Form>
  );
}