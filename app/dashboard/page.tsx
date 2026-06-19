import { createClient } from "@/lib/supabase/server"
import TitleBar from "@/components/titlebar"
import { UserMenu } from "@/components/user-menu"
import NewDashboard from "./newDashboard"
import { SidebarProvider } from "@/lib/sidebar-context"
import getNotes from "@/lib/getNotes"

export default async function DashboardLayout() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email ?? ""
  const name = user?.user_metadata?.full_name ?? ""
  const avatarUrl = user?.user_metadata?.avatar_url ?? ""

  const { notes, folders } = await getNotes()

  return (
    <SidebarProvider>
      <div className="flex md:h-screen flex-col md:overflow-hidden">
        <TitleBar showSidebarToggle>
          <UserMenu email={email} name={name} avatarUrl={avatarUrl} />
        </TitleBar>
        <main className="relative h-dvh md:h-auto md:flex-1 md:overflow-hidden">
          <NewDashboard initialNotes={notes} initialFolders={folders} />
        </main>
      </div>
    </SidebarProvider>
  )
}
