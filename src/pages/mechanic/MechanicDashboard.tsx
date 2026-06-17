import { useState } from "react"
import { ClipboardList } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import DashboardCharts from "@/pages/shared/DashboardCharts"
import DashboardHeaderActions, {
  DashboardCardSkeletonGrid,
  DashboardChartsSkeleton,
} from "@/pages/shared/DashboardHeaderActions"

import { mechanicDashboardCards } from "./mechanicData"

const mechanicCharts = {
  bar: {
    description: "Completed maintenance and cleaning tasks this week.",
    items: [
      { label: "Mon", value: 9 },
      { label: "Tue", value: 12 },
      { label: "Wed", value: 10 },
      { label: "Thu", value: 14 },
      { label: "Fri", value: 16 },
      { label: "Sat", value: 11 },
    ],
    title: "Task Completion",
  },
  pie: {
    description: "Workshop queue by current progress.",
    items: [
      { color: "#3b82f6", label: "In Progress", value: 7 },
      { color: "#f59e0b", label: "Pending Parts", value: 3 },
      { color: "#10b981", label: "Completed", value: 18 },
      { color: "#06b6d4", label: "Carwash", value: 5 },
    ],
    title: "Job Order Status",
  },
  radar: {
    description: "Readiness across maintenance operations.",
    items: [
      { label: "Repair", value: 82 },
      { label: "Inspect", value: 88 },
      { label: "Wash", value: 76 },
      { label: "Detail", value: 72 },
      { label: "Ready", value: 90 },
    ],
    title: "Workshop Health",
  },
}

function MechanicDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const refreshData = () => {
    setIsRefreshing(true)
    window.setTimeout(() => setIsRefreshing(false), 900)
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 max-sm:flex-col">
          <div>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.13em] text-primary">
              Mechanic & Carwasher Dashboard
            </p>
            <CardTitle className="text-3xl font-black tracking-normal max-sm:text-2xl">
              Maintenance Operations
            </CardTitle>
            <CardDescription className="mt-3 max-w-3xl leading-7">
              Track assigned job orders, vehicle condition, repair progress,
              cleaning status, and readiness for sale.
            </CardDescription>
          </div>
          <DashboardHeaderActions
            isRefreshing={isRefreshing}
            onRefresh={refreshData}
          />
        </CardHeader>
      </Card>

      {isRefreshing ? (
        <DashboardCardSkeletonGrid count={mechanicDashboardCards.length} />
      ) : (
      <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
        {mechanicDashboardCards.map(({ color, icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-4">
              <span className={`grid size-12 shrink-0 place-items-center rounded-lg ${color}`}>
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-muted-foreground">{label}</p>
                <strong className="mt-2 block text-3xl leading-none">{value}</strong>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {isRefreshing ? (
        <DashboardChartsSkeleton />
      ) : (
        <DashboardCharts {...mechanicCharts} />
      )}

      <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Assigned Work Queue</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              ["Inspect Ford Everest brake system", "High"],
              ["Complete Toyota Vios exterior wash", "Normal"],
              ["Update Montero pending parts record", "Parts"],
            ].map(([label, value]) => (
              <div
                className="flex items-center justify-between gap-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground"
                key={label}
              >
                <span>{label}</span>
                <Badge variant="orange">{value}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList aria-hidden="true" className="size-5 text-primary" />
              Progress Updates
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              ["JO-2026-023 marked completed", "8m ago"],
              ["Suzuki Ertiga moved to detailing", "21m ago"],
              ["Ford Everest repair progress updated", "46m ago"],
            ].map(([label, value]) => (
              <div
                className="flex items-center justify-between gap-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground"
                key={label}
              >
                <span>{label}</span>
                <Badge variant="orange">{value}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default MechanicDashboard
