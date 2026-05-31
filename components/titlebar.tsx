export default function TitleBar({ children }: { children: React.ReactNode }) {
    return (
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
            <span className="font-semibold tracking-tight">My Notes</span>
            {children}
        </header>
    )
}