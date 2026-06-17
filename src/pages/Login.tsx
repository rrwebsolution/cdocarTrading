import { useState } from "react"
import type { FormEvent } from "react"
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react"
import { toast } from "react-toastify"
import Swal from "sweetalert2"

import { Button } from "@/components/ui/button"
import {
  type AuthUser,
  getLoginErrorMessage,
  getRouteForRole,
  isInactiveAccountError,
  loginUser,
  saveAuthSession,
} from "@/lib/auth"

type LoginProps = {
  onLogin: (destinationRoute: string, user: AuthUser) => void
  onNavigate: (route: string) => void
}

const systemTitle = "CDO Car Trading IMS"

const systemSubtitle =
  "Efficiently manage vehicle inventory, sales transactions, reservations, customer records, and maintenance operations through a centralized web and mobile platform."

function Login({ onLogin, onNavigate }: LoginProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail || !password) {
      setError("Please enter your email address and password.")
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.")
      return
    }

    setIsLoading(true)
    try {
      const auth = await loginUser(normalizedEmail, password)
      saveAuthSession(auth, rememberMe)
      toast.success(`Welcome back, ${auth.user.name}.`)
      onLogin(getRouteForRole(auth.user.role?.name), auth.user)
    } catch (loginError) {
      if (isInactiveAccountError(loginError)) {
        await Swal.fire({
          confirmButtonColor: "#ea580c",
          confirmButtonText: "OK",
          icon: "warning",
          text: "Your account is inactive. Please contact the admin.",
          title: "Account inactive",
        })
      }

      setError(getLoginErrorMessage(loginError))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main
      className="grid min-h-svh grid-cols-1 bg-background pt-[68px] text-primary-foreground sm:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)]"
      style={{
        backgroundImage:
          "linear-gradient(120deg, rgba(8, 17, 35, 0.96), rgba(15, 23, 42, 0.78)), url('https://images.unsplash.com/photo-1562141961-b5d1fd9e24e3?auto=format&fit=crop&w=1800&q=85')",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <section
        className="hidden h-[calc(100svh-68px)] items-stretch sm:flex"
        aria-labelledby="system-title"
      >
        <div className="flex w-full flex-col justify-between gap-6 bg-[radial-gradient(circle_at_15%_20%,rgba(234,88,12,0.22),transparent_31rem),linear-gradient(90deg,rgba(2,6,23,0.45),rgba(2,6,23,0.12))] p-8 lg:p-20">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.13em] text-primary">
              Auto CDO Car Trading
            </p>
            <h1
              id="system-title"
              className="text-5xl font-black leading-none tracking-normal lg:text-7xl"
            >
              {systemTitle}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-primary-foreground/80 lg:text-lg">
              {systemSubtitle}
            </p>
          </div>

          <div className="grid w-full max-w-3xl gap-1" aria-hidden="true">
            <div className="grid justify-items-center">
              <img
                alt=""
                className="max-h-[40vh] lg:max-h-[50vh] object-contain"
                src="/cdocarlogo.png"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-primary-foreground/20 bg-background/70 p-4 backdrop-blur-md">
                <strong className="block text-3xl leading-none">148</strong>
                <span className="mt-2 block text-sm leading-5 text-primary-foreground/70">
                  Vehicles Tracked
                </span>
              </div>
              <div className="rounded-lg border border-primary-foreground/20 bg-background/70 p-4 backdrop-blur-md">
                <strong className="block text-3xl leading-none">24/7</strong>
                <span className="mt-2 block text-sm leading-5 text-primary-foreground/70">
                  Web and Mobile Access
                </span>
              </div>
              <div className="rounded-lg border border-primary-foreground/20 bg-background/70 p-4 backdrop-blur-md">
                <strong className="block text-3xl leading-none">8</strong>
                <span className="mt-2 block text-sm leading-5 text-primary-foreground/70">
                  Live Operations
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="grid h-[calc(100svh-68px)] place-items-center bg-background/95 p-4 text-foreground lg:p-12"
        aria-label="Login form"
      >
        <form
          className="w-full max-w-[500px] rounded-lg border border-border bg-card/95 p-5 text-card-foreground shadow-2xl shadow-foreground/10 sm:p-8"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="mx-auto mb-7 grid w-32 h-32 sm:w-40 sm:h-40 place-items-center overflow-hidden">
            <img
              alt="Auto CDO Car Trading logo"
              className="w-full h-full object-contain"
              src="/cdocarlogo.png"
            />
          </div>

          <div>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.13em] text-primary">
              Secure access
            </p>
            <h2 className="text-3xl font-black leading-tight text-foreground">
              Login to your account
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              Enter your account credentials to continue.
            </p>
          </div>

          {error ? (
            <p
              className="mt-5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm leading-6 text-destructive"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <label
            className="mt-4 grid gap-2 text-sm font-bold text-foreground"
            htmlFor="email"
          >
            <span>Email Address</span>
            <div className="flex min-h-13 items-center gap-3 rounded-lg border border-input bg-background px-3 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
              <Mail aria-hidden="true" className="size-4 text-muted-foreground" />
              <input
                className="w-full border-0 bg-transparent font-medium text-foreground outline-none placeholder:text-muted-foreground"
                autoComplete="email"
                id="email"
                inputMode="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@autocdo.com"
                type="email"
                value={email}
              />
            </div>
          </label>

          <label
            className="mt-4 grid gap-2 text-sm font-bold text-foreground"
            htmlFor="password"
          >
            <span>Password</span>
            <div className="flex min-h-13 items-center gap-3 rounded-lg border border-input bg-background px-3 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
              <LockKeyhole aria-hidden="true" className="size-4 text-muted-foreground" />
              <input
                className="w-full border-0 bg-transparent font-medium text-foreground outline-none placeholder:text-muted-foreground"
                autoComplete="current-password"
                id="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </label>

          <div className="my-4 flex items-center justify-between gap-4 text-sm text-muted-foreground">
            <label className="inline-flex items-center gap-2 font-semibold">
              <input
                className="size-4 accent-primary"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                type="checkbox"
              />
              <span>Remember Me</span>
            </label>
            <a
              className="font-extrabold text-primary hover:underline"
              href="#forgot-password"
            >
              Forgot Password?
            </a>
          </div>

          <Button
            className="h-12 w-full text-base"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? (
              <LoaderCircle aria-hidden="true" className="animate-spin" />
            ) : null}
            {isLoading ? "Signing in..." : "Login"}
            {!isLoading ? <ArrowRight aria-hidden="true" /> : null}
          </Button>

          <p aria-live="polite" className="sr-only">
            {isLoading ? "Login request is being processed." : ""}
          </p>

          <p className="mt-5 text-center text-muted-foreground">
            Customer account?{" "}
            <button
              className="font-extrabold text-primary hover:underline"
              onClick={() => onNavigate("register")}
              type="button"
            >
              Register Account
            </button>
          </p>
        </form>
      </section>
    </main>
  )
}

export default Login
