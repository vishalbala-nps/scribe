"use client"

import { PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/lib/sidebar-context"

interface TitleBarProps {
  children?: React.ReactNode
  showSidebarToggle?: boolean
}

export default function TitleBar({ children, showSidebarToggle }: TitleBarProps) {
  const { toggle } = useSidebar()

  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-3">
      <div className="flex items-center gap-1">
        {showSidebarToggle && (
          <Button variant="ghost" size="icon-sm" onClick={toggle} className="shrink-0">
            <PanelLeft className="size-4" />
          </Button>
        )}
        <span className="font-semibold tracking-tight px-2">Scribe</span>
      </div>
      {children}
    </header>
  )
}
