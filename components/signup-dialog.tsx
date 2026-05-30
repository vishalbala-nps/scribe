"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface SignUpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSignInClick: () => void
}

export function SignUpDialog({ open, onOpenChange, onSignInClick }: SignUpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Create an account</DialogTitle>
          <DialogDescription>Start capturing your notes today</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="signup-name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="signup-name"
              type="text"
              placeholder="Your name"
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
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <Button className="w-full" size="lg">Create account</Button>
        </div>

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
