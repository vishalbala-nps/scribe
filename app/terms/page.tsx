import TitleBar from "@/components/titlebar"
import Link from "next/link"

export const metadata = { title: "Terms of Service — Scribe" }

export default function TermsPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <TitleBar />

      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-2xl space-y-10">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last updated: June 16, 2026</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">1. Acceptance</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By creating an account or using Scribe, you agree to these Terms of Service.
              If you do not agree, please do not use the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">2. Use of the service</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Scribe is a personal note-taking application. You may use it to create, store,
              and organise your own notes. You may not use Scribe to store or distribute
              unlawful, harmful, or infringing content. We reserve the right to suspend
              accounts that violate these terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">3. Your content</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You retain full ownership of the notes and content you create in Scribe.
              By using the service, you grant us a limited licence to store and display your
              content solely for the purpose of providing the service to you.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">4. Account responsibility</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You are responsible for maintaining the security of your account. Do not share
              your credentials with others. You are responsible for all activity that occurs
              under your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">5. Availability</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We strive to keep Scribe available at all times but do not guarantee uninterrupted
              access. We may perform maintenance or updates that temporarily affect availability.
              We are not liable for any loss resulting from downtime.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">6. Limitation of liability</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Scribe is provided &quot;as is&quot; without warranties of any kind. To the fullest extent
              permitted by law, we are not liable for any indirect, incidental, or consequential
              damages arising from your use of the service, including loss of data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">7. Termination</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You may stop using Scribe and request account deletion at any time. We may
              terminate or suspend your access if you violate these terms, with or without
              prior notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">8. Changes to these terms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may revise these terms at any time. Updated terms will be posted on this page.
              Continued use of Scribe after changes are posted constitutes your acceptance of
              the revised terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">9. Contact</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Questions about these terms? Email us at{" "}
              <a
                href="mailto:vishalbalaprojects@gmail.com"
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                vishalbalaprojects@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
        <Link href="/" className="underline underline-offset-2 hover:text-foreground transition-colors">
          Back to Scribe
        </Link>
        {" · "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">
          Privacy Policy
        </Link>
      </footer>
    </div>
  )
}
