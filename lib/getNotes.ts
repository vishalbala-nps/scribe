import { createClient } from "@/lib/supabase/server"
import { buildFolderTree } from "@/lib/tree"
import type { Folder, FolderNode, Note } from "@/lib/types"

export default async function getNotes(): Promise<{
  notes: Note[]
  folders: Folder[]
  tree: FolderNode[]
}> {
  const supabase = await createClient()

  const [{ data: notes }, { data: folders }] = await Promise.all([
    supabase.from("Notes").select("*").order("created_at", { ascending: false }),
    supabase.from("Folders").select("*").order("name"),
  ])

  const safeNotes = (notes ?? []) as Note[]
  const safeFolders = (folders ?? []) as Folder[]

  return {
    notes: safeNotes,
    folders: safeFolders,
    tree: buildFolderTree(safeFolders),
  }
}
