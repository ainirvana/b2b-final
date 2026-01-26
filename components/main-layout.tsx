"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { cn } from "@/lib/utils"

interface MainLayoutProps {
    children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
    const pathname = usePathname()

    // Determine if we should start collapsed (editor/preview modes)
    const shouldStartCollapsed = pathname.includes("/builder") || pathname.includes("/preview") || pathname.includes("/editor")

    const [collapsed, setCollapsed] = useState(false)

    // Sync collapsed state when pathname changes to these specific routes if needed, 
    // or just let the user control it after initial load. 
    // For now, let's respect the user's manual toggle, but auto-collapse on enter if it's these pages.
    useEffect(() => {
        if (shouldStartCollapsed) {
            setCollapsed(true)
        }
    }, [shouldStartCollapsed])

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            <div className="fixed inset-y-0 left-0 z-50 h-full">
                <Sidebar
                    activeView={pathname.split('/')[1] || 'dashboard'}
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                />
            </div>
            <main
                className={cn(
                    "flex-1 transition-all duration-300 min-h-screen",
                    collapsed ? "ml-16" : "ml-64"
                )}
            >
                {children}
            </main>
        </div>
    )
}
