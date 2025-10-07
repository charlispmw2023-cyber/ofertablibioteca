"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import {
  TooltipProps as RechartsTooltipProps,
  LegendProps as RechartsLegendProps,
} from "recharts";

import { cn } from "@/lib/utils";

// region Chart

const ChartContext = React.createContext<{
  config: ChartConfig;
}>({
  config: {},
});

type ChartConfig = {
  [k: string]: {
    label?: string;
    icon?: React.ComponentType<{ className?: string }>;
    color?: string;
  };
};

type ChartContainerProps = React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ReactNode;
};

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ id, className, children, config, ...props }, ref) => {
    const uniqueId = React.useId();
    const chartId = `chart-${id || uniqueId}`;
    return (
      <ChartContext.Provider value={{ config }}>
        <div
          data-chart={chartId}
          ref={ref}
          className={cn(
            "flex aspect-video justify-center text-foreground min-w-0",
            className
          )}
          {...props}
        >
          <ChartStyle id={chartId} config={config} />
          {children}
        </div>
      </ChartContext.Provider>
    );
  }
);
ChartContainer.displayName = "ChartContainer";

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, item]) => item.color
  ) as [string, { color: string }][];

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          ${colorConfig
            .map(
              ([key, item]) => `
            .recharts-tooltip-item-${id}-${key} {
              color: ${item.color};
            }
          `
            )
            .join("")}
        `,
      }}
    />
  );
};

// endregion

// region ChartTooltip

type ChartTooltipContentProps = RechartsTooltipProps<any, any> &
  React.ComponentPropsWithoutRef<"div"> & {
    hideIndicator?: boolean;
    hideLabel?: boolean;
    formatter?: (
      value: number | string,
      name: string,
      props: any
    ) => React.ReactNode;
    labelFormatter?: (label: string, payload: any[]) => React.ReactNode;
    nameKey?: string;
    labelKey?: string;
    indicator?: "dot" | "line";
    color?: string;
  };

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideIndicator = false,
      hideLabel = false,
      label,
      labelFormatter,
      formatter,
      nameKey,
      ...props
    },
    ref
  ) => {
    const { config } = React.useContext(ChartContext);
    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null;
      }

      const item = payload[0];
      const name = item.name || item.dataKey || "";
      const itemConfig = config[name];
      if (labelFormatter) {
        return labelFormatter(label || item.value, payload);
      }
      if (itemConfig?.label) {
        return itemConfig.label;
      }
      return label;
    }, [label, labelFormatter, payload, hideLabel, config]);

    if (active && payload?.length) {
      return (
        <div
          ref={ref}
          className={cn(
            "rounded-lg border bg-background p-2 text-sm shadow-md",
            className
          )}
          {...props}
        >
          {!hideLabel ? tooltipLabel : null}
          <div className="grid gap-1.5">
            {payload.map((item: any) => {
              const key = `${nameKey || item.name || item.dataKey || "value"}`;
              const itemConfig = config[key];
              const indicatorColor =
                itemConfig?.color || item.fill || item.stroke || item.color;

              return (
                <div
                  key={item.dataKey}
                  className={cn(
                    "flex items-center gap-2",
                    `recharts-tooltip-item-${item.chartId}-${key}`
                  )}
                >
                  {indicator === "dot" && !hideIndicator && (
                    <div
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor: indicatorColor,
                      }}
                    />
                  )}
                  {indicator === "line" && !hideIndicator && (
                    <div
                      className="h-0.5 w-3 shrink-0 rounded-full"
                      style={{
                        backgroundColor: indicatorColor,
                      }}
                    />
                  )}
                  {formatter && item?.value !== undefined ? (
                    formatter(item.value, item.name, item)
                  ) : (
                    <>
                      <div className="grid gap-1.5">
                        {!hideLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value && (
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {item.value.toLocaleString()}
                        </span>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";

const ChartTooltip = React.forwardRef<
  RechartsPrimitive.Tooltip<any, any>,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip>
>((props, ref) => (
  <RechartsPrimitive.Tooltip
    ref={ref}
    cursor={false}
    {...props}
    content={props.content || <ChartTooltipContent />}
  />
));
ChartTooltip.displayName = "ChartTooltip";

// endregion

// region ChartLegend

type ChartLegendContentProps = RechartsLegendProps &
  React.ComponentPropsWithoutRef<"div"> & {
    hideIcon?: boolean;
    formatter?: (
      value: string | number,
      entry: NonNullable<RechartsPrimitive.LegendProps["payload"]>[number],
      index: number
    ) => React.ReactNode;
    nameKey?: string;
  };

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  ChartLegendContentProps
>(
  (
    {
      className,
      hideIcon = false,
      payload,
      verticalAlign = "bottom",
      nameKey,
      formatter,
      ...props
    },
    ref
  ) => {
    const { config } = React.useContext(ChartContext);

    if (!payload?.length) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-2 sm:gap-4 flex-wrap",
          verticalAlign === "top" && "pb-3",
          verticalAlign === "bottom" && "pt-3",
          className
        )}
        {...props}
      >
        {payload.map(
          (
            item: NonNullable<RechartsPrimitive.LegendProps["payload"]>[number],
            index: number
          ) => {
            const key = `${nameKey || item.dataKey || "value"}`;
            const itemConfig = config[key];
            const indicatorColor =
              itemConfig?.color || item.fill || item.stroke || item.color;

            return (
              <div
                key={item.value}
                className={cn(
                  "flex items-center gap-1.5",
                  `recharts-legend-item-${item.chartId}-${key}`
                )}
              >
                {!hideIcon &&
                  (item.payload?.strokeDasharray ? (
                    <div
                      className="h-0.5 w-3 shrink-0 rounded-full"
                      style={{
                        backgroundColor: indicatorColor,
                      }}
                    />
                  ) : (
                    <div
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor: indicatorColor,
                      }}
                    />
                  ))}
                {formatter ? (
                  formatter(item.value as string | number, item, index)
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {itemConfig?.label || item.name}
                  </span>
                )}
              </div>
            );
          }
        )}
      </div>
    );
  }
);
ChartLegendContent.displayName = "ChartLegendContent";

const ChartLegend = React.forwardRef<
  RechartsPrimitive.Legend,
  React.ComponentProps<typeof RechartsPrimitive.Legend>
>((props, ref) => (
  <RechartsPrimitive.Legend
    ref={ref}
    {...props}
    content={props.content || <ChartLegendContent />}
  />
));
ChartLegend.displayName = "ChartLegend";

// endregion

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
};