import { useEffect, useState } from "react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import AppHeader, { type ThemeMode } from "@/components/AppHeader"
import {
  type AuthUser,
  clearAuthSession,
  getStoredAuthUser,
  logoutUser,
} from "@/lib/auth"
import Admin from "@/pages/Admin"
import Customer from "@/pages/Customer"
import Login from "@/pages/Login"
import Mechanic from "@/pages/Mechanic"
import Register from "@/pages/Register"
import Secretary from "@/pages/Secretary"

const getCurrentRoute = () => window.location.pathname.replace(/^\/?/, "") || "login"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(
      window.localStorage.getItem("auth_token") ??
        window.sessionStorage.getItem("auth_token"),
    ),
  )
  const [authUser, setAuthUser] = useState<AuthUser | null>(getStoredAuthUser)
  const [isOutletLoading, setIsOutletLoading] = useState(true)
  const [route, setRoute] = useState(getCurrentRoute)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const savedTheme = window.localStorage.getItem("theme")

    if (
      savedTheme === "light" ||
      savedTheme === "dark" ||
      savedTheme === "system"
    ) {
      return savedTheme
    }

    return "dark"
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const applyTheme = () => {
      const shouldUseDark =
        theme === "dark" || (theme === "system" && mediaQuery.matches)

      document.documentElement.classList.toggle("dark", shouldUseDark)
    }

    applyTheme()
    window.localStorage.setItem("theme", theme)
    mediaQuery.addEventListener("change", applyTheme)

    return () => mediaQuery.removeEventListener("change", applyTheme)
  }, [theme])

  useEffect(() => {
    const syncRoute = () => setRoute(getCurrentRoute())

    window.addEventListener("popstate", syncRoute)

    return () => window.removeEventListener("popstate", syncRoute)
  }, [])

  useEffect(() => {
    if (!isOutletLoading) {
      return
    }

    const timer = window.setTimeout(() => setIsOutletLoading(false), 850)

    return () => window.clearTimeout(timer)
  }, [isOutletLoading])

  const navigate = (nextRoute: string) => {
    window.history.pushState(null, "", `/${nextRoute}`)
    setRoute(nextRoute)
  }

  const handleLogin = (destinationRoute: string, user: AuthUser) => {
    setAuthUser(user)
    setIsAuthenticated(true)
    setIsOutletLoading(true)
    navigate(destinationRoute)
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
      toast.success("Logged out successfully.")
    } catch {
      clearAuthSession()
      toast.info("Your session has been cleared.")
    }

    setAuthUser(null)
    setIsAuthenticated(false)
    navigate("login")
  }

  const profileName = authUser?.name ?? (
    route.startsWith("secretary")
      ? "Secretary"
      : route.startsWith("mechanic")
        ? "Mechanic & Carwasher"
        : route.startsWith("customer")
          ? "Customer"
          : "Administrator"
  )
  const profileSubtitle = authUser?.role?.name ?? (
    route.startsWith("secretary")
      ? "Secretary"
      : route.startsWith("mechanic")
        ? "Mechanic & Carwasher"
        : route.startsWith("customer")
          ? "Customer"
          : "Admin"
  )

  const page = isOutletLoading ? (
    <OutletLoader />
  ) : !isAuthenticated && route === "register" ? (
    <Register onLogin={handleLogin} onNavigate={navigate} />
  ) : isAuthenticated ? (
    route.startsWith("secretary") ? (
      <Secretary
        activeRoute={route}
        onLogout={handleLogout}
        onNavigate={navigate}
        profileName={profileName}
        profileSubtitle={profileSubtitle}
        user={authUser}
      />
    ) : route.startsWith("mechanic") ? (
      <Mechanic
        activeRoute={route}
        onLogout={handleLogout}
        onNavigate={navigate}
        profileName={profileName}
        profileSubtitle={profileSubtitle}
        user={authUser}
      />
    ) : route.startsWith("customer") ? (
      <Customer
        activeRoute={route}
        onLogout={handleLogout}
        onNavigate={navigate}
        profileName={profileName}
        profileSubtitle={profileSubtitle}
        user={authUser}
      />
    ) : (
      <Admin
        activeRoute={route}
        onLogout={handleLogout}
        onNavigate={navigate}
        profileName={profileName}
        profileSubtitle={profileSubtitle}
        user={authUser}
      />
    )
  ) : (
    <Login onLogin={handleLogin} onNavigate={navigate} />
  )

  return (
    <>
      <AppHeader
        activeRoute={route}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        profileName={profileName}
        onThemeChange={setTheme}
        theme={theme}
      />
      {page}
      <ToastContainer
        autoClose={2500}
        newestOnTop
        pauseOnFocusLoss={false}
        position="top-right"
        theme={theme === "dark" ? "dark" : "light"}
      />
    </>
  )
}

function OutletLoader() {
  return (
    <main className="grid min-h-svh place-items-center bg-background pt-[68px] text-foreground">
      <div className="grid justify-items-center gap-4">
        <div aria-label="Loading dashboard" className="outlet-loader" />
        <p className="text-sm font-bold text-muted-foreground">
          Loading workspace...
        </p>
      </div>
    </main>
  )
}

export default App
