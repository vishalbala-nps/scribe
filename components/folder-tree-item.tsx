"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Folder as FolderIcon, FolderOpen, FolderPlus,
  ChevronDown, Trash2, Loader2, Plus,
} from "lucide-react"
import type { FolderNode } from "@/lib/types"
import {
  ContextMenu, ContextMenuContent, ContextMenuItem,
  ContextMenuSeparator, ContextMenuTrigger,
} from "@/components/ui/context-menu"

export function FolderTreeItem({
  node, depth, selectedFolderId, deletingFolderId, noteCounts,
  onSelect, onAddNote, onAddChild, onDelete,
}: {
  node: FolderNode
  depth: number
  selectedFolderId: number | null
  deletingFolderId: number | null
  noteCounts: Map<number, number>
  onSelect: (id: number) => void
  onAddNote: (folderId: number) => void
  onAddChild: (parentId: number) => void
  onDelete: (id: number) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const isSelected = selectedFolderId === node.id
  const isDeleting = deletingFolderId === node.id
  const count = noteCounts.get(node.id) ?? 0

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
            className={cn(
              "w-full flex items-center gap-1.5 pr-2 py-1.5 text-sm rounded-lg transition-colors",
              isSelected
                ? "bg-primary/10 text-primary font-medium"
                : "hover:bg-muted/60 text-foreground",
            )}
            onClick={() => {
              onSelect(node.id)
              if (node.children.length) setExpanded(e => !e)
            }}
          >
            <ChevronDown className={cn(
              "size-3 shrink-0 text-muted-foreground transition-transform duration-150",
              node.children.length === 0 && "opacity-0",
              !expanded && "-rotate-90",
            )} />
            {isSelected && expanded
              ? <FolderOpen className="size-4 shrink-0" />
              : <FolderIcon className="size-4 shrink-0" />}
            <span className="flex-1 truncate text-left">{node.name}</span>
            {isDeleting ? (
              <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
            ) : count > 0 ? (
              <span className="text-xs text-muted-foreground tabular-nums shrink-0">{count}</span>
            ) : null}
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-44">
          <ContextMenuItem onSelect={() => onAddNote(node.id)} className="gap-2">
            <Plus className="size-4" />
            New Note
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => onAddChild(node.id)} className="gap-2">
            <FolderPlus className="size-4" />
            New Folder
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onSelect={() => onDelete(node.id)}
            disabled={isDeleting}
            className="gap-2 text-destructive focus:text-destructive"
          >
            {isDeleting
              ? <Loader2 className="size-4 animate-spin" />
              : <Trash2 className="size-4" />}
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {expanded && node.children.map(child => (
        <FolderTreeItem
          key={child.id}
          node={child}
          depth={depth + 1}
          selectedFolderId={selectedFolderId}
          deletingFolderId={deletingFolderId}
          noteCounts={noteCounts}
          onSelect={onSelect}
          onAddNote={onAddNote}
          onAddChild={onAddChild}
          onDelete={onDelete}
        />
      ))}
    </>
  )
}
