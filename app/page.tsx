"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LoginModal } from "@/components/login-modal"
import { SignUpDialog } from "@/components/signup-dialog"
import TitleBar from "@/components/titlebar"
import { Save, Star, Code2, Image, Folder, FileDown, Moon } from "lucide-react"

const features = [
  {
    icon: Save,
    title: "Auto-saves as you type",
    description: "Never lose a thought. Your notes are saved automatically in the background.",
  },
  {
    icon: Star,
    title: "Pin what matters",
    description: "Star important notes to keep them pinned at the top of your list.",
  },
  {
    icon: Folder,
    title: "Organize with folders",
    description: "Group notes into nested folders. Right-click for quick actions on any note or folder.",
  },
  {
    icon: Code2,
    title: "Rich text & code",
    description: "Full markdown editor with headings, lists, tables, blockquotes, and syntax-highlighted code blocks.",
  },
  {
    icon: Image,
    title: "Images & links",
    description: "Embed images via URL or upload, and insert inline hyperlinks — all from the toolbar.",
  },
  {
    icon: FileDown,
    title: "Download & import",
    description: "Export any note as a .md file or import existing Markdown files as new notes.",
  }
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        Built by{" "}
        <a
          href="https://github.com/vishalbala-nps"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          Vishal Balasubramanian
        </a>
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
