"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import NoteRow from "@/components/noterow"
import { cn } from "@/lib/utils"
import { Plus, Search, FileText, Trash2, Star, Loader2, Save } from "lucide-react"
import type { Note } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useSidebar } from "@/lib/sidebar-context"

const AUTO_SAVE_DELAY = 2000

export default function DashboardPage({ initialNotes }: { initialNotes: Note[] }) {
  const supabase = createClient()
  const [notes, setNotes] = useState(initialNotes)
  const [selectedId, setSelectedId] = useState<number | null>(
    initialNotes && initialNotes.length > 0 ? initialNotes[0].id : null
  )
  const [search, setSearch] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [pinningId, setPinningId] = useState<number | null>(null)
  const { open: sidebarOpen, toggle: toggleSidebar } = useSidebar()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingSaveRef = useRef<{ id: number; patch: Partial<Note> } | null>(null)

  const selected = notes.find((n) => n.id === selectedId)

  function selectNote(id: number) {
    setSelectedId(id)
    if (window.innerWidth < 768 && sidebarOpen) toggleSidebar()
  }

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  )

  const pinned = filtered.filter((n) => n.pinned)
  const rest = filtered.filter((n) => !n.pinned)

  // When switching notes, flush any pending save for the previous note immediately
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

  async function addNote() {
    setIsAdding(true)
    const { data, error } = await supabase.from("Notes").insert({}).select().single()
    setIsAdding(false)
    if (error || !data) {
      toast.error("Failed to create note")
      return
    }
    setNotes((prev) => [data, ...prev])
    setSelectedId(data.id)
  }

  function updateSelected(patch: Partial<Note>) {
    setNotes((prev) =>
      prev.map((n) => (n.id === selectedId ? { ...n, ...patch } : n))
    )
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
    setNotes((prev) =>
      prev.map((n) => (n.id === pending.id ? { ...n, created_at: now } : n))
    )
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
    if (error) {
      toast.error("Failed to delete note")
      return
    }
    setNotes((prev) => prev.filter((n) => n.id !== id))
    if (selectedId === id) setSelectedId(notes.find((n) => n.id !== id)?.id ?? null)
  }

  async function togglePin(id: number) {
    setPinningId(id)
    const note = notes.find((n) => n.id === id)
    if (!note) { setPinningId(null); return }
    const newPinned = !note.pinned
    const { error } = await supabase.from("Notes").update({ pinned: newPinned }).eq("id", id)
    setPinningId(null)
    if (error) {
      toast.error("Failed to update pin")
      return
    }
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: newPinned } : n))
    )
  }

  return (
    <div className="flex h-full">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="absolute inset-0 z-40 bg-black/30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "flex flex-col border-r border-border bg-background md:bg-muted/30 shrink-0",
        "absolute inset-y-0 left-0 z-50 w-64 md:overflow-hidden",
        "md:relative md:inset-auto md:z-auto",
        "transition-transform md:transition-[width] duration-200 ease-in-out",
        sidebarOpen
          ? "translate-x-0 md:w-64"
          : "-translate-x-full md:translate-x-0 md:w-0 md:border-r-0",
      )}>
        {/* Search */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground">
            <Search className="size-3.5 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes…"
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-foreground text-xs"
            />
          </div>
        </div>

        {/* Note list */}
        <div className="flex-1 overflow-y-auto py-2">
          {pinned.length > 0 && (
            <>
              <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Starred</p>
              {pinned.map((note) => (
                <NoteRow
                  key={note.id}
                  note={note}
                  active={note.id === selectedId}
                  isDeleting={deletingId === note.id}
                  isPinning={pinningId === note.id}
                  onClick={() => selectNote(note.id)}
                  onDelete={() => deleteNote(note.id)}
                  onTogglePin={() => togglePin(note.id)}
                />
              ))}
              <div className="mx-4 my-2 border-t border-border" />
            </>
          )}
          {rest.length > 0 && (
            <>
              {pinned.length > 0 && (
                <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Notes</p>
              )}
              {rest.map((note) => (
                <NoteRow
                  key={note.id}
                  note={note}
                  active={note.id === selectedId}
                  isDeleting={deletingId === note.id}
                  isPinning={pinningId === note.id}
                  onClick={() => selectNote(note.id)}
                  onDelete={() => deleteNote(note.id)}
                  onTogglePin={() => togglePin(note.id)}
                />
              ))}
            </>
          )}
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-center text-xs text-muted-foreground">No notes found</p>
          )}
        </div>

        {/* New note */}
        <div className="p-3 border-t border-border">
          <Button size="sm" className="w-full gap-1.5" onClick={addNote} disabled={isAdding}>
            {isAdding ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
            New note
          </Button>
        </div>
      </aside>

      {/* Editor */}
      {selected ? (
        <div className="flex flex-1 flex-col min-w-0">
          {/* Editor toolbar */}
          <div className="flex items-center justify-between border-b border-border px-6 py-2">
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground">
                {new Date(selected.created_at).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
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
                {deletingId === selected.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              </Button>
            </div>
          </div>

          {/* Title */}
          <input
            key={selected.id}
            defaultValue={selected.title}
            onChange={(e) => updateSelected({ title: e.target.value })}
            className="border-b border-border px-8 py-4 text-2xl font-semibold bg-transparent outline-none placeholder:text-muted-foreground"
            placeholder="Title"
          />

          {/* Body */}
          <textarea
            key={selected.id + "-body"}
            defaultValue={selected.content}
            onChange={(e) => updateSelected({ content: e.target.value })}
            className="flex-1 resize-none bg-transparent px-8 py-4 text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
            placeholder="Start writing…"
          />
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
          <FileText className="size-10 opacity-30" />
          <p className="text-sm">Select a note or create a new one</p>
          <Button size="sm" onClick={addNote} disabled={isAdding}>
            {isAdding ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
            New note
          </Button>
        </div>
      )}
    </div>
  )
}
