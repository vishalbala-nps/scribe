import { createClient } from "@/lib/supabase/server"
import TitleBar from "@/components/titlebar"
import { UserMenu } from "@/components/user-menu"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const email = user?.email ?? ""
  const name = user?.user_metadata?.full_name ?? ""

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TitleBar>
        <UserMenu email={email} name={name} />
      </TitleBar>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
