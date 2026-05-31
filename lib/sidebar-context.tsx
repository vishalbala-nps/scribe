"use client"

import { createContext, useContext, useState, useEffect } from "react"

interface SidebarContextValue {
  open: boolean
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextValue>({
  open: true,
  toggle: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true)

  useEffect(() => {
    if (window.innerWidth < 768) setOpen(false)
  }, [])

  return (
    <SidebarContext.Provider value={{ open, toggle: () => setOpen((o) => !o) }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}
