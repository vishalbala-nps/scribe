"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Plus, Search, Trash2, Loader2, Star,
  Folder as FolderIcon, FolderPlus, Upload,
} from "lucide-react"
import type { Note, Folder } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useSidebar } from "@/lib/sidebar-context"
import { buildFolderTree } from "@/lib/tree"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { NoteListItem } from "@/components/note-list-item"
import { FolderTreeItem } from "@/components/folder-tree-item"
import { NoteEditor } from "@/components/note-editor"

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

function getFolderBreadcrumb(folderId: number, folders: Folder[]): string[] {
  const path: string[] = []
  let current: Folder | undefined = folders.find(f => f.id === folderId)
  while (current) {
    path.unshift(current.name)
    const parentId = current.parent_id
    current = parentId !== null ? folders.find(f => f.id === parentId) : undefined
  }
  return path
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
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [folderDeleteConfirmId, setFolderDeleteConfirmId] = useState<number | null>(null)
  const [pinningId, setPinningId] = useState<number | null>(null)
  const [deletingFolderId, setDeletingFolderId] = useState<number | null>(null)
  const [folderDialogOpen, setFolderDialogOpen] = useState(false)
  const [folderDialogParentId, setFolderDialogParentId] = useState<number | null>(null)
  const [newFolderName, setNewFolderName] = useState("")
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<number>>(new Set())
  const [renameFolderDialogOpen, setRenameFolderDialogOpen] = useState(false)
  const [renameFolderTargetId, setRenameFolderTargetId] = useState<number | null>(null)
  const [renameFolderName, setRenameFolderName] = useState("")
  const [isRenamingFolder, setIsRenamingFolder] = useState(false)
  const [moveNoteDialogOpen, setMoveNoteDialogOpen] = useState(false)
  const [moveNoteTargetNoteId, setMoveNoteTargetNoteId] = useState<number | null>(null)
  const [moveNoteSelectedFolder, setMoveNoteSelectedFolder] = useState<number | null>(null)
  const [isMovingNote, setIsMovingNote] = useState(false)
  const { open: sidebarOpen, toggle: toggleSidebar } = useSidebar()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingSaveRef = useRef<{ id: number; patch: Partial<Note> } | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

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

  const breadcrumbSegments = selectedFolderId !== null
    ? ["All Notes", ...getFolderBreadcrumb(selectedFolderId, folders)]
    : null

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

  async function importNote(file: File) {
    const text = await file.text()
    const title = file.name.replace(/\.md$/i, "")
    const { data, error } = await supabase
      .from("Notes")
      .insert({ title, content: text, folder: selectedFolderId })
      .select()
      .single()
    if (error || !data) { toast.error("Failed to import note"); return }
    setNotes(prev => [data, ...prev])
    setSelectedId(data.id)
  }

  async function confirmDeleteNote(id: number) {
    setDeleteConfirmId(id)
  }

  async function deleteNote(id: number) {
    setDeleteConfirmId(null)
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
    if (folderDialogParentId !== null) {
      setExpandedFolderIds(prev => {
        const next = new Set(prev)
        let id: number | null = folderDialogParentId
        while (id !== null) {
          next.add(id)
          const parent = folders.find(f => f.id === id)
          id = parent?.parent_id ?? null
        }
        return next
      })
    }
    if (window.innerWidth < 768 && !sidebarOpen) toggleSidebar()
    setFolderDialogOpen(false)
  }

  function openMoveNoteDialog(noteId: number) {
    const note = notes.find(n => n.id === noteId)
    if (!note) return
    setMoveNoteTargetNoteId(noteId)
    setMoveNoteSelectedFolder(note.folder)
    setMoveNoteDialogOpen(true)
  }

  async function moveNote() {
    if (moveNoteTargetNoteId === null) return
    setIsMovingNote(true)
    const { error } = await supabase
      .from("Notes")
      .update({ folder: moveNoteSelectedFolder })
      .eq("id", moveNoteTargetNoteId)
    setIsMovingNote(false)
    if (error) { toast.error("Failed to move note"); return }
    setNotes(prev => prev.map(n =>
      n.id === moveNoteTargetNoteId ? { ...n, folder: moveNoteSelectedFolder } : n
    ))
    setMoveNoteDialogOpen(false)
  }

  function openRenameFolderDialog(id: number) {
    const folder = folders.find(f => f.id === id)
    if (!folder) return
    setRenameFolderTargetId(id)
    setRenameFolderName(folder.name)
    setRenameFolderDialogOpen(true)
  }

  async function renameFolder() {
    if (!renameFolderName.trim() || renameFolderTargetId === null) return
    setIsRenamingFolder(true)
    const { error } = await supabase
      .from("Folders")
      .update({ name: renameFolderName.trim() })
      .eq("id", renameFolderTargetId)
    setIsRenamingFolder(false)
    if (error) { toast.error("Failed to rename folder"); return }
    setFolders(prev => prev.map(f =>
      f.id === renameFolderTargetId ? { ...f, name: renameFolderName.trim() } : f
    ))
    setRenameFolderDialogOpen(false)
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
    <div className="flex md:h-full md:overflow-hidden">
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
              <div
                className={cn(
                  "flex items-center rounded-lg transition-colors",
                  selectedFolderId === null
                    ? "bg-primary/10 text-primary font-semibold"
                    : "hover:bg-muted/60 text-foreground font-medium",
                )}
              >
                <button
                  className="flex-1 flex items-center gap-2 px-3 py-2 text-sm text-left"
                  onClick={() => selectFolder(null)}
                >
                  <FolderIcon className="size-4 shrink-0" />
                  <span className="flex-1 truncate">All Notes</span>
                </button>
                <button
                  className="p-2 mr-1 rounded hover:bg-muted/80 text-muted-foreground shrink-0"
                  onClick={() => openAddFolderDialog(null)}
                >
                  <FolderPlus className="size-4" />
                </button>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-44">
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
                  expandedFolderIds={expandedFolderIds}
                  onToggleExpand={id => setExpandedFolderIds(prev => {
                    const next = new Set(prev)
                    next.has(id) ? next.delete(id) : next.add(id)
                    return next
                  })}
                  onSelect={selectFolder}
                  onAddNote={(folderId) => { selectFolder(folderId); addNote(folderId) }}
                  onAddChild={openAddFolderDialog}
                  onDelete={setFolderDeleteConfirmId}
                  onRename={openRenameFolderDialog}
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex-none px-4 py-2 border-t border-border text-center text-[11px] text-muted-foreground">
          {notes.length} {notes.length === 1 ? "note" : "notes"} · {folders.length} {folders.length === 1 ? "folder" : "folders"}
        </div>
      </aside>

      {/* ── Note list panel ─────────────────────────────────────────────────── */}
      <div className={cn(
        "flex-col shrink-0 border-r border-border bg-background",
        "w-full h-dvh md:h-auto md:w-52",
        selected ? "hidden md:flex" : "flex",
      )}>
        {/* Header */}
        <div className="flex-none px-4 pt-4 pb-3 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="min-w-0">
              {breadcrumbSegments && (
                <p className="md:hidden text-xs text-muted-foreground truncate mb-0.5">
                  {breadcrumbSegments.slice(0, -1).join(" › ")}
                </p>
              )}
              <h2 className="text-base font-semibold truncate">{listTitle}</h2>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon-sm"
                className="md:hidden text-muted-foreground hover:text-foreground"
                onClick={() => openAddFolderDialog(selectedFolderId)}
                title="New Folder"
              >
                <FolderPlus className="size-4" />
              </Button>
              {selectedFolderId !== null && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="md:hidden text-muted-foreground hover:text-destructive"
                  onClick={() => setFolderDeleteConfirmId(selectedFolderId)}
                  disabled={deletingFolderId === selectedFolderId}
                >
                  {deletingFolderId === selectedFolderId
                    ? <Loader2 className="size-4 animate-spin" />
                    : <Trash2 className="size-4" />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => importInputRef.current?.click()}
                title="Import from .md"
              >
                <Upload className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => addNote()}
                disabled={isAdding}
                title="New Note"
              >
                {isAdding
                  ? <Loader2 className="size-4 animate-spin" />
                  : <Plus className="size-4" />}
              </Button>
            </div>
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
                      onDelete={() => confirmDeleteNote(note.id)}
                      onTogglePin={() => togglePin(note.id)}
                      onMoveRequest={() => openMoveNoteDialog(note.id)}
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
                      onDelete={() => confirmDeleteNote(note.id)}
                      onTogglePin={() => togglePin(note.id)}
                      onMoveRequest={() => openMoveNoteDialog(note.id)}
                    />
                  ))}
                </div>
              ))}
        </div>
        <div className="flex-none px-4 py-2 border-t border-border text-center text-[11px] text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "note" : "notes"}
        </div>
        <input
          ref={importInputRef}
          type="file"
          accept=".md"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) importNote(file)
            e.target.value = ""
          }}
        />
      </div>

      {/* ── Editor ─────────────────────────────────────────────────────────── */}
      <NoteEditor
        note={selected}
        isSaving={isSaving}
        isDirty={isDirty}
        isDeleting={deletingId === selected?.id}
        isPinning={pinningId === selected?.id}
        onBack={() => setSelectedId(null)}
        onSaveNow={saveNow}
        onDelete={() => selected && confirmDeleteNote(selected.id)}
        onTogglePin={() => selected && togglePin(selected.id)}
        onChangeTitle={value => updateSelected({ title: value })}
        onChangeContent={value => updateSelected({ content: value })}
      />

      {/* Add Folder Dialog */}
      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
            <DialogDescription>Enter a name for the new folder.</DialogDescription>
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

      {/* Rename Folder Dialog */}
      <Dialog open={renameFolderDialogOpen} onOpenChange={setRenameFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription>Enter a new name for this folder.</DialogDescription>
          </DialogHeader>
          <input
            autoFocus
            value={renameFolderName}
            onChange={e => setRenameFolderName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") renameFolder() }}
            placeholder="Folder name"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenameFolderDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={renameFolder}
              disabled={!renameFolderName.trim() || isRenamingFolder}
              className="gap-1.5"
            >
              {isRenamingFolder && <Loader2 className="size-3.5 animate-spin" />}
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Note Dialog */}
      <Dialog open={moveNoteDialogOpen} onOpenChange={setMoveNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move note</DialogTitle>
            <DialogDescription>Choose a folder to move this note into.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
            <button
              onClick={() => setMoveNoteSelectedFolder(null)}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left transition-colors",
                moveNoteSelectedFolder === null ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/60"
              )}
            >
              <FolderIcon className="size-4 shrink-0" />
              No Folder
            </button>
            {tree.map(node => (
              <FolderTreeItem
                key={node.id}
                node={node}
                depth={0}
                selectedFolderId={moveNoteSelectedFolder}
                expandedFolderIds={expandedFolderIds}
                onToggleExpand={id => setExpandedFolderIds(prev => {
                  const next = new Set(prev)
                  next.has(id) ? next.delete(id) : next.add(id)
                  return next
                })}
                onSelect={setMoveNoteSelectedFolder}
                pickerMode
              />
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMoveNoteDialogOpen(false)}>Cancel</Button>
            <Button onClick={moveNote} disabled={isMovingNote} className="gap-1.5">
              {isMovingNote && <Loader2 className="size-3.5 animate-spin" />}
              Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Note Confirmation */}
      <AlertDialog open={deleteConfirmId !== null} onOpenChange={open => { if (!open) setDeleteConfirmId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete note?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{notes.find(n => n.id === deleteConfirmId)?.title || "Untitled"}&quot; will be permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId !== null && deleteNote(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete note
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Folder Confirmation */}
      <AlertDialog open={folderDeleteConfirmId !== null} onOpenChange={open => { if (!open) setFolderDeleteConfirmId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete folder?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{folders.find(f => f.id === folderDeleteConfirmId)?.name ?? "This folder"}&quot; and all its subfolders will be permanently deleted. Notes inside will also be removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => folderDeleteConfirmId !== null && deleteFolder(folderDeleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete folder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
