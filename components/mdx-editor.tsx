"use client"

import "@mdxeditor/editor/style.css"
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  tablePlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  diffSourcePlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  StrikeThroughSupSubToggles,
  CodeToggle,
  BlockTypeSelect,
  ListsToggle,
  CreateLink,
  InsertTable,
  InsertImage,
  InsertCodeBlock,
  DiffSourceToggleWrapper,
  Separator,
  type MDXEditorMethods,
} from "@mdxeditor/editor"
import { forwardRef, useEffect, useState } from "react"

interface Props {
  title: string
  markdown: string
  onChangeTitle: (value: string) => void
  onChange: (value: string) => void
}

const formattingButtons = (
  <>
    <UndoRedo />
    <Separator />
    <BlockTypeSelect />
    <Separator />
    <BoldItalicUnderlineToggles />
    <StrikeThroughSupSubToggles />
    <Separator />
    <CodeToggle />
    <InsertCodeBlock />
    <Separator />
    <ListsToggle />
    <Separator />
    <CreateLink />
    <Separator />
    <InsertImage />
    <InsertTable />
  </>
)

function ToolbarRow() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    const html = document.documentElement
    const sync = () => document.body.classList.toggle("dark-theme", html.classList.contains("dark"))
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(html, { attributeFilter: ["class"] })
    return () => { observer.disconnect(); document.body.classList.remove("dark-theme") }
  }, [])

  return (
    <div className="flex items-center flex-wrap px-2 py-1 border-b border-border gap-0.5">
      {isDesktop ? (
        <DiffSourceToggleWrapper options={["rich-text", "source"]}>
          {formattingButtons}
        </DiffSourceToggleWrapper>
      ) : (
        formattingButtons
      )}
    </div>
  )
}

const MdxEditor = forwardRef<MDXEditorMethods, Props>(
  ({ title, markdown, onChangeTitle, onChange }, ref) => (
    <MDXEditor
      ref={ref}
      markdown={markdown}
      onChange={onChange}
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        tablePlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        imagePlugin(),
        diffSourcePlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
        codeMirrorPlugin({ codeBlockLanguages: { js: "JavaScript", ts: "TypeScript", py: "Python", css: "CSS", html: "HTML", json: "JSON", "": "Plain text" } }),
        toolbarPlugin({
          toolbarClassName: "flex-col !items-stretch gap-0 !p-0 !bg-background",
          toolbarContents: () => (
            <div className="w-full">
              <input
                onChange={e => onChangeTitle(e.target.value)}
                className="px-8 py-4 text-2xl font-semibold bg-transparent outline-none border-b border-border placeholder:text-muted-foreground w-full"
                defaultValue={title === "Untitled" ? "" : title}
                placeholder="Untitled"
              />
              <ToolbarRow />
            </div>
          ),
        }),
      ]}
      contentEditableClassName="prose dark:prose-invert max-w-none outline-none px-8 py-4 text-sm min-h-[70vh] [&_*]:leading-snug [&_p]:my-1.5 [&_li]:my-0.5"
    />
  )
)
MdxEditor.displayName = "MdxEditor"

export default MdxEditor
