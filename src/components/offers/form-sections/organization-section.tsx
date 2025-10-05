"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { Control } from "react-hook-form";

interface OrganizationSectionProps {
  control: Control<any>;
}

export function OrganizationSection({ control }: OrganizationSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <FormField
        control={control}
        name="platform"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Plataforma</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        control={control}
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
  );
}