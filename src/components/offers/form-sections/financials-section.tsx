"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Control } from "react-hook-form";

interface FinancialsSectionProps {
  control: Control<any>;
}

export function FinancialsSection({ control }: FinancialsSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <FormField
        control={control}
        name="cost"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Custo (Investimento)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Ex: 150.50" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="revenue"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Faturamento (Receita)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Ex: 800.00" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}