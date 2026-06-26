import { useEffect, useRef, useState } from "react"
import type { FormEvent } from "react"
import {
  ArrowLeft,
  Check,
  ChevronsUpDown,
  Eye,
  EyeOff,
  Home,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Phone,
  Plus,
  Upload,
  UserRound,
  X,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { toast } from "react-toastify"

import { Button } from "@/components/ui/button"
import {
  getLoginErrorMessage,
  registerCustomer,
} from "@/lib/auth"
import type { AuthUser } from "@/lib/auth"

const defaultValidIdTypes = [
  "Driver's License",
  "Passport",
  "PhilHealth ID",
  "Postal ID",
  "PRC ID",
  "SSS ID",
  "UMID",
  "Voter's ID",
]

type RegisterProps = {
  onLogin: (destinationRoute: string, user: AuthUser) => void
  onNavigate: (route: string) => void
}

function Register({ onNavigate }: RegisterProps) {
  const [address, setAddress] = useState("")
  const [email, setEmail] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
  const [username, setUsername] = useState("")
  const [validIdFile, setValidIdFile] = useState<File | null>(null)
  const [validIdOptions, setValidIdOptions] = useState(defaultValidIdTypes)
  const [validIdType, setValidIdType] = useState("")
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const clearFieldError = (field: string) => {
    setFieldErrors((current) => {
      if (!current[field]) {
        return current
      }

      const nextErrors = { ...current }
      delete nextErrors[field]
      return nextErrors
    })
  }

  const generatePassword = () => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"
    const symbols = "!@#$%&*"
    const generatedPassword = Array.from({ length: 12 }, (_, index) => {
      const source = index % 4 === 0 ? symbols : alphabet
      return source[Math.floor(Math.random() * source.length)]
    }).join("")

    setPassword(generatedPassword)
    setPasswordConfirmation(generatedPassword)
    clearFieldError("password")
    clearFieldError("passwordConfirmation")
    setShowPassword(true)
    setShowPasswordConfirmation(true)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    const nextFieldErrors: Record<string, string> = {}

    if (!name.trim()) {
      nextFieldErrors.name = "Full name is required."
    }

    if (!mobileNumber.trim()) {
      nextFieldErrors.mobileNumber = "Mobile number is required."
    }

    if (!email.trim()) {
      nextFieldErrors.email = "Email address is required."
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextFieldErrors.email = "Enter a valid email address."
    }

    if (!address.trim()) {
      nextFieldErrors.address = "Address is required."
    }

    if (!validIdType.trim()) {
      nextFieldErrors.validIdType = "Valid ID type is required."
    }

    if (!validIdFile) {
      nextFieldErrors.validIdFile = "Upload a valid ID file."
    }

    if (!username.trim()) {
      nextFieldErrors.username = "Username is required."
    }

    if (!password) {
      nextFieldErrors.password = "Password is required."
    }

    if (!passwordConfirmation) {
      nextFieldErrors.passwordConfirmation = "Confirm your password."
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      setError("Please complete all required fields.")
      return
    }

    if (password !== passwordConfirmation) {
      setFieldErrors({
        passwordConfirmation: "Password confirmation does not match.",
      })
      setError("Please review the highlighted field.")
      return
    }

    setFieldErrors({})
    setIsLoading(true)

    try {
      const registration = await registerCustomer({
        address: address.trim(),
        email: email.trim().toLowerCase(),
        mobile_number: mobileNumber.trim(),
        name: name.trim(),
        password,
        password_confirmation: passwordConfirmation,
        username: username.trim(),
        valid_id_file: validIdFile!,
        valid_id_type: validIdType.trim(),
      })
      toast.success(
        registration.message ??
          "Registration submitted. Please wait for admin approval before logging in.",
      )
      onNavigate("login")
    } catch (registerError) {
      setError(getLoginErrorMessage(registerError))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="grid min-h-svh place-items-center bg-background px-4 py-4 pt-[84px] text-foreground lg:py-6 lg:pt-[96px]">
      <form
        className="grid w-full max-w-5xl gap-5 rounded-lg border border-border bg-card p-4 shadow-2xl shadow-foreground/10 sm:p-5 lg:grid-cols-[0.82fr_1.18fr] lg:gap-7 lg:p-6"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col justify-center border-b border-border pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-7">
          <div className="grid size-20 place-items-center lg:size-24">
            <img
              alt="Auto CDO Car Trading logo"
              className="size-full object-contain"
              src="/cdocarlogo.png"
            />
          </div>

          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.13em] text-primary">
            Customer registration
          </p>
          <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">
            Create customer account
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground sm:text-base">
            Register to browse vehicles, reserve units, track payments, and submit service
            requests.
          </p>
        </div>

        <div className="grid content-center gap-4">
          {error ? (
            <p className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm leading-6 text-destructive">
              {error}
            </p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <RegisterField
              error={fieldErrors.name}
              icon={UserRound}
              label="Full Name"
              onChange={(value) => {
                setName(value)
                clearFieldError("name")
              }}
              placeholder="Enter your full name"
              value={name}
            />
            <RegisterField
              error={fieldErrors.mobileNumber}
              icon={Phone}
              label="Mobile Number"
              onChange={(value) => {
                setMobileNumber(value)
                clearFieldError("mobileNumber")
              }}
              placeholder="09XX XXX XXXX"
              type="tel"
              value={mobileNumber}
            />
            <RegisterField
              error={fieldErrors.email}
              icon={Mail}
              label="Email Address"
              onChange={(value) => {
                setEmail(value)
                clearFieldError("email")
              }}
              placeholder="customer@email.com"
              type="email"
              value={email}
            />
            <RegisterField
              error={fieldErrors.address}
              icon={Home}
              label="Address"
              onChange={(value) => {
                setAddress(value)
                clearFieldError("address")
              }}
              placeholder="Enter your complete address"
              value={address}
            />
            <RegisterSelectField
              className="sm:col-span-2"
              error={fieldErrors.validIdType}
              label="Valid ID Type"
              onAddOption={(option) =>
                setValidIdOptions((current) => [...new Set([...current, option])])
              }
              onChange={(value) => {
                setValidIdType(value)
                clearFieldError("validIdType")
              }}
              options={validIdOptions}
              placeholder="Select valid ID type"
              value={validIdType}
            />
            <RegisterFileField
              className="sm:col-span-2"
              error={fieldErrors.validIdFile}
              file={validIdFile}
              label="Upload Valid ID"
              onChange={(file) => {
                setValidIdFile(file)
                clearFieldError("validIdFile")
              }}
            />
            <RegisterField
              error={fieldErrors.username}
              icon={UserRound}
              label="Username"
              onChange={(value) => {
                setUsername(value)
                clearFieldError("username")
              }}
              placeholder="Choose a username"
              value={username}
            />
            <RegisterPasswordField
              action={
                <Button onClick={generatePassword} size="sm" type="button" variant="outline">
                  Generate Password
                </Button>
              }
              error={fieldErrors.password}
              label="Password"
              onChange={(value) => {
                setPassword(value)
                clearFieldError("password")
              }}
              placeholder="At least 8 characters"
              showPassword={showPassword}
              toggleShowPassword={() => setShowPassword((visible) => !visible)}
              value={password}
            />
            <RegisterPasswordField
              className="sm:col-span-2"
              error={fieldErrors.passwordConfirmation}
              label="Confirm Password"
              onChange={(value) => {
                setPasswordConfirmation(value)
                clearFieldError("passwordConfirmation")
              }}
              placeholder="Re-enter password"
              showPassword={showPasswordConfirmation}
              toggleShowPassword={() => setShowPasswordConfirmation((visible) => !visible)}
              value={passwordConfirmation}
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button className="h-11 w-full text-base" disabled={isLoading} type="submit">
              {isLoading ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : null}
              {isLoading ? "Creating account..." : "Register Account"}
            </Button>

            <Button
              className="h-11 w-full"
              onClick={() => onNavigate("login")}
              type="button"
              variant="outline"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back to Login
            </Button>
          </div>
        </div>
      </form>
    </main>
  )
}

function RegisterSelectField({
  className,
  error,
  label,
  onAddOption,
  onChange,
  options,
  placeholder,
  value,
}: {
  className?: string
  error?: string
  label: string
  onAddOption: (value: string) => void
  onChange: (value: string) => void
  options: string[]
  placeholder: string
  value: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [newOption, setNewOption] = useState("")

  const addOption = () => {
    const normalizedOption = newOption.trim()

    if (!normalizedOption) {
      return
    }

    onAddOption(normalizedOption)
    onChange(normalizedOption)
    setNewOption("")
    setIsAdding(false)
    setIsOpen(false)
  }

  return (
    <div className={`relative grid gap-1.5 text-sm font-bold ${className ?? ""}`}>
      <span>{label}</span>
      <Button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="h-11 w-full justify-between"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
        variant="outline"
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronsUpDown aria-hidden="true" className="size-4 opacity-70" />
      </Button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-lg border bg-popover p-2 text-popover-foreground shadow-2xl">
          <div className="grid max-h-48 gap-1 overflow-y-auto" role="listbox">
            {options.map((option) => (
              <button
                aria-selected={value === option}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-bold transition hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                key={option}
                onClick={() => {
                  onChange(option)
                  setIsOpen(false)
                }}
                role="option"
                type="button"
              >
                <span className="flex-1 truncate">{option}</span>
                {value === option ? <Check aria-hidden="true" className="size-4 text-primary" /> : null}
              </button>
            ))}
          </div>

          <div className="mt-2 border-t pt-2">
            {isAdding ? (
              <div className="grid gap-2">
                <input
                  autoFocus
                  className="min-h-9 rounded-md border border-input bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                  onChange={(event) => setNewOption(event.target.value)}
                  placeholder="Enter new valid ID type"
                  value={newOption}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={addOption} size="sm" type="button">
                    <Plus aria-hidden="true" className="size-4" />
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      setIsAdding(false)
                      setNewOption("")
                    }}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <X aria-hidden="true" className="size-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                className="w-full justify-start"
                onClick={() => setIsAdding(true)}
                size="sm"
                type="button"
                variant="outline"
              >
                <Plus aria-hidden="true" className="size-4" />
                Add Entry
              </Button>
            )}
          </div>
        </div>
      ) : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </div>
  )
}

function RegisterFileField({
  className,
  error,
  file,
  label,
  onChange,
}: {
  className?: string
  error?: string
  file: File | null
  label: string
  onChange: (file: File | null) => void
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState("")
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const progressTimerRef = useRef<number | null>(null)
  const previewUrlRef = useRef("")

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current)
      }

      if (previewUrlRef.current) {
        window.URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  const clearSelectedFile = () => {
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current)
      progressTimerRef.current = null
    }

    if (previewUrlRef.current) {
      window.URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = ""
    }

    setPreviewUrl("")
    setProgress(0)
    setIsUploading(false)
    onChange(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFileChange = (nextFile: File | null) => {
    clearSelectedFile()

    if (!nextFile) {
      return
    }

    setIsUploading(true)

    progressTimerRef.current = window.setInterval(() => {
      setProgress((current) => {
        const nextProgress = Math.min(100, current + 20)

        if (nextProgress >= 100) {
          if (progressTimerRef.current) {
            window.clearInterval(progressTimerRef.current)
            progressTimerRef.current = null
          }

          const nextPreviewUrl = window.URL.createObjectURL(nextFile)
          previewUrlRef.current = nextPreviewUrl
          setPreviewUrl(nextPreviewUrl)
          setIsUploading(false)
          onChange(nextFile)
        }

        return nextProgress
      })
    }, 120)
  }

  const isImageFile = Boolean(file?.type.startsWith("image/"))

  return (
    <div className={`grid gap-1.5 text-sm font-bold ${className ?? ""}`}>
      <span>{label}</span>
      <div className="flex min-h-11 items-center gap-3 rounded-lg border border-input bg-background px-3 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
        <Upload aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        <input
          accept="image/*,.pdf"
          className="w-full min-w-0 text-sm font-medium file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-black file:text-primary-foreground"
          onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
          ref={fileInputRef}
          type="file"
        />
      </div>

      {isUploading ? (
        <div className="grid gap-1">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            Uploading valid ID {progress}%
          </span>
        </div>
      ) : null}

      {file && previewUrl ? (
        <div className="relative grid gap-2 rounded-lg border border-border bg-muted p-2 pr-11">
          <button
            aria-label="Remove uploaded valid ID"
            className="absolute right-2 top-2 grid size-7 place-items-center rounded-md border border-border bg-background text-muted-foreground transition hover:border-destructive/40 hover:text-destructive focus-visible:outline-2 focus-visible:outline-primary"
            onClick={clearSelectedFile}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
          {isImageFile ? (
            <img
              alt="Uploaded valid ID preview"
              className="max-h-40 w-full rounded-md object-contain"
              src={previewUrl}
            />
          ) : null}
          <span className="truncate text-xs font-bold text-muted-foreground">{file.name}</span>
        </div>
      ) : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </div>
  )
}

function RegisterField({
  className,
  error,
  icon: Icon,
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  className?: string
  error?: string
  icon: LucideIcon
  label: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
  value: string
}) {
  return (
    <label className={`grid gap-1.5 text-sm font-bold ${className ?? ""}`}>
      <span>{label}</span>
      <div className="flex min-h-11 items-center gap-3 rounded-lg border border-input bg-background px-3 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
        <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
        <input
          className="w-full border-0 bg-transparent font-medium outline-none placeholder:text-muted-foreground"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={type}
          value={value}
        />
      </div>
      {error ? <FieldError>{error}</FieldError> : null}
    </label>
  )
}

function RegisterPasswordField({
  action,
  className,
  error,
  label,
  onChange,
  placeholder,
  showPassword,
  toggleShowPassword,
  value,
}: {
  action?: React.ReactNode
  className?: string
  error?: string
  label: string
  onChange: (value: string) => void
  placeholder: string
  showPassword: boolean
  toggleShowPassword: () => void
  value: string
}) {
  return (
    <label className={`grid gap-1.5 text-sm font-bold ${className ?? ""}`}>
      <span className="flex min-h-8 items-center justify-between gap-3">
        <span>{label}</span>
        {action}
      </span>
      <div className="flex min-h-11 items-center gap-3 rounded-lg border border-input bg-background px-3 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
        <LockKeyhole aria-hidden="true" className="size-4 text-muted-foreground" />
        <input
          className="w-full border-0 bg-transparent font-medium outline-none placeholder:text-muted-foreground"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={showPassword ? "text" : "password"}
          value={value}
        />
        <button
          aria-label={showPassword ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
          onClick={toggleShowPassword}
          type="button"
        >
          {showPassword ? (
            <EyeOff aria-hidden="true" className="size-4" />
          ) : (
            <Eye aria-hidden="true" className="size-4" />
          )}
        </button>
      </div>
      {error ? <FieldError>{error}</FieldError> : null}
    </label>
  )
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-bold text-destructive">{children}</span>
}

export default Register
