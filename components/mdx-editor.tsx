"use client"

import "@mdxeditor/editor/style.css"
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  ListsToggle,
  Separator,
  type MDXEditorMethods,
} from "@mdxeditor/editor"
import { forwardRef } from "react"

interface Props {
  title: string
  markdown: string
  onChangeTitle: (value: string) => void
  onChange: (value: string) => void
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
              <div className="flex items-center px-2 py-1 border-b border-border">
                <BlockTypeSelect />
                <Separator />
                <BoldItalicUnderlineToggles />
                <Separator />
                <ListsToggle />
              </div>
            </div>
          ),
        }),
      ]}
      contentEditableClassName="prose dark:prose-invert max-w-none outline-none px-8 py-4 text-sm leading-relaxed min-h-full"
    />
  )
)
MdxEditor.displayName = "MdxEditor"

export default MdxEditor
