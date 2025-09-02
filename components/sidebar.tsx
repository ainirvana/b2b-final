"use client"

import Image from "next/image"
import travLogo from "../trav_platforms_logo.jpg"

import {
  Home,
  Package,
  BookOpen,
  Heart,
  MessageSquare,
  ShoppingCart,
  User,
  ChevronLeft,
  ChevronRight,
  Receipt,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface SidebarProps {
  activeView?: string
  onViewChange?: (view: string) => void
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  
  const currentView = activeView || pathname.slice(1) || 'dashboard'

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "itinerary", label: "Itinerary", icon: Package },
    { id: "library", label: "Library", icon: BookOpen },
    { id: "saved", label: "Saved", icon: Heart },
    { id: "rfqs", label: "RFQs", icon: MessageSquare },
    { id: "cart", label: "Cart", icon: ShoppingCart },
    { id: "invoice", label: "Invoice", icon: Receipt },
    { id: "quotation-builder", label: "Quotation Builder", icon: FileText },
  ]

  return (
    <div
      className={cn(
        "bg-white border-r border-neutral-200 flex flex-col transition-all duration-300 shadow-brand-sm",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */} 
      <div className="p-4 border-b border-yellow-200 flex items-center justify-between bg-gradient-to-r from-yellow-400 to-yellow-500">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-full h-12 bg-white rounded-lg p-1 flex items-center justify-center">
              <Image src={travLogo} alt="trav b2b logo" className="object-contain w-full h-full" />
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 text-white hover:bg-white/20"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            return (
              <li key={item.id}>
                <button
                  className={cn(
                    "w-full flex items-center transition-all duration-200 rounded-lg",
                    collapsed ? "px-2 py-3 justify-center" : "px-3 py-2 justify-start",
                    isActive ? "nav-item-active" : "nav-item",
                  )}
                  onClick={() => {
                    if (onViewChange) {
                      onViewChange(item.id)
                    } else {
                      router.push(`/${item.id}`)
                    }
                  }}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="ml-3 text-label-md">{item.label}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-neutral-200">
        <button
          className={cn(
            "w-full flex items-center nav-item",
            collapsed ? "px-2 py-3 justify-center" : "px-3 py-2 justify-start",
          )}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-brand-primary-400 to-brand-accent-400 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="ml-3 text-left">
              <div className="text-label-md text-neutral-900">John Doe</div>
              <div className="text-body-xs text-neutral-500">Travel Agent</div>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}
