import { useEffect, useMemo, useState } from "react"
import {
  Bell,
  Check,
  Clock,
  HelpCircle,
  LogOut,
  Maximize2,
  Minimize2,
  Monitor,
  Moon,
  Settings,
  Sun,
  UserRound,
  Wifi,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ThemeMode = "light" | "dark" | "system"

type AppHeaderProps = {
  activeRoute?: string
  isAuthenticated: boolean
  onLogout: () => void
  profileName?: string
  theme: ThemeMode
  onThemeChange: (theme: ThemeMode) => void
}

const profileCommands = [
  { description: "View account information", icon: UserRound, label: "Profile" },
  { description: "Manage account preferences", icon: Settings, label: "Settings" },
] as const

const themeOptions = [
  { icon: Sun, label: "Light Mode", value: "light" },
  { icon: Moon, label: "Dark Mode", value: "dark" },
  { icon: Monitor, label: "System", value: "system" },
] as const

const initialNotifications: { id: number; label: string; read: boolean; type: string }[] = []

const routeLabels: Record<string, string> = {
  admin: "Admin",
  customer: "Customer",
  dashboard: "Dashboard",
  "job-orders": "Job Orders",
  "job-orders-maintenance": "Job Orders",
  mechanic: "Mechanic & Carwasher",
  payments: "Payments",
  profile: "History",
  reports: "Reports",
  reservations: "Reservations",
  "role-management": "Role Management",
  secretary: "Secretary",
  "sales-payments": "Sales & Payments",
  "service-requests": "Service Requests",
  staff: "Staff",
  "user-management": "User Management",
  vehicles: "Vehicles",
  "vehicle-status": "Vehicle Status",
  customers: "Customers",
}

function getBreadcrumb(route = "login") {
  return route
    .split("/")
    .filter(Boolean)
    .map((segment) => routeLabels[segment] ?? segment.replace(/-/g, " "))
}

function AppHeader({
  activeRoute = "login",
  isAuthenticated,
  onLogout,
  profileName = "User",
  theme,
  onThemeChange,
}: AppHeaderProps) {
  const [now, setNow] = useState(() => new Date())
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isThemeOpen, setIsThemeOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const breadcrumb = getBreadcrumb(activeRoute)
  const unreadNotifications = notifications.filter((notification) => !notification.read).length

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement))

    document.addEventListener("fullscreenchange", syncFullscreen)

    return () => document.removeEventListener("fullscreenchange", syncFullscreen)
  }, [])

  const formattedTime = useMemo(
    () =>
      new Intl.DateTimeFormat("en-PH", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(now),
    [now],
  )
  const closeMenus = () => {
    setIsHelpOpen(false)
    setIsNotificationsOpen(false)
    setIsProfileOpen(false)
    setIsThemeOpen(false)
  }

  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor
  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return
    }

    await document.documentElement.requestFullscreen()
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex min-h-[68px] items-center justify-between gap-4 border-b border-border bg-background/85 px-4 py-3 text-foreground shadow-lg shadow-foreground/5 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <img
          alt="Auto CDO logo"
          className="size-[34px] rounded-full border-2 border-primary/70 object-cover shadow-md shadow-foreground/10 sm:size-[42px]"
          src="/cdocarlogo.png"
        />
        <div className="min-w-0">
          <span className="block max-w-32 truncate text-sm font-black sm:max-w-none sm:text-base">
            CDO Car Trading IMS
          </span>
          {isAuthenticated ? (
            <nav
              aria-label="Breadcrumb"
              className="hidden items-center gap-1 text-xs font-bold text-muted-foreground md:flex"
            >
              {breadcrumb.map((item, index) => (
                <span className="inline-flex items-center gap-1" key={`${item}-${index}`}>
                  {index > 0 ? <span>/</span> : null}
                  <span className={index === breadcrumb.length - 1 ? "text-primary" : ""}>
                    {item}
                  </span>
                </span>
              ))}
            </nav>
          ) : null}
        </div>
      </div>

      <div className="ml-auto flex items-center justify-end gap-2 sm:gap-3">
        {isAuthenticated ? (
          <>
            <div className="hidden min-h-[38px] items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-black text-emerald-600 dark:text-emerald-300 md:inline-flex">
              <Wifi aria-hidden="true" className="size-4" />
              Online
            </div>

            <div className="relative">
              <Button
                aria-expanded={isNotificationsOpen}
                aria-haspopup="menu"
                aria-label="Open notifications"
                className="relative h-9 px-2 sm:h-[38px] sm:px-3"
                onClick={() => {
                  const shouldOpen = !isNotificationsOpen
                  closeMenus()
                  setIsNotificationsOpen(shouldOpen)
                }}
                type="button"
                variant="outline"
              >
                <Bell aria-hidden="true" className="size-4" />
                {unreadNotifications > 0 ? (
                  <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-black text-primary-foreground">
                    {unreadNotifications}
                  </span>
                ) : null}
              </Button>

              {isNotificationsOpen ? (
                <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-xl">
                  <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                    <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                      Notifications
                    </p>
                    <button
                      className="text-xs font-black text-primary hover:underline"
                      onClick={() =>
                        setNotifications((current) =>
                          current.map((notification) => ({
                            ...notification,
                            read: true,
                          })),
                        )
                      }
                      type="button"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="grid gap-1 p-2">
                    {notifications.map((notification) => (
                      <button
                        className={cn(
                          "flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left transition hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                          !notification.read && "bg-primary/5",
                        )}
                        key={notification.id}
                        onClick={() =>
                          setNotifications((current) =>
                            current.map((item) =>
                              item.id === notification.id
                                ? { ...item, read: true }
                                : item,
                            ),
                          )
                        }
                        type="button"
                      >
                        <span className="text-sm font-bold">{notification.label}</span>
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-black text-primary">
                          {notification.type}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <Button
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              className="hidden h-9 px-2 sm:h-[38px] sm:px-3 md:inline-flex"
              onClick={() => void toggleFullscreen()}
              type="button"
              variant="outline"
            >
              {isFullscreen ? (
                <Minimize2 aria-hidden="true" className="size-4" />
              ) : (
                <Maximize2 aria-hidden="true" className="size-4" />
              )}
            </Button>

            <div className="relative hidden sm:block">
              <Button
                aria-expanded={isHelpOpen}
                aria-haspopup="dialog"
                aria-label="Open help and about"
                className="h-9 px-2 sm:h-[38px] sm:px-3"
                onClick={() => {
                  const shouldOpen = !isHelpOpen
                  closeMenus()
                  setIsHelpOpen(shouldOpen)
                }}
                type="button"
                variant="outline"
              >
                <HelpCircle aria-hidden="true" className="size-4" />
              </Button>

              {isHelpOpen ? (
                <div className="absolute right-0 top-11 z-50 w-80 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-xl">
                  <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Help / About
                  </p>
                  <h2 className="mt-2 text-sm font-black">
                    Development of a Web and Mobile-Based Inventory and Sales
                    Management System for CDO Car Trading
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Modules include inventory, reservations, sales, payments,
                    job orders, maintenance tracking, and customer service
                    requests.
                  </p>
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        {isAuthenticated ? (
          <div className="relative order-3">
            <Button
              aria-expanded={isProfileOpen}
              aria-haspopup="menu"
              className="h-9 gap-2 px-2 sm:h-[38px] sm:px-3"
              onClick={() => {
                const shouldOpen = !isProfileOpen
                closeMenus()
                setIsProfileOpen(shouldOpen)
              }}
              type="button"
              variant="outline"
            >
              <UserRound aria-hidden="true" className="size-4" />
              <span className="sr-only">Profile menu for {profileName}</span>
            </Button>

            {isProfileOpen ? (
              <div className="absolute right-0 top-11 z-50 w-72 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-xl">
                <div className="border-b px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Signed in as
                  </p>
                  <p className="mt-1 truncate text-sm font-black">{profileName}</p>
                </div>
                <div className="border-b p-2">
                  <p className="px-2 py-1 text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Profile Command
                  </p>
                  <div className="mt-1 grid gap-1" role="menu">
                    {profileCommands.map((command) => {
                      const Icon = command.icon

                      return (
                        <button
                          className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                          key={command.label}
                          onClick={() => setIsProfileOpen(false)}
                          role="menuitem"
                          type="button"
                        >
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                            <Icon aria-hidden="true" className="size-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold">
                              {command.label}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {command.description}
                            </span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="p-2">
                  <button
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-bold text-destructive transition hover:bg-destructive/10 focus-visible:bg-destructive/10 focus-visible:outline-none"
                    onClick={() => {
                      setIsProfileOpen(false)
                      onLogout()
                    }}
                    role="menuitem"
                    type="button"
                  >
                    <LogOut aria-hidden="true" className="size-4" />
                    Logout
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div
          className="order-2 inline-flex min-h-9 items-center gap-2 whitespace-nowrap rounded-lg border border-border bg-card px-2 text-xs font-bold text-muted-foreground sm:order-1 sm:min-h-[38px] sm:px-3 sm:text-sm"
          aria-label={`Current time ${formattedTime}`}
        >
          <Clock aria-hidden="true" className="size-4" />
          <time dateTime={now.toISOString()}>{formattedTime}</time>
        </div>

        <div className="relative order-1 sm:order-2">
          <Button
            aria-expanded={isThemeOpen}
            aria-haspopup="listbox"
            className="h-9 gap-2 px-2 sm:h-[38px] sm:px-3"
            onClick={() => {
              const shouldOpen = !isThemeOpen
              closeMenus()
              setIsThemeOpen(shouldOpen)
            }}
            type="button"
            variant="outline"
            >
              <ThemeIcon aria-hidden="true" className="size-4" />
              <span className="sr-only">
                {themeOptions.find((option) => option.value === theme)?.label}
              </span>
          </Button>

          {isThemeOpen ? (
            <div className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-xl">
              <p className="px-2 py-1 text-xs font-black uppercase tracking-wider text-muted-foreground">
                Theme Command
              </p>
              <div className="mt-1 grid gap-1" role="listbox">
                {themeOptions.map((option) => {
                  const Icon = option.icon

                  return (
                    <button
                      aria-selected={theme === option.value}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                        theme === option.value && "bg-muted",
                      )}
                      key={option.value}
                      onClick={() => {
                        onThemeChange(option.value)
                        setIsThemeOpen(false)
                      }}
                      role="option"
                      type="button"
                    >
                      <Icon aria-hidden="true" className="size-4 text-primary" />
                      <span className="flex-1 text-sm font-bold">{option.label}</span>
                      {theme === option.value ? (
                        <Check aria-hidden="true" className="size-4 text-primary" />
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}

export default AppHeader
