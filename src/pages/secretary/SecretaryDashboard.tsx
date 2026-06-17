import { useState } from "react"
import { BadgeDollarSign, CalendarCheck, Car, Users } from "lucide-react"

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

const secretaryCards = [
  {
    color: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-200",
    icon: Car,
    label: "Available Vehicles",
    value: "82",
  },
  {
    color: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-200",
    icon: Users,
    label: "Customer Records",
    value: "326",
  },
  {
    color: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200",
    icon: CalendarCheck,
    label: "Pending Reservations",
    value: "11",
  },
  {
    color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200",
    icon: BadgeDollarSign,
    label: "Payments Today",
    value: "PHP 420K",
  },
]

const secretaryCharts = {
  bar: {
    description: "Daily front office transactions this week.",
    items: [
      { label: "Mon", value: 18 },
      { label: "Tue", value: 24 },
      { label: "Wed", value: 20 },
      { label: "Thu", value: 29 },
      { label: "Fri", value: 34 },
      { label: "Sat", value: 22 },
    ],
    title: "Processed Transactions",
  },
  pie: {
    description: "Reservation workload by current status.",
    items: [
      { color: "#f59e0b", label: "For Approval", value: 11 },
      { color: "#10b981", label: "Approved", value: 34 },
      { color: "#ef4444", label: "Cancelled", value: 4 },
    ],
    title: "Reservation Status",
  },
  radar: {
    description: "Front office activity health score.",
    items: [
      { label: "Vehicles", value: 84 },
      { label: "Customers", value: 92 },
      { label: "Reservations", value: 78 },
      { label: "Payments", value: 86 },
      { label: "Reports", value: 74 },
    ],
    title: "Office Performance",
  },
}

function SecretaryDashboard() {
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
              Secretary Dashboard
            </p>
            <CardTitle className="text-3xl font-black tracking-normal max-sm:text-2xl">
              Front Office Operations
            </CardTitle>
            <CardDescription className="mt-3 max-w-3xl leading-7">
              Handle vehicle updates, customer inquiries, reservations, sales
              payments, receipts, and daily reports in one workspace.
            </CardDescription>
          </div>
          <DashboardHeaderActions
            isRefreshing={isRefreshing}
            onRefresh={refreshData}
          />
        </CardHeader>
      </Card>

      {isRefreshing ? (
        <DashboardCardSkeletonGrid count={secretaryCards.length} />
      ) : (
      <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
        {secretaryCards.map(({ color, icon: Icon, label, value }) => (
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
        <DashboardCharts {...secretaryCharts} />
      )}

      <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Today's Tasks</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              ["Process 11 pending reservations", "High"],
              ["Update 9 vehicle records", "Normal"],
              ["Generate payment collection report", "Report"],
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
            <CardTitle>Recent Front Desk Activity</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              ["Customer inquiry registered for SUV unit", "5m ago"],
              ["Receipt OR-10293 generated", "19m ago"],
              ["Reservation RSV-2042 approved", "42m ago"],
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

export default SecretaryDashboard
