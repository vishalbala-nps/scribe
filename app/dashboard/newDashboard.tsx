"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Plus, Search, FileText, Trash2, Star, Loader2, Save,
  Folder as FolderIcon, ChevronLeft, FolderPlus,
} from "lucide-react"
import type { Note, Folder } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useSidebar } from "@/lib/sidebar-context"
import { buildFolderTree } from "@/lib/tree"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  ContextMenu, ContextMenuContent, ContextMenuItem,
  ContextMenuSeparator, ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { NoteListItem } from "@/components/note-list-item"
import { FolderTreeItem } from "@/components/folder-tree-item"

const AUTO_SAVE_DELAY = 2000

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function groupNotesByDate(notes: Note[]): { label: string; notes: Note[] }[] {
  const today = startOfDay(new Date())
  const yesterday = new Date(today.getTime() - 86400000)
  const sevenDaysAgo = new Date(today.getTime() - 7 * 86400000)
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 86400000)

  const groups: { label: string; notes: Note[] }[] = [
    { label: "Today", notes: [] },
    { label: "Yesterday", notes: [] },
    { label: "Previous 7 Days", notes: [] },
    { label: "Previous 30 Days", notes: [] },
    { label: "Older", notes: [] },
  ]

  for (const note of notes) {
    const d = startOfDay(new Date(note.created_at))
    if (d >= today) groups[0].notes.push(note)
    else if (d >= yesterday) groups[1].notes.push(note)
    else if (d >= sevenDaysAgo) groups[2].notes.push(note)
    else if (d >= thirtyDaysAgo) groups[3].notes.push(note)
    else groups[4].notes.push(note)
  }

  return groups.filter(g => g.notes.length > 0)
}

export default function NewDashboard({
  initialNotes,
  initialFolders,
}: {
  initialNotes: Note[]
  initialFolders: Folder[]
}) {
  const supabase = createClient()
  const [notes, setNotes] = useState(initialNotes)
  const [folders, setFolders] = useState(initialFolders)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [pinningId, setPinningId] = useState<number | null>(null)
  const [deletingFolderId, setDeletingFolderId] = useState<number | null>(null)
  const [folderDialogOpen, setFolderDialogOpen] = useState(false)
  const [folderDialogParentId, setFolderDialogParentId] = useState<number | null>(null)
  const [newFolderName, setNewFolderName] = useState("")
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const { open: sidebarOpen, toggle: toggleSidebar } = useSidebar()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingSaveRef = useRef<{ id: number; patch: Partial<Note> } | null>(null)

  const tree = useMemo(() => buildFolderTree(folders), [folders])

  const noteCounts = useMemo(() => {
    const counts = new Map<number, number>()
    for (const note of notes) {
      if (note.folder !== null) {
        counts.set(note.folder, (counts.get(note.folder) ?? 0) + 1)
      }
    }
    return counts
  }, [notes])

  const folderMap = useMemo(() => {
    const map = new Map<number, string>()
    for (const f of folders) map.set(f.id, f.name)
    return map
  }, [folders])

  const selected = notes.find(n => n.id === selectedId)

  const filtered = notes.filter(n => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
    const matchesFolder = selectedFolderId === null || n.folder === selectedFolderId
    return matchesSearch && matchesFolder
  })

  const pinnedNotes = filtered.filter(n => n.pinned)
  const unpinnedNotes = filtered.filter(n => !n.pinned)
  const grouped = useMemo(() => groupNotesByDate(unpinnedNotes), [unpinnedNotes])

  const listTitle = selectedFolderId === null
    ? "All Notes"
    : (folderMap.get(selectedFolderId) ?? "Notes")

  useEffect(() => {
    const pending = pendingSaveRef.current
    if (pending) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      pendingSaveRef.current = null
      supabase.from("Notes").update(pending.patch).eq("id", pending.id)
        .then(({ error }) => { if (error) toast.error("Failed to save note") })
    }
    setIsDirty(false)
    setIsSaving(false)
  }, [selectedId])

  function selectFolder(id: number | null) {
    setSelectedFolderId(id)
    if (window.innerWidth >= 768) {
      const first = notes.filter(n => id === null || n.folder === id)[0]
      setSelectedId(first?.id ?? null)
    } else {
      setSelectedId(null)
      if (sidebarOpen) toggleSidebar()
    }
  }

  function selectNote(id: number) {
    setSelectedId(id)
    if (window.innerWidth < 768 && sidebarOpen) toggleSidebar()
  }

  async function addNote(inFolder?: number | null) {
    const folder = inFolder !== undefined ? inFolder : selectedFolderId
    setIsAdding(true)
    const { data, error } = await supabase
      .from("Notes")
      .insert({ folder })
      .select()
      .single()
    setIsAdding(false)
    if (error || !data) { toast.error("Failed to create note"); return }
    setNotes(prev => [data, ...prev])
    setSelectedId(data.id)
  }

  function updateSelected(patch: Partial<Note>) {
    setNotes(prev => prev.map(n => n.id === selectedId ? { ...n, ...patch } : n))
    setIsDirty(true)
    if (selectedId !== null) {
      pendingSaveRef.current = {
        id: selectedId,
        patch: { ...(pendingSaveRef.current?.patch ?? {}), ...patch },
      }
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(executeSave, AUTO_SAVE_DELAY)
  }

  async function executeSave() {
    const pending = pendingSaveRef.current
    if (!pending) return
    pendingSaveRef.current = null
    const now = new Date().toISOString()
    const patch = { ...pending.patch, created_at: now }
    setIsSaving(true)
    const { error } = await supabase.from("Notes").update(patch).eq("id", pending.id)
    setIsSaving(false)
    if (error) {
      toast.error("Failed to save note")
      pendingSaveRef.current = pending
      setIsDirty(true)
      return
    }
    setNotes(prev => prev.map(n => n.id === pending.id ? { ...n, created_at: now } : n))
    setIsDirty(false)
  }

  async function saveNow() {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    await executeSave()
  }

  async function deleteNote(id: number) {
    setDeletingId(id)
    const { error } = await supabase.from("Notes").delete().eq("id", id)
    setDeletingId(null)
    if (error) { toast.error("Failed to delete note"); return }
    setNotes(prev => prev.filter(n => n.id !== id))
    if (selectedId === id) setSelectedId(notes.find(n => n.id !== id)?.id ?? null)
  }

  async function togglePin(id: number) {
    setPinningId(id)
    const note = notes.find(n => n.id === id)
    if (!note) { setPinningId(null); return }
    const newPinned = !note.pinned
    const { error } = await supabase.from("Notes").update({ pinned: newPinned }).eq("id", id)
    setPinningId(null)
    if (error) { toast.error("Failed to update pin"); return }
    setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: newPinned } : n))
  }

  function openAddFolderDialog(parentId: number | null) {
    setFolderDialogParentId(parentId)
    setNewFolderName("")
    setFolderDialogOpen(true)
  }

  async function createFolder() {
    if (!newFolderName.trim()) return
    setIsCreatingFolder(true)
    const { data, error } = await supabase
      .from("Folders")
      .insert({ name: newFolderName.trim(), parent_id: folderDialogParentId })
      .select()
      .single()
    setIsCreatingFolder(false)
    if (error || !data) { toast.error("Failed to create folder"); return }
    setFolders(prev => [...prev, data])
    setFolderDialogOpen(false)
  }

  async function deleteFolder(id: number) {
    setDeletingFolderId(id)
    const { error } = await supabase.from("Folders").delete().eq("id", id)
    if (error) { setDeletingFolderId(null); toast.error("Failed to delete folder"); return }
    const [{ data: newFolders }, { data: newNotes }] = await Promise.all([
      supabase.from("Folders").select("*").order("name"),
      supabase.from("Notes").select("*").order("created_at", { ascending: false }),
    ])
    setDeletingFolderId(null)
    if (newFolders) setFolders(newFolders as Folder[])
    if (newNotes) setNotes(newNotes as Note[])
    if (selectedFolderId !== null && !newFolders?.find(f => f.id === selectedFolderId)) {
      setSelectedFolderId(null)
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      {sidebarOpen && (
        <div className="absolute inset-0 z-40 bg-black/30 md:hidden" onClick={toggleSidebar} />
      )}

      {/* ── Folder panel ───────────────────────────────────────────────────── */}
      <aside className={cn(
        "flex flex-col border-r border-border bg-background md:bg-muted/30 shrink-0 overflow-hidden",
        "absolute inset-y-0 left-0 z-50 w-52",
        "md:relative md:inset-auto md:z-auto",
        "transition-transform md:transition-[width] duration-200 ease-in-out",
        sidebarOpen
          ? "translate-x-0 md:w-52"
          : "-translate-x-full md:translate-x-0 md:w-0 md:border-r-0",
      )}>
        <div className="flex-1 overflow-y-auto p-2 pt-3">
          {/* All Notes — undeletable root */}
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                  selectedFolderId === null
                    ? "bg-primary/10 text-primary font-semibold"
                    : "hover:bg-muted/60 text-foreground font-medium",
                )}
                onClick={() => selectFolder(null)}
              >
                <FolderIcon className="size-4 shrink-0" />
                <span className="flex-1 truncate text-left">All Notes</span>
                <span className="text-xs text-muted-foreground tabular-nums">{notes.length}</span>
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-44">
              <ContextMenuItem onSelect={() => { selectFolder(null); addNote(null) }} className="gap-2">
                <Plus className="size-4" />
                New Note
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onSelect={() => openAddFolderDialog(null)} className="gap-2">
                <FolderPlus className="size-4" />
                New Folder
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>

          {tree.length > 0 && (
            <div className="mt-1">
              {tree.map(node => (
                <FolderTreeItem
                  key={node.id}
                  node={node}
                  depth={0}
                  selectedFolderId={selectedFolderId}
                  deletingFolderId={deletingFolderId}
                  noteCounts={noteCounts}
                  onSelect={selectFolder}
                  onAddNote={(folderId) => { selectFolder(folderId); addNote(folderId) }}
                  onAddChild={openAddFolderDialog}
                  onDelete={deleteFolder}
                />
              ))}
            </div>
          )}
        </div>

        {/* New Folder */}
        <div className="flex-none p-2 border-t border-border">
          <button
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg transition-colors hover:bg-muted/60"
            onClick={() => openAddFolderDialog(null)}
          >
            <Plus className="size-4 shrink-0" />
            New Folder
          </button>
        </div>
      </aside>

      {/* ── Note list panel ─────────────────────────────────────────────────── */}
      <div className={cn(
        "flex-col shrink-0 border-r border-border bg-background",
        "w-full md:w-52",
        selected ? "hidden md:flex" : "flex",
      )}>
        {/* Header */}
        <div className="flex-none px-4 pt-4 pb-3 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold truncate">{listTitle}</h2>
            {selectedFolderId !== null && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="md:hidden shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => deleteFolder(selectedFolderId)}
                disabled={deletingFolderId === selectedFolderId}
              >
                {deletingFolderId === selectedFolderId
                  ? <Loader2 className="size-4 animate-spin" />
                  : <Trash2 className="size-4" />}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2 rounded-md bg-muted/60 px-3 py-1.5">
            <Search className="size-3.5 shrink-0 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              className="flex-1 bg-transparent outline-none text-xs placeholder:text-muted-foreground text-foreground"
            />
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "note" : "notes"}
          </p>
        </div>

        {/* Note list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-center text-xs text-muted-foreground">
              {search ? "No notes match your search" : "No notes yet"}
            </p>
          )}

          {/* Pinned section */}
          {pinnedNotes.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Star className="size-3 fill-yellow-500 text-yellow-500" />
                Pinned
              </p>
              {pinnedNotes.map(note => (
                <NoteListItem
                  key={note.id}
                  note={note}
                  active={note.id === selectedId}
                  isDeleting={deletingId === note.id}
                  isPinning={pinningId === note.id}
                  folderName={
                    selectedFolderId === null && note.folder !== null
                      ? (folderMap.get(note.folder) ?? null)
                      : null
                  }
                  onClick={() => selectNote(note.id)}
                  onDelete={() => deleteNote(note.id)}
                  onTogglePin={() => togglePin(note.id)}
                />
              ))}
            </div>
          )}

          {grouped.map(group => (
            <div key={group.label}>
              <p className="px-4 pt-3 pb-1 text-[11px] font-semibold text-muted-foreground">
                {group.label}
              </p>
              {group.notes.map(note => (
                <NoteListItem
                  key={note.id}
                  note={note}
                  active={note.id === selectedId}
                  isDeleting={deletingId === note.id}
                  isPinning={pinningId === note.id}
                  folderName={
                    selectedFolderId === null && note.folder !== null
                      ? (folderMap.get(note.folder) ?? null)
                      : null
                  }
                  onClick={() => selectNote(note.id)}
                  onDelete={() => deleteNote(note.id)}
                  onTogglePin={() => togglePin(note.id)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* New Note */}
        <div className="flex-none p-2 border-t border-border">
          <button
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg transition-colors hover:bg-muted/60 disabled:opacity-50"
            onClick={() => addNote()}
            disabled={isAdding}
          >
            {isAdding
              ? <Loader2 className="size-4 shrink-0 animate-spin" />
              : <Plus className="size-4 shrink-0" />}
            New Note
          </button>
        </div>
      </div>

      {/* ── Editor ─────────────────────────────────────────────────────────── */}
      {selected ? (
        <div className="flex flex-1 flex-col min-w-0">
          <div className="flex items-center justify-between border-b border-border px-4 md:px-6 py-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                className="md:hidden shrink-0"
                onClick={() => setSelectedId(null)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <p className="text-xs text-muted-foreground">
                {new Date(selected.created_at).toLocaleString("en-US", {
                  month: "long", day: "numeric", year: "numeric",
                  hour: "numeric", minute: "2-digit",
                })}
              </p>
              {isSaving ? (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" />
                  Saving…
                </span>
              ) : isDirty ? (
                <Button size="sm" variant="outline" onClick={saveNow} className="h-6 px-2 text-xs gap-1">
                  <Save className="size-3" />
                  Save now
                </Button>
              ) : null}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => togglePin(selected.id)}
                disabled={pinningId === selected.id}
                className={cn(selected.pinned && "text-yellow-500")}
              >
                {pinningId === selected.id
                  ? <Loader2 className="size-4 animate-spin" />
                  : <Star className={cn("size-4", selected.pinned && "fill-yellow-500")} />}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:text-destructive"
                onClick={() => deleteNote(selected.id)}
                disabled={deletingId === selected.id}
              >
                {deletingId === selected.id
                  ? <Loader2 className="size-4 animate-spin" />
                  : <Trash2 className="size-4" />}
              </Button>
            </div>
          </div>

          <input
            key={selected.id}
            defaultValue={selected.title}
            onChange={e => updateSelected({ title: e.target.value })}
            className="border-b border-border px-8 py-4 text-2xl font-semibold bg-transparent outline-none placeholder:text-muted-foreground"
            placeholder="Title"
          />
          <textarea
            key={selected.id + "-body"}
            defaultValue={selected.content}
            onChange={e => updateSelected({ content: e.target.value })}
            className="flex-1 resize-none bg-transparent px-8 py-4 text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
            placeholder="Start writing…"
          />
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
          <FileText className="size-10 opacity-30" />
          <p className="text-sm">Select a note or create a new one</p>
        </div>
      )}

      {/* Add Folder Dialog */}
      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <input
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') createFolder() }}
            placeholder="Folder name"
            autoFocus
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
          <DialogFooter>
            <Button
              onClick={createFolder}
              disabled={isCreatingFolder || !newFolderName.trim()}
              className="gap-1.5"
            >
              {isCreatingFolder && <Loader2 className="size-3.5 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
