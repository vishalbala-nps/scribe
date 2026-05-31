"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Plus, Search, FileText, Trash2, Star, Loader2 } from "lucide-react"
import type { Note } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

export default function DashboardPage({ initialNotes }: { initialNotes: Note[] }) {
  const supabase = createClient()
  const [notes, setNotes] = useState(initialNotes)
  const [selectedId, setSelectedId] = useState<number | null>(initialNotes && initialNotes.length > 0 ? initialNotes[0].id : null);
  const [search, setSearch] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const selected = notes.find((n) => n.id === selectedId)

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  )

  const pinned = filtered.filter((n) => n.pinned)
  const rest = filtered.filter((n) => !n.pinned)

  async function addNote() {
    setIsAdding(true)
    const { data, error } = await supabase
      .from("Notes")
      .insert({})
      .select()
      .single()
    setIsAdding(false)
    if (error || !data) return
    setNotes((prev) => [data, ...prev])
    setSelectedId(data.id)
  }

  function updateSelected(patch: Partial<Note>) {
    setNotes((prev) =>
      prev.map((n) => (n.id === selectedId ? { ...n, ...patch } : n))
    )
  }

  function deleteNote(id: number) {
    setNotes((prev) => prev.filter((n) => n.id !== id))
    if (selectedId === id) setSelectedId(notes.find((n) => n.id !== id)?.id ?? null)
  }

  function togglePin(id: number) {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    )
  }
  useEffect(() => {
    console.log("Render on browser")
  }, [])
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-border bg-muted/30 shrink-0">
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
              <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Pinned</p>
              {pinned.map((note) => (
                <NoteRow
                  key={note.id}
                  note={note}
                  active={note.id === selectedId}
                  onClick={() => setSelectedId(note.id)}
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
                  onClick={() => setSelectedId(note.id)}
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
            <p className="text-xs text-muted-foreground">
              Last edited {new Date(selected.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => togglePin(selected.id)}
                className={cn(selected.pinned && "text-yellow-500")}
              >
                <Star className={cn("size-4", selected.pinned && "fill-yellow-500")} />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:text-destructive"
                onClick={() => deleteNote(selected.id)}
              >
                <Trash2 className="size-4" />
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

function NoteRow({
  note,
  active,
  onClick,
}: {
  note: Note
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full px-4 py-2.5 text-left transition-colors hover:bg-muted/60",
        active && "bg-muted"
      )}
    >
      <p className="truncate text-sm font-medium">{note.title || "Untitled"}</p>
      <p className="truncate text-xs text-muted-foreground mt-0.5">
        {new Date(note.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {note.content || "No content"}
      </p>
    </button>
  )
}
