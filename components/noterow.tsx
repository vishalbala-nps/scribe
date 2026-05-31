import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Note } from '@/lib/types'
import { Trash2, Loader2, Pin, PinOff } from "lucide-react"
import { cn } from "@/lib/utils"

export default function NoteRow({
  note,
  active,
  isDeleting,
  isPinning,
  onClick,
  onDelete,
  onTogglePin,
}: {
  note: Note
  active: boolean
  isDeleting: boolean
  isPinning: boolean
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
            "w-full px-4 py-2.5 text-left transition-colors hover:bg-muted/60",
            active && "bg-muted",
            busy && "opacity-60 cursor-not-allowed"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium">{note.title || "Untitled"}</p>
            {(isDeleting || isPinning) && <Loader2 className="size-3 shrink-0 animate-spin text-muted-foreground" />}
          </div>
          <p className="truncate text-xs text-muted-foreground mt-0.5">
            {new Date(note.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {note.content || "No content"}
          </p>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem
          onSelect={onTogglePin}
          disabled={busy}
          className="gap-2"
        >
          {isPinning
            ? <Loader2 className="size-4 animate-spin" />
            : note.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
          {note.pinned ? "Unpin" : "Pin"}
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
