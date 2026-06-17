import { useState } from "react"
import { BadgeDollarSign } from "lucide-react"

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

import { customerDashboardCards } from "./customerData"

const customerCharts = {
  bar: {
    description: "Vehicle browsing activity in the customer portal.",
    items: [
      { label: "Mon", value: 4 },
      { label: "Tue", value: 7 },
      { label: "Wed", value: 6 },
      { label: "Thu", value: 9 },
      { label: "Fri", value: 12 },
      { label: "Sat", value: 8 },
    ],
    title: "Viewed Vehicles",
  },
  pie: {
    description: "Customer account activity distribution.",
    items: [
      { color: "#2563eb", label: "Browsed", value: 12 },
      { color: "#f59e0b", label: "Reserved", value: 2 },
      { color: "#10b981", label: "Paid", value: 3 },
      { color: "#06b6d4", label: "Saved", value: 5 },
    ],
    title: "Portal Activity",
  },
  radar: {
    description: "Customer progress from browsing to payment.",
    items: [
      { label: "Profile", value: 95 },
      { label: "Browse", value: 88 },
      { label: "Reserve", value: 62 },
      { label: "Payment", value: 70 },
      { label: "History", value: 82 },
    ],
    title: "Account Progress",
  },
}

function CustomerDashboard() {
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
              Customer Portal
            </p>
            <CardTitle className="text-3xl font-black tracking-normal max-sm:text-2xl">
              Vehicle Shopping Dashboard
            </CardTitle>
            <CardDescription className="mt-3 max-w-3xl leading-7">
              Browse vehicles, manage your profile, reserve preferred units,
              review payment history, and monitor balances.
            </CardDescription>
          </div>
          <DashboardHeaderActions
            isRefreshing={isRefreshing}
            onRefresh={refreshData}
          />
        </CardHeader>
      </Card>

      {isRefreshing ? (
        <DashboardCardSkeletonGrid count={customerDashboardCards.length} />
      ) : (
      <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
        {customerDashboardCards.map(({ color, icon: Icon, label, value }) => (
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
        <DashboardCharts {...customerCharts} />
      )}

      <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Reservation Updates</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              ["Honda Civic reservation is for approval", "Pending"],
              ["Toyota Fortuner reservation approved", "Approved"],
              ["Suzuki Ertiga reservation expiring soon", "Alert"],
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
              <BadgeDollarSign aria-hidden="true" className="size-5 text-primary" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              ["Total paid across transactions", "PHP 450K"],
              ["Remaining balance to monitor", "PHP 730K"],
              ["Proof of payment pending review", "1"],
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

export default CustomerDashboard
