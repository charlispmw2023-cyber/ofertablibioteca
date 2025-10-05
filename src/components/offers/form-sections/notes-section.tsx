"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { Control } from "react-hook-form";

interface NotesSectionProps {
  control: Control<any>;
}

export function NotesSection({ control }: NotesSectionProps) {
  return (
    <div className="space-y-8">
      <FormField
        control={control}
        name="observations"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Adicione anotações sobre a oferta, como ângulos de copy, público, etc."
                className="resize-y"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
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
  );
}