import { useState } from "react"
import type { FormEvent } from "react"
import { ArrowLeft, LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react"
import { toast } from "react-toastify"

import { Button } from "@/components/ui/button"
import {
  type AuthUser,
  getLoginErrorMessage,
  getRouteForRole,
  registerCustomer,
  saveAuthSession,
} from "@/lib/auth"

type RegisterProps = {
  onLogin: (destinationRoute: string, user: AuthUser) => void
  onNavigate: (route: string) => void
}

function Register({ onLogin, onNavigate }: RegisterProps) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (!name.trim() || !email.trim() || !password || !passwordConfirmation) {
      setError("Please complete all registration fields.")
      return
    }

    if (password !== passwordConfirmation) {
      setError("Password confirmation does not match.")
      return
    }

    setIsLoading(true)

    try {
      const auth = await registerCustomer({
        email: email.trim().toLowerCase(),
        name: name.trim(),
        password,
        password_confirmation: passwordConfirmation,
      })
      saveAuthSession(auth, true)
      toast.success(`Welcome, ${auth.user.name}.`)
      onLogin(getRouteForRole(auth.user.role?.name), auth.user)
    } catch (registerError) {
      setError(getLoginErrorMessage(registerError))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="grid min-h-svh place-items-center bg-background px-4 pt-[68px] text-foreground">
      <form
        className="w-full max-w-[520px] rounded-lg border border-border bg-card p-6 shadow-2xl shadow-foreground/10 sm:p-8"
        onSubmit={handleSubmit}
      >
        <div className="mx-auto mb-6 grid size-28 place-items-center">
          <img
            alt="Auto CDO Car Trading logo"
            className="size-full object-contain"
            src="/cdocarlogo.png"
          />
        </div>

        <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.13em] text-primary">
          Customer registration
        </p>
        <h1 className="text-3xl font-black">Create customer account</h1>
        <p className="mt-3 leading-7 text-muted-foreground">
          Register to browse vehicles, reserve units, track payments, and submit service requests.
        </p>

        {error ? (
          <p className="mt-5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm leading-6 text-destructive">
            {error}
          </p>
        ) : null}

        <RegisterField
          icon={UserRound}
          label="Full Name"
          onChange={setName}
          placeholder="Enter your full name"
          value={name}
        />
        <RegisterField
          icon={Mail}
          label="Email Address"
          onChange={setEmail}
          placeholder="customer@email.com"
          type="email"
          value={email}
        />
        <RegisterField
          icon={LockKeyhole}
          label="Password"
          onChange={setPassword}
          placeholder="At least 8 characters"
          type="password"
          value={password}
        />
        <RegisterField
          icon={LockKeyhole}
          label="Confirm Password"
          onChange={setPasswordConfirmation}
          placeholder="Re-enter password"
          type="password"
          value={passwordConfirmation}
        />

        <Button className="mt-5 h-12 w-full text-base" disabled={isLoading} type="submit">
          {isLoading ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : null}
          {isLoading ? "Creating account..." : "Register Account"}
        </Button>

        <Button
          className="mt-3 w-full"
          onClick={() => onNavigate("login")}
          type="button"
          variant="outline"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to Login
        </Button>
      </form>
    </main>
  )
}

function RegisterField({
  icon: Icon,
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  icon: typeof UserRound
  label: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
  value: string
}) {
  return (
    <label className="mt-4 grid gap-2 text-sm font-bold">
      <span>{label}</span>
      <div className="flex min-h-12 items-center gap-3 rounded-lg border border-input bg-background px-3 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
        <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
        <input
          className="w-full border-0 bg-transparent font-medium outline-none placeholder:text-muted-foreground"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={type}
          value={value}
        />
      </div>
    </label>
  )
}

export default Register
