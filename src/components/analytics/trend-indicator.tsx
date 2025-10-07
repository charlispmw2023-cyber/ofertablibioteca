import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

interface TrendIndicatorProps {
  value: number;
  label: string;
  invertColor?: boolean;
}

export function TrendIndicator({
  value,
  label,
  invertColor = false,
}: TrendIndicatorProps) {
  const isPositive = value >= 0;
  const isNegative = value < 0;

  const colorClass = cn({
    "text-green-500": (isPositive && !invertColor) || (isNegative && invertColor),
    "text-red-500": (isNegative && !invertColor) || (isPositive && invertColor),
  });

  const Icon = isPositive ? ArrowUp : ArrowDown;

  return (
    <div className={cn("flex items-center text-sm font-medium", colorClass)}>
      <Icon className="mr-1 h-4 w-4" />
      <span>{`${value.toFixed(2)}% ${label}`}</span>
    </div>
  );
}