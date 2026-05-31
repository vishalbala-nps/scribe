export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-3 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-2xl">
          ✉️
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Check your email</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We&apos;ve sent a verification link to your email address. Click the
          link to activate your account and get started.
        </p>
        <p className="text-xs text-muted-foreground">
          Didn&apos;t receive it? Check your spam folder.
        </p>
      </div>
    </div>
  )
}
