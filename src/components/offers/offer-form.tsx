"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import type { Offer } from "./offer-card";

const offerFormSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  image: z.any().optional(),
  sales_page_link: z.string().url().optional().or(z.literal("")),
  checkout_link: z.string().url().optional().or(z.literal("")),
  upsell_1_link: z.string().url().optional().or(z.literal("")),
  upsell_2_link: z.string().url().optional().or(z.literal("")),
  upsell_3_link: z.string().url().optional().or(z.literal("")),
  thank_you_page_link: z.string().url().optional().or(z.literal("")),
  platform: z.string().min(1, { message: "Selecione uma plataforma." }),
  niche: z.string().optional(),
  drive_link: z.string().url().optional().or(z.literal("")),
});

type OfferFormValues = z.infer<typeof offerFormSchema>;

interface OfferFormProps {
  initialData?: Offer | null;
}

export function OfferForm({ initialData }: OfferFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const isEditMode = !!initialData;

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      sales_page_link: initialData?.sales_page_link ?? "",
      checkout_link: initialData?.checkout_link ?? "",
      upsell_1_link: initialData?.upsell_1_link ?? "",
      upsell_2_link: initialData?.upsell_2_link ?? "",
      upsell_3_link: initialData?.upsell_3_link ?? "",
      thank_you_page_link: initialData?.thank_you_page_link ?? "",
      platform: initialData?.platform ?? "",
      niche: initialData?.niche ?? "",
      drive_link: initialData?.drive_link ?? "",
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
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from("offer_images")
          .upload(filePath, imageFile);

        if (uploadError) {
          throw new Error(`Erro no upload da imagem: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from("offer_images")
          .getPublicUrl(filePath);
        imageUrl = publicUrlData.publicUrl;
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
        if (error) throw new Error(`Erro ao atualizar a oferta: ${error.message}`);
        toast.success("Oferta atualizada com sucesso!", { id: toastId });
      } else {
        if (!imageUrl) {
          throw new Error("A imagem é obrigatória para criar uma nova oferta.");
        }
        const { error } = await supabase.from("offers").insert(dataToUpsert);
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Oferta</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Ebook de Receitas Fit" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imagem da Oferta</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => field.onChange(e.target.files)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="sales_page_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link da Página de Vendas</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="checkout_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link do Checkout</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <FormField
            control={form.control}
            name="upsell_1_link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upsell 1</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="upsell_2_link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upsell 2</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="upsell_3_link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upsell 3</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="thank_you_page_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link da Página de Obrigado</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <FormField
            control={form.control}
            name="platform"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plataforma</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a plataforma" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Google Ads">Google Ads</SelectItem>
                    <SelectItem value="Facebook Ads">Facebook Ads</SelectItem>
                    <SelectItem value="TikTok Ads">TikTok Ads</SelectItem>
                    <SelectItem value="Outra">Outra</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="niche"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nicho</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Saúde e Bem-estar" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="drive_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link do Drive</FormLabel>
              <FormControl>
                <Input placeholder="https://drive.google.com/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
    </Form>
  );
}