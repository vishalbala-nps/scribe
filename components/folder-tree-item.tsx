"use client"

import { cn } from "@/lib/utils"
import {
  Folder as FolderIcon, FolderOpen, FolderPlus,
  ChevronDown, Trash2, Loader2, Plus, Pencil,
} from "lucide-react"
import type { FolderNode } from "@/lib/types"
import {
  ContextMenu, ContextMenuContent, ContextMenuItem,
  ContextMenuSeparator, ContextMenuTrigger,
} from "@/components/ui/context-menu"

export function FolderTreeItem({
  node, depth, selectedFolderId, deletingFolderId, noteCounts,
  expandedFolderIds, onToggleExpand,
  onSelect, onAddNote, onAddChild, onDelete, onRename,
  pickerMode = false,
}: {
  node: FolderNode
  depth: number
  selectedFolderId: number | null
  expandedFolderIds: Set<number>
  onToggleExpand: (id: number) => void
  onSelect: (id: number) => void
  pickerMode?: boolean
  deletingFolderId?: number | null
  noteCounts?: Map<number, number>
  onAddNote?: (folderId: number) => void
  onAddChild?: (parentId: number) => void
  onDelete?: (id: number) => void
  onRename?: (id: number) => void
}) {
  const expanded = expandedFolderIds.has(node.id)
  const isSelected = selectedFolderId === node.id
  const isDeleting = !pickerMode && deletingFolderId === node.id
  const count = !pickerMode ? (noteCounts?.get(node.id) ?? 0) : 0

  const row = (
    <div
      style={{ paddingLeft: `${depth * 16}px` }}
      className={cn(
        "w-full flex items-center pr-2 text-sm rounded-lg transition-colors",
        isSelected
          ? "bg-primary/10 text-primary font-medium"
          : "hover:bg-muted/60 text-foreground",
        !pickerMode && "data-[state=open]:bg-muted/80 data-[state=open]:ring-1 data-[state=open]:ring-inset data-[state=open]:ring-primary/30",
      )}
    >
      <button
        className="p-2 md:p-1.5 shrink-0"
        onClick={() => { if (node.children.length) onToggleExpand(node.id) }}
      >
        <ChevronDown className={cn(
          "size-3.5 md:size-3 text-muted-foreground transition-transform duration-150",
          node.children.length === 0 && "opacity-0",
          !expanded && "-rotate-90",
        )} />
      </button>
      <button
        className="flex-1 flex items-center gap-2 py-2 md:py-1.5 text-left min-w-0"
        onClick={() => onSelect(node.id)}
      >
        {isSelected && expanded
          ? <FolderOpen className="size-4 shrink-0" />
          : <FolderIcon className="size-4 shrink-0" />}
        <span className="flex-1 truncate">{node.name}</span>
        {!pickerMode && (isDeleting ? (
          <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
        ) : count > 0 ? (
          <span className="text-xs text-muted-foreground tabular-nums shrink-0">{count}</span>
        ) : null)}
      </button>
    </div>
  )

  const sharedChildProps = {
    depth: depth + 1,
    selectedFolderId,
    expandedFolderIds,
    onToggleExpand,
    onSelect,
    pickerMode,
    deletingFolderId,
    noteCounts,
    onAddNote,
    onAddChild,
    onDelete,
    onRename,
  }

  return (
    <>
      {pickerMode ? row : (
        <ContextMenu>
          <ContextMenuTrigger asChild>{row}</ContextMenuTrigger>
          <ContextMenuContent className="w-44">
            <ContextMenuItem onSelect={() => onAddNote?.(node.id)} className="gap-2">
              <Plus className="size-4" />
              New Note
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => onAddChild?.(node.id)} className="gap-2">
              <FolderPlus className="size-4" />
              New Folder
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => onRename?.(node.id)} className="gap-2">
              <Pencil className="size-4" />
              Rename
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onSelect={() => onDelete?.(node.id)}
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
      )}

      {expanded && node.children.map(child => (
        <FolderTreeItem key={child.id} node={child} {...sharedChildProps} />
      ))}
    </>
  )
}
