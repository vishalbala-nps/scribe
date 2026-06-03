"use client"

import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronLeft, FileText, Loader2, Save, Star, Trash2 } from "lucide-react"
import type { Note } from "@/lib/types"

const MdxEditor = dynamic(() => import("@/components/mdx-editor"), { ssr: false })

export function NoteEditor({
  note,
  isSaving,
  isDirty,
  isDeleting,
  isPinning,
  onBack,
  onSaveNow,
  onDelete,
  onTogglePin,
  onChangeTitle,
  onChangeContent,
}: {
  note: Note | undefined
  isSaving: boolean
  isDirty: boolean
  isDeleting: boolean
  isPinning: boolean
  onBack: () => void
  onSaveNow: () => void
  onDelete: () => void
  onTogglePin: () => void
  onChangeTitle: (value: string) => void
  onChangeContent: (value: string) => void
}) {
  if (!note) {
    return (
      <div className="hidden md:flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
        <FileText className="size-10 opacity-30" />
        <p className="text-sm">Select a note or create a new one</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col min-w-0">
      <div className="flex items-center justify-between border-b border-border px-4 md:px-6 py-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden shrink-0"
            onClick={onBack}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <p className="text-xs text-muted-foreground">
            {new Date(note.created_at).toLocaleString("en-US", {
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
            <Button size="sm" variant="outline" onClick={onSaveNow} className="h-6 px-2 text-xs gap-1">
              <Save className="size-3" />
              Save now
            </Button>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onTogglePin}
            disabled={isPinning}
            className={cn(note.pinned && "text-yellow-500")}
          >
            {isPinning
              ? <Loader2 className="size-4 animate-spin" />
              : <Star className={cn("size-4", note.pinned && "fill-yellow-500")} />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting
              ? <Loader2 className="size-4 animate-spin" />
              : <Trash2 className="size-4" />}
          </Button>
        </div>
      </div>

      <div key={note.id} className="flex-1 overflow-y-auto">
        <MdxEditor
          title={note.title}
          markdown={note.content ?? ""}
          onChangeTitle={onChangeTitle}
          onChange={onChangeContent}
        />
      </div>
    </div>
  )
}
