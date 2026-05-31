"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { toast } from 'sonner'

interface SignUpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSignInClick: () => void
}

export function SignUpDialog({ open, onOpenChange, onSignInClick }: SignUpDialogProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()

    if (password !== confirm) {
      toast.error("Passwords do not match")
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })


    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    onOpenChange(false)
    toast.success("Check your email — we've sent a verification link to activate your account")
    setLoading(false)
    setName("")
    setEmail("")
    setPassword("")
    setConfirm("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Create an account</DialogTitle>
          <DialogDescription>Start capturing your notes today</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="signup-name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="signup-name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="signup-email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="signup-password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="signup-confirm" className="text-sm font-medium">
              Confirm password
            </label>
            <input
              id="signup-confirm"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>


          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            onClick={() => { onOpenChange(false); onSignInClick() }}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </button>
        </p>
      </DialogContent>
    </Dialog>
  )
}
