"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Control } from "react-hook-form";

interface BasicInfoSectionProps {
  control: Control<any>;
}

export function BasicInfoSection({ control }: BasicInfoSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <FormField
        control={control}
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
        control={control}
        name="image"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Substituir Imagem (Opcional)</FormLabel>
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
  );
}