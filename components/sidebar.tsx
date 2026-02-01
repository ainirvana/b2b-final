"use client"

import Image from "next/image"
import travLogo from "../trav_platforms_logo.jpg"

import {
  Home,
  BookOpen,
  MessageSquare,
  ShoppingCart,
  User,
  ChevronLeft,
  ChevronRight,
  Receipt,
  FileText,
  Share2,
  DollarSign,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"



interface SidebarProps {
  activeView?: string
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

export function Sidebar({ activeView, collapsed, setCollapsed }: SidebarProps) {

  const router = useRouter()
  const pathname = usePathname()

  const currentView = activeView || pathname.slice(1) || 'dashboard'

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "library", label: "Library", icon: BookOpen },
    { id: "weblinks", label: "Weblinks", icon: Share2 },
    { id: "finance", label: "Finance", icon: DollarSign },
    { id: "quotation-builder", label: "Quotation Builder", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <>
      <div
        className={cn(
          "bg-white border-r border-neutral-200 flex flex-col transition-all duration-300 shadow-brand-sm h-full relative group",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <Button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 z-50 h-6 w-6 rounded-full border border-neutral-200 bg-white p-0 text-neutral-400 shadow-sm hover:bg-neutral-100 hover:text-neutral-600 flex items-center justify-center transition-opacity"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              return (
                <li key={item.id}>
                  <button
                    className={cn(
                      "w-full flex items-center transition-all duration-200 rounded-lg group hover:bg-yellow-50",
                      collapsed ? "px-2 py-3 justify-center" : "px-3 py-2 justify-start",
                      isActive ? "bg-yellow-100 text-yellow-800 font-medium" : "text-gray-600",
                    )}
                    onClick={() => {
                      router.push(`/${item.id}`)
                    }}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-yellow-600" : "text-gray-500 group-hover:text-yellow-600")} />
                    {!collapsed && <span className="ml-3 text-sm">{item.label}</span>}
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
              "w-full flex items-center hover:bg-gray-50 rounded-lg transition-colors",
              collapsed ? "px-2 py-3 justify-center" : "px-3 py-2 justify-start",
            )}
            title={collapsed ? "User Profile" : undefined}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-sm">
              JD
            </div>
            {!collapsed && (
              <div className="ml-3 text-left overflow-hidden">
                <div className="text-sm font-medium text-neutral-900 truncate">John Doe</div>
                <div className="text-xs text-neutral-500 truncate">Travel Agent</div>
              </div>
            )}
          </button>
        </div>
      </div>


    </>
  )
}
