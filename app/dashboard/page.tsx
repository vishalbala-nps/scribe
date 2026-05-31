import { createClient } from "@/lib/supabase/server"
import TitleBar from "@/components/titlebar"
import { UserMenu } from "@/components/user-menu"
import DashboardPage from "./dashboardPage"
import { SidebarProvider } from "@/lib/sidebar-context"
import { Note } from "@/lib/types"

export default async function DashboardLayout() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email ?? ""
  const name = user?.user_metadata?.full_name ?? ""
  const avatarUrl = user?.user_metadata?.avatar_url ?? ""

  const { data } = await supabase.from("Notes").select("*").order('created_at', { ascending: false })

  return (
    <SidebarProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <TitleBar showSidebarToggle>
          <UserMenu email={email} name={name} avatarUrl={avatarUrl} />
        </TitleBar>
        <main className="relative flex-1 overflow-hidden">
          <DashboardPage initialNotes={data as Array<Note>} />
        </main>
      </div>
    </SidebarProvider>
  )
}
