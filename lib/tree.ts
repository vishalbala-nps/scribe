import { Folder, FolderNode } from './types'

export function buildFolderTree(folders: Folder[]): FolderNode[] {
  const map = new Map<number, FolderNode>()
  for (const f of folders) map.set(f.id, { ...f, children: [] })
  const roots: FolderNode[] = []
  for (const node of map.values()) {
    if (node.parent_id === null) roots.push(node)
    else map.get(node.parent_id)?.children.push(node)
  }
  return roots
}

export function collectDescendantIds(tree: FolderNode[], id: number): number[] {
  for (const node of tree) {
    if (node.id === id) {
      const ids: number[] = [id]
      const collect = (n: FolderNode) =>
        n.children.forEach(c => { ids.push(c.id); collect(c) })
      collect(node)
      return ids
    }
    const found = collectDescendantIds(node.children, id)
    if (found.length) return found
  }
  return []
}
