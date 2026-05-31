"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LoginModal } from "@/components/login-modal"
import { SignUpDialog } from "@/components/signup-dialog"
import TitleBar from "@/components/titlebar"
export default function Page() {
  const [showLogin, setShowLogin] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)

  return (
    <div className="flex min-h-svh flex-col">
      {/* Nav */}
      <TitleBar>
        <Button onClick={() => setShowLogin(true)}>Sign in</Button>
      </TitleBar>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="space-y-3 max-w-lg">
          <h1 className="text-4xl font-semibold tracking-tight">
            Your thoughts, organized.
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            A simple, fast place to capture ideas, write notes, and stay on top
            of what matters — from any device.
          </p>
        </div>
        <div className="flex gap-3">
          <Button size="lg" onClick={() => setShowLogin(true)}>
            Get started
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} My Notes
      </footer>

      <LoginModal
        open={showLogin}
        onOpenChange={setShowLogin}
        onSignUpClick={() => setShowSignUp(true)}
      />
      <SignUpDialog
        open={showSignUp}
        onOpenChange={setShowSignUp}
        onSignInClick={() => setShowLogin(true)}
      />
    </div>
  )
}
