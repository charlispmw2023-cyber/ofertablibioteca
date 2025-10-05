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
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

const offerFormSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  image: z.any().refine((file) => file?.length == 1, "A imagem é obrigatória."),
  sales_page_link: z.string().url().optional().or(z.literal("")),
  checkout_link: z.string().url().optional().or(z.literal("")),
  upsell_1_link: z.string().url().optional().or(z.literal("")),
  upsell_2_link: z.string().url().optional().or(z.literal("")),
  upsell_3_link: z.string().url().optional().or(z.literal("")),
  thank_you_page_link: z.string().url().optional().or(z.literal("")),
  platform: z.string().min(1, { message: "Selecione uma plataforma." }),
  drive_link: z.string().url().optional().or(z.literal("")),
});

export function OfferForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const form = useForm<z.infer<typeof offerFormSchema>>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      name: "",
      sales_page_link: "",
      checkout_link: "",
      upsell_1_link: "",
      upsell_2_link: "",
      upsell_3_link: "",
      thank_you_page_link: "",
      platform: "",
      drive_link: "",
    },
  });

  async function onSubmit(values: z.infer<typeof offerFormSchema>) {
    setIsSubmitting(true);
    const toastId = toast.loading("Salvando oferta...");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado.");

      const imageFile = values.image[0];
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("offer_images")
        .upload(filePath, imageFile);

      if (uploadError) {
        throw new Error(`Erro no upload da imagem: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from("offer_images")
        .getPublicUrl(filePath);

      const { image, ...offerData } = values;

      const { error: insertError } = await supabase.from("offers").insert([
        {
          ...offerData,
          user_id: user.id,
          image_url: publicUrlData.publicUrl,
        },
      ]);

      if (insertError) {
        throw new Error(`Erro ao salvar a oferta: ${insertError.message}`);
      }

      toast.success("Oferta salva com sucesso!", { id: toastId });
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
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar Oferta"}
        </Button>
      </form>
    </Form>
  );
}