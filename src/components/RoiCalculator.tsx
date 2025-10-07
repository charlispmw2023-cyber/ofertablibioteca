"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Wallet } from "lucide-react";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

export function RoiCalculator() {
  const [cost, setCost] = useState("");
  const [revenue, setRevenue] = useState("");
  const [results, setResults] = useState<{
    profit: number;
    roi: number;
  } | null>(null);

  const handleCalculate = () => {
    const costValue = parseFloat(cost);
    const revenueValue = parseFloat(revenue);

    if (isNaN(costValue) || isNaN(revenueValue)) {
      setResults(null);
      return;
    }

    const profit = revenueValue - costValue;
    // Corrigido: Usando a variável de lucro para garantir o cálculo correto do ROI
    const roi = costValue > 0 ? (profit / costValue) * 100 : 0;

    setResults({ profit, roi });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Calculadora de Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="investment">Investimento (Custo Total)</Label>
            <Input
              id="investment"
              type="number"
              placeholder="Ex: 1500.00"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="revenue">Retorno (Receita Total)</Label>
            <Input
              id="revenue"
              type="number"
              placeholder="Ex: 5000.00"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={handleCalculate} className="w-full">
          Calcular
        </Button>
        {results && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium text-center">Resultados</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(parseFloat(cost))}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lucro</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${results.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(results.profit)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ROI</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${results.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {results.roi.toFixed(2)}%
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}