import { useEffect, useState } from "react";
import { BarChart3, Car, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getApiObject } from "@/lib/operations";
import DashboardHeaderActions, {
  DashboardCardSkeletonGrid,
  DashboardChartsSkeleton,
} from "@/pages/shared/DashboardHeaderActions";

import {
  dashboardCards,
  monthlySalesData,
  operationsRadarData,
  vehicleStatusData,
} from "./adminData";

function Dashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summary, setSummary] = useState<{
    inventory?: Record<string, number>;
    operations?: Record<string, number>;
    payments?: Record<string, number>;
    sales?: Record<string, number>;
  } | null>(null);

  const loadSummary = async (forceRefresh = false) => {
    setIsRefreshing(true);

    try {
      const data = await getApiObject<typeof summary>(
        "/api/reports/summary",
        forceRefresh,
      );
      setSummary(data);
    } finally {
      setIsRefreshing(false);
    }
  };
  const refreshData = () => void loadSummary(true);

  useEffect(() => {
    void loadSummary();
  }, []);

  const liveCards = summary
    ? [
        { ...dashboardCards[0], value: String(summary.inventory?.total ?? 0) },
        {
          ...dashboardCards[1],
          value: String(summary.inventory?.available ?? 0),
        },
        {
          ...dashboardCards[2],
          value: String(summary.inventory?.reserved ?? 0),
        },
        { ...dashboardCards[3], value: String(summary.inventory?.sold ?? 0) },
        {
          ...dashboardCards[4],
          value: String(summary.operations?.customers ?? 0),
        },
        {
          ...dashboardCards[5],
          value: `PHP ${Number(summary.sales?.total_amount ?? 0).toLocaleString()}`,
        },
        {
          ...dashboardCards[6],
          value: String(summary.operations?.reservations ?? 0),
        },
        {
          ...dashboardCards[7],
          value: String(summary.operations?.service_requests ?? 0),
        },
      ]
    : dashboardCards;

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 max-sm:flex-col">
          <div>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.13em] text-primary">
              Admin Dashboard
            </p>
            <CardTitle className="text-2xl font-black tracking-normal max-sm:text-2xl">
              Business Operations Overview
            </CardTitle>
            <CardDescription className="mt-1 max-w-3xl leading-5">
              Monitor inventory, reservations, sales, customers, payments, and
              maintenance work from one centralized admin workspace.
            </CardDescription>
          </div>
          <DashboardHeaderActions
            isRefreshing={isRefreshing}
            onRefresh={refreshData}
          />
        </CardHeader>
      </Card>

      {isRefreshing ? (
        <DashboardCardSkeletonGrid count={dashboardCards.length} />
      ) : (
        <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
          {liveCards.map(({ color, icon: Icon, label, value }) => (
            <Card className={cn("border-l-4", color.split(" ")[0])} key={label}>
              <CardContent className="flex items-center gap-4 p-4">
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-lg",
                    color,
                  )}
                >
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-muted-foreground">
                    {label}
                  </p>
                  <DashboardCardValue value={value} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isRefreshing ? <DashboardChartsSkeleton /> : <DashboardCharts />}

      <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        <ActivityCard items={[]} title="Today's Priority" />
        <ActivityCard items={[]} title="Recent Activity" />
      </div>
    </div>
  );
}

function DashboardCardValue({ value }: { value: string }) {
  if (value.startsWith("PHP ")) {
    return (
      <strong className="mt-2 flex flex-wrap items-end gap-1 text-lg md:text-xl xl:text-2xl leading-none">
        <span className="pb-0.5 text-xs font-black uppercase leading-none text-muted-foreground">
          ₱
        </span>
        <span className="break-all">{value.replace(/^PHP\s+/, "")}</span>
      </strong>
    );
  }

  return (
    <strong className="mt-2 block text-xl md:text-2xl xl:text-3xl leading-none">
      {value}
    </strong>
  );
}

function DashboardCharts() {
  return (
    <div className="grid grid-cols-3 gap-2 max-xl:grid-cols-1">
      <BarChartCard />
      <PieChartCard />
      <RadarChartCard />
    </div>
  );
}

function BarChartCard() {
  const maxValue = Math.max(...monthlySalesData.map((item) => item.value));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <BarChart3 aria-hidden="true" className="size-5 text-primary" />
          Monthly Sales
        </CardTitle>
        <CardDescription>Sales movement from January to June.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-85 items-end gap-2 rounded-lg bg-muted/60 p-4">
          {monthlySalesData.map((item) => (
            <div
              className="group relative flex h-full flex-1 flex-col justify-end gap-2"
              key={item.label}
            >
              <div
                aria-label={`${item.label} sales PHP ${item.value}K`}
                className="min-h-3 rounded-t-lg bg-primary shadow-lg shadow-primary/20 transition group-hover:bg-primary/80"
                style={{ height: `${(item.value / maxValue) * 100}%` }}
              />
              <div className="pointer-events-none absolute bottom-[calc(100%+0.5rem)] left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border bg-popover px-3 py-2 text-xs font-black text-popover-foreground shadow-xl group-hover:block">
                {item.label}: ₱ {item.value}K
              </div>
              <span className="text-center text-xs font-black text-muted-foreground">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PieChartCard() {
  const total = vehicleStatusData.reduce((sum, item) => sum + item.value, 0);
  const gradient = vehicleStatusData
    .map((item, index) => {
      const start =
        (vehicleStatusData
          .slice(0, index)
          .reduce((sum, current) => sum + current.value, 0) /
          total) *
        100;
      const end = start + (item.value / total) * 100;

      return `${item.color} ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car aria-hidden="true" className="size-5 text-primary" />
          Vehicle Status
        </CardTitle>
        <CardDescription>
          Inventory distribution by current status.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center xl:grid-cols-1 2xl:grid-cols-[180px_minmax(0,1fr)]">
        <div
          aria-label="Pie chart showing available, reserved, and sold vehicles"
          className="relative mx-auto grid size-44 place-items-center rounded-full"
          role="img"
          style={{ background: `conic-gradient(${gradient})` }}
        >
          <div className="grid size-24 place-items-center rounded-full bg-card text-center shadow-inner">
            <span className="text-2xl font-black">{total}</span>
          </div>
        </div>

        <div className="grid gap-3">
          {vehicleStatusData.map((item) => {
            const percent = Math.round((item.value / total) * 100);

            return (
              <div
                className="group relative flex items-center justify-between gap-3 rounded-lg p-2 transition hover:bg-muted"
                key={item.label}
              >
                <span className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.label}
                </span>
                <strong>{item.value}</strong>
                <div className="pointer-events-none absolute -top-9 right-0 z-10 hidden whitespace-nowrap rounded-lg border bg-popover px-3 py-2 text-xs font-black text-popover-foreground shadow-xl group-hover:block">
                  {item.value} vehicles • {percent}%
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function RadarChartCard() {
  const center = 110;
  const radius = 76;
  const chartPoints = operationsRadarData
    .map((item, index) => {
      const angle =
        (Math.PI * 2 * index) / operationsRadarData.length - Math.PI / 2;
      const distance = (item.value / 100) * radius;

      return `${center + Math.cos(angle) * distance},${center + Math.sin(angle) * distance}`;
    })
    .join(" ");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck aria-hidden="true" className="size-5 text-primary" />
          Operations Health
        </CardTitle>
        <CardDescription>
          Radar view of core admin performance areas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid place-items-center rounded-lg bg-muted/60 p-4">
          <svg
            aria-label="Radar chart showing operations health scores"
            className="h-64 w-full max-w-[320px] overflow-visible"
            role="img"
            viewBox="0 0 220 220"
          >
            {[0.35, 0.65, 1].map((scale) => (
              <polygon
                className="fill-none stroke-border"
                key={scale}
                points={operationsRadarData
                  .map((_, index) => {
                    const angle =
                      (Math.PI * 2 * index) / operationsRadarData.length -
                      Math.PI / 2;

                    return `${center + Math.cos(angle) * radius * scale},${
                      center + Math.sin(angle) * radius * scale
                    }`;
                  })
                  .join(" ")}
              />
            ))}

            {operationsRadarData.map((item, index) => {
              const angle =
                (Math.PI * 2 * index) / operationsRadarData.length -
                Math.PI / 2;
              const labelRadius = radius + 24;
              const pointRadius = (item.value / 100) * radius;
              const pointX = center + Math.cos(angle) * pointRadius;
              const pointY = center + Math.sin(angle) * pointRadius;

              return (
                <g className="group" key={item.label}>
                  <line
                    className="stroke-border"
                    x1={center}
                    x2={center + Math.cos(angle) * radius}
                    y1={center}
                    y2={center + Math.sin(angle) * radius}
                  />
                  <text
                    className="fill-muted-foreground text-[9px] font-bold"
                    textAnchor="middle"
                    x={center + Math.cos(angle) * labelRadius}
                    y={center + Math.sin(angle) * labelRadius}
                  >
                    {item.label}
                  </text>
                  <circle
                    aria-label={`${item.label} score ${item.value}%`}
                    className="fill-primary stroke-card stroke-2"
                    cx={pointX}
                    cy={pointY}
                    r="4"
                  />
                  <g className="opacity-0 transition group-hover:opacity-100">
                    <rect
                      className="fill-popover stroke-border"
                      height="24"
                      rx="6"
                      width="70"
                      x={pointX - 35}
                      y={pointY - 34}
                    />
                    <text
                      className="fill-popover-foreground text-[9px] font-black"
                      textAnchor="middle"
                      x={pointX}
                      y={pointY - 19}
                    >
                      {item.value}%
                    </text>
                  </g>
                </g>
              );
            })}

            <polygon
              className="fill-primary/30 stroke-primary"
              points={chartPoints}
              strokeWidth="2"
            />
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityCard({
  items,
  title,
}: {
  items: [string, string][];
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {items.length > 0 ? (
          items.map(([label, value]) => (
            <div
              className="flex items-center justify-between gap-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground"
              key={label}
            >
              <span>{label}</span>
              <Badge variant="orange">{value}</Badge>
            </div>
          ))
        ) : (
          <div className="rounded-lg bg-muted p-3 text-sm font-semibold text-muted-foreground">
            No live activity available yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default Dashboard;
