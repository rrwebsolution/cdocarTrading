import { CalendarDays, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const formattedDate = new Intl.DateTimeFormat("en-PH", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
}).format(new Date())

type DashboardHeaderActionsProps = {
  isRefreshing?: boolean
  onRefresh?: () => void
}

function DashboardHeaderActions({
  isRefreshing = false,
  onRefresh,
}: DashboardHeaderActionsProps) {
  return (
    <div className="flex shrink-0 items-center gap-2 max-sm:w-full max-sm:flex-col">
      <div className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-black text-muted-foreground sm:w-auto">
        <CalendarDays aria-hidden="true" className="size-4 text-primary" />
        <time dateTime={new Date().toISOString()}>{formattedDate}</time>
      </div>
      <Button
        className="max-sm:w-full"
        disabled={isRefreshing}
        onClick={onRefresh}
        variant="outline"
      >
        <RefreshCw
          aria-hidden="true"
          className={cn("size-4", isRefreshing && "animate-spin")}
        />
        {isRefreshing ? "Refreshing..." : "Refresh Data"}
      </Button>
    </div>
  )
}

export function DashboardCardSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="size-12 shrink-0 animate-pulse rounded-lg bg-muted" />
            <div className="grid flex-1 gap-3">
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              <div className="h-8 w-20 animate-pulse rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function DashboardChartsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4 max-xl:grid-cols-1">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="grid gap-4 p-6">
            <div className="h-6 w-44 animate-pulse rounded bg-muted" />
            <div className="h-4 w-64 max-w-full animate-pulse rounded bg-muted" />
            <div className="h-64 animate-pulse rounded-lg bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default DashboardHeaderActions
