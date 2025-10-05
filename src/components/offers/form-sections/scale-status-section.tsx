"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Control } from "react-hook-form";

interface ScaleStatusSectionProps {
  control: Control<any>;
}

export function ScaleStatusSection({ control }: ScaleStatusSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <FormField
        control={control}
        name="scale_status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Grau de Escala</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status da escala" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Inicio">Inicio</SelectItem>
                <SelectItem value="Pré escala">Pré escala</SelectItem>
                <SelectItem value="Escalando">Escalando</SelectItem>
                <SelectItem value="ESCALADISSIMA">ESCALADISSIMA</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="running_since"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Data de Início da Oferta</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP", { locale: ptBR })
                    ) : (
                      <span>Escolha uma data</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}