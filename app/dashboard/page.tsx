import { createClient } from "@/lib/supabase/server"
import TitleBar from "@/components/titlebar"
import { UserMenu } from "@/components/user-menu"
import DashboardPage from "./dashboardPage"
import { Note } from "@/lib/types"
export default async function DashboardLayout() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email ?? ""
  const name = user?.user_metadata?.full_name ?? ""

  const { data,error } = await supabase.from("Notes").select("*")

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TitleBar>
        <UserMenu email={email} name={name} />
      </TitleBar>
      <main className="flex-1 overflow-hidden">
        <DashboardPage initialNotes={data as Array<Note>} />
      </main>
    </div>
  )
}
