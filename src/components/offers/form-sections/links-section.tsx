"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Control } from "react-hook-form";

interface LinksSectionProps {
  control: Control<any>;
}

export function LinksSection({ control }: LinksSectionProps) {
  return (
    <div className="space-y-8">
      <FormField
        control={control}
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
        control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4"> {/* Novo grid para os upsells adicionais */}
        <FormField
          control={control}
          name="upsell_4_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upsell 4</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="upsell_5_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upsell 5</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="upsell_6_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upsell 6</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="upsell_7_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upsell 7</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
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
    </div>
  );
}