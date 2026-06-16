import TitleBar from "@/components/titlebar"
import Link from "next/link"

export const metadata = { title: "Privacy Policy — Scribe" }

export default function PrivacyPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <TitleBar />

      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-2xl space-y-10">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: June 16, 2026</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">1. What we collect</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When you sign in, we collect your name and email address from your Google account or
              the email you register with. We store the notes and folders you create.
              We do not collect analytics, tracking data, or any information beyond what is
              necessary to provide the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">2. How we use your data</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your data is used solely to provide Scribe&apos;s features — authenticating you,
              storing your notes, and syncing them across your devices. We do not sell, rent,
              or share your personal information with third parties for marketing purposes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">3. Data storage</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your notes and account information are stored securely using Supabase, which is
              hosted on AWS infrastructure. Data is encrypted in transit (TLS) and at rest.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">4. Images</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Images you upload within notes are stored in a private Supabase Storage bucket
              and are only accessible to you when authenticated.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">5. Third-party services</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use Google OAuth for sign-in. By choosing to sign in with Google, your
              authentication is handled by Google and subject to{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Google&apos;s Privacy Policy
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">6. Data deletion</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You may delete your account and all associated data at any time directly from
              your account settings. Deletion is immediate and permanent — we do not retain
              your notes or personal information after your account is removed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">7. Changes to this policy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update this policy from time to time. Changes will be posted on this page
              with an updated date. Continued use of Scribe after changes constitutes acceptance
              of the revised policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">8. Contact</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Questions about this policy? Email us at{" "}
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
        <Link href="/terms" className="underline underline-offset-2 hover:text-foreground transition-colors">
          Terms of Service
        </Link>
      </footer>
    </div>
  )
}
