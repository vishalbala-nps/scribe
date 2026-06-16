export interface FolderNote {
  [key: number]: Note[]
}

export interface Note {
  id: number
  title: string
  content: string
  pinned: boolean
  created_at: string
  folder: number | null
}

export interface Folder {
  id: number
  name: string
  parent_id: number | null
  created_at: string
}

export interface FolderNode extends Folder {
  children: FolderNode[]
}
