import { BarChart3, CircleDot, Gauge } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type ChartItem = {
  label: string
  value: number
}

type PieItem = ChartItem & {
  color: string
}

type DashboardChartsProps = {
  bar: {
    description: string
    items: ChartItem[]
    title: string
    unit?: string
  }
  pie: {
    description: string
    items: PieItem[]
    title: string
  }
  radar: {
    description: string
    items: ChartItem[]
    title: string
  }
}

function DashboardCharts({ bar, pie, radar }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 max-xl:grid-cols-1">
      <BarChartCard {...bar} />
      <PieChartCard {...pie} />
      <RadarChartCard {...radar} />
    </div>
  )
}

function BarChartCard({
  description,
  items,
  title,
  unit = "",
}: DashboardChartsProps["bar"]) {
  const maxValue = Math.max(...items.map((item) => item.value))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 aria-hidden="true" className="size-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-64 items-end gap-3 rounded-lg bg-muted/60 p-4">
          {items.map((item) => (
            <div className="group relative flex h-full flex-1 flex-col justify-end gap-2" key={item.label}>
              <div
                aria-label={`${item.label} ${item.value}${unit}`}
                className="min-h-3 rounded-t-lg bg-primary shadow-lg shadow-primary/20 transition group-hover:bg-primary/80"
                style={{ height: `${(item.value / maxValue) * 100}%` }}
              />
              <div className="pointer-events-none absolute bottom-[calc(100%+0.5rem)] left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border bg-popover px-3 py-2 text-xs font-black text-popover-foreground shadow-xl group-hover:block">
                {item.label}: {item.value}
                {unit}
              </div>
              <span className="text-center text-xs font-black text-muted-foreground">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function PieChartCard({
  description,
  items,
  title,
}: DashboardChartsProps["pie"]) {
  const total = items.reduce((sum, item) => sum + item.value, 0)
  const gradient = items
    .map((item, index) => {
      const start =
        (items.slice(0, index).reduce((sum, current) => sum + current.value, 0) /
          total) *
        100
      const end = start + (item.value / total) * 100

      return `${item.color} ${start}% ${end}%`
    })
    .join(", ")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CircleDot aria-hidden="true" className="size-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center xl:grid-cols-1 2xl:grid-cols-[180px_minmax(0,1fr)]">
        <div
          aria-label={`${title} pie chart`}
          className="relative mx-auto grid size-44 place-items-center rounded-full"
          role="img"
          style={{ background: `conic-gradient(${gradient})` }}
        >
          <div className="grid size-24 place-items-center rounded-full bg-card text-center shadow-inner">
            <span className="text-2xl font-black">{total}</span>
          </div>
        </div>

        <div className="grid gap-3">
          {items.map((item) => {
            const percent = Math.round((item.value / total) * 100)

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
                  {item.value} • {percent}%
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function RadarChartCard({
  description,
  items,
  title,
}: DashboardChartsProps["radar"]) {
  const center = 110
  const radius = 76
  const chartPoints = items
    .map((item, index) => {
      const angle = (Math.PI * 2 * index) / items.length - Math.PI / 2
      const distance = (item.value / 100) * radius

      return `${center + Math.cos(angle) * distance},${center + Math.sin(angle) * distance}`
    })
    .join(" ")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge aria-hidden="true" className="size-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid place-items-center rounded-lg bg-muted/60 p-4">
          <svg
            aria-label={`${title} radar chart`}
            className="h-64 w-full max-w-[320px] overflow-visible"
            role="img"
            viewBox="0 0 220 220"
          >
            {[0.35, 0.65, 1].map((scale) => (
              <polygon
                className="fill-none stroke-border"
                key={scale}
                points={items
                  .map((_, index) => {
                    const angle = (Math.PI * 2 * index) / items.length - Math.PI / 2

                    return `${center + Math.cos(angle) * radius * scale},${
                      center + Math.sin(angle) * radius * scale
                    }`
                  })
                  .join(" ")}
              />
            ))}

            {items.map((item, index) => {
              const angle = (Math.PI * 2 * index) / items.length - Math.PI / 2
              const labelRadius = radius + 24
              const pointRadius = (item.value / 100) * radius
              const pointX = center + Math.cos(angle) * pointRadius
              const pointY = center + Math.sin(angle) * pointRadius

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
              )
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
  )
}

export default DashboardCharts
