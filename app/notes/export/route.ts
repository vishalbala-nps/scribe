import { NextResponse } from "next/server"
import getNotes from "@/lib/getNotes"
import AdmZip from "adm-zip"
import type { Note, FolderNode } from "@/lib/types"

function sanitize(name: string) {
  return (name?.trim() || "Untitled").replace(/[/\\:*?"<>|]/g, "_")
}

function addNotes(zip: AdmZip, notes: Note[], prefix: string) {
  const seen = new Map<string, number>()
  for (const note of notes) {
    const base = sanitize(note.title)
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    const filename = count === 0 ? `${base}.md` : `${base} (${count}).md`
    zip.addFile(prefix + filename, Buffer.from(note.content ?? "", "utf-8"))
  }
}

function walkTree(zip: AdmZip, nodes: FolderNode[], byFolder: Map<number, Note[]>, prefix: string) {
  for (const node of nodes) {
    const folderPath = prefix + sanitize(node.name) + "/"
    addNotes(zip, byFolder.get(node.id) ?? [], folderPath)
    if (node.children.length) walkTree(zip, node.children, byFolder, folderPath)
  }
}

export async function GET() {
  try {
    const { notes, tree } = await getNotes()

    const byFolder = new Map<number, Note[]>()
    const rootNotes: Note[] = []

    for (const note of notes) {
      if (note.folder === null) {
        rootNotes.push(note)
      } else {
        const arr = byFolder.get(note.folder) ?? []
        arr.push(note)
        byFolder.set(note.folder, arr)
      }
    }

    const zip = new AdmZip()
    addNotes(zip, rootNotes, "")
    walkTree(zip, tree, byFolder, "")

    const buffer = zip.toBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="scribe-notes.zip"',
        "Content-Length": buffer.byteLength.toString(),
      },
    })
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
