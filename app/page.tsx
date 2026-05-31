"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LoginModal } from "@/components/login-modal"
import { SignUpDialog } from "@/components/signup-dialog"
import TitleBar from "@/components/titlebar"
import { Save, Star, Search, Zap } from "lucide-react"

const features = [
  {
    icon: Save,
    title: "Auto-saves as you type",
    description: "Never lose a thought. Your notes are saved automatically in the background.",
  },
  {
    icon: Star,
    title: "Star what matters",
    description: "Pin important notes to the top so they're always within reach.",
  },
  {
    icon: Zap,
    title: "Fast and minimal",
    description: "No clutter, no distractions. Just you and your notes.",
  },
]

export default function Page() {
  const [showLogin, setShowLogin] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)

  return (
    <div className="flex min-h-svh flex-col">
      <TitleBar>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setShowLogin(true)}>Sign in</Button>
          <Button onClick={() => setShowSignUp(true)}>Get started</Button>
        </div>
      </TitleBar>

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-20 text-center">
          <div className="space-y-4 max-w-xl">
            <h1 className="text-5xl font-semibold tracking-tight leading-tight sm:text-6xl">
              Your thoughts,{" "}
              <span className="text-muted-foreground">organized.</span>
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed max-w-md mx-auto">
              Scribe is a clean, distraction-free notes app that saves as you type.
              Sign in with Google or email and start writing in seconds.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" onClick={() => setShowSignUp(true)}>
              Start writing for free
            </Button>
            <Button size="lg" variant="outline" onClick={() => setShowLogin(true)}>
              Sign in
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border bg-muted/30 px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-10">
              Everything you need, nothing you don&apos;t
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <div key={title} className="rounded-xl border border-border bg-background p-5 space-y-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-4 text-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Scribe
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
