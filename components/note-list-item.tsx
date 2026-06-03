"use client"

import { cn } from "@/lib/utils"
import { Trash2, Star, Loader2, Folder as FolderIcon, Download } from "lucide-react"
import type { Note } from "@/lib/types"
import {
  ContextMenu, ContextMenuContent, ContextMenuItem,
  ContextMenuSeparator, ContextMenuTrigger,
} from "@/components/ui/context-menu"

export function formatNoteTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  }
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function NoteListItem({
  note, active, isDeleting, isPinning, folderName,
  onClick, onDelete, onTogglePin,
}: {
  note: Note
  active: boolean
  isDeleting: boolean
  isPinning: boolean
  folderName: string | null
  onClick: () => void
  onDelete: () => void
  onTogglePin: () => void
}) {
  const busy = isDeleting || isPinning
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          onClick={onClick}
          disabled={busy}
          className={cn(
            "w-full px-4 py-3 text-left transition-colors border-b border-border/50",
            active ? "bg-muted" : "hover:bg-muted/40",
            busy && "opacity-60 cursor-not-allowed",
          )}
        >
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-sm font-medium leading-snug">
              {note.title || "No Title"}
            </p>
            <p className="text-[11px] text-muted-foreground shrink-0">
              {formatNoteTime(note.created_at)}
            </p>
          </div>
          <p className="truncate text-xs text-muted-foreground mt-0.5">
            {note.content || "No additional text"}
          </p>
          {folderName !== null && (
            <div className="flex items-center gap-1 mt-1.5">
              <FolderIcon className="size-2.5 shrink-0 text-muted-foreground/50" />
              <p className="text-[10px] text-muted-foreground/60 truncate">{folderName}</p>
            </div>
          )}
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onSelect={onTogglePin} disabled={busy} className="gap-2">
          {isPinning
            ? <Loader2 className="size-4 animate-spin" />
            : <Star className={cn("size-4", note.pinned && "fill-yellow-500 text-yellow-500")} />}
          {note.pinned ? "Unstar" : "Star"}
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => {
            const blob = new Blob([`# ${note.title}\n\n${note.content ?? ""}`], { type: "text/markdown" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${note.title || "note"}.md`
            a.click()
            URL.revokeObjectURL(url)
          }}
          className="gap-2"
        >
          <Download className="size-4" />
          Download as .md
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onSelect={onDelete}
          disabled={busy}
          className="gap-2 text-destructive focus:text-destructive"
        >
          {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
