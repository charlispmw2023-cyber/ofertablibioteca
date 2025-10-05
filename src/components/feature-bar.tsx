"use client";

import { BarChart, Filter, Library, TrendingUp, Wand2 } from "lucide-react";

const features = [
  {
    name: "Biblioteca Centralizada",
    icon: Library,
  },
  {
    name: "Análise de ROI",
    icon: TrendingUp,
  },
  {
    name: "Filtros Avançados",
    icon: Filter,
  },
  {
    name: "Ferramenta Spy",
    icon: Wand2,
  },
  {
    name: "Dashboard Analítico",
    icon: BarChart,
  },
];

export function FeatureBar() {
  return (
    <div className="w-full border-b bg-muted/40 py-3">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground sm:justify-between">
          {features.map((feature) => (
            <div key={feature.name} className="flex items-center gap-2">
              <feature.icon className="h-4 w-4" />
              <span>{feature.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}