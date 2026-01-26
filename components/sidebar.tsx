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

import { PriceSettingsDialog } from "@/components/price-settings-dialog"

interface SidebarProps {
  activeView?: string
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

export function Sidebar({ activeView, collapsed, setCollapsed }: SidebarProps) {
  const [showPriceSettings, setShowPriceSettings] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const currentView = activeView || pathname.slice(1) || 'dashboard'

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "library", label: "Library", icon: BookOpen },
    { id: "weblinks", label: "Weblinks", icon: Share2 },
    { id: "rfqs", label: "RFQs", icon: MessageSquare },
    { id: "finance", label: "Finance", icon: DollarSign },
    { id: "quotation-builder", label: "Quotation Builder", icon: FileText },
    { id: "price-settings", label: "Price Settings", icon: DollarSign },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <>
      <div
        className={cn(
          "bg-white border-r border-neutral-200 flex flex-col transition-all duration-300 shadow-brand-sm h-full",
          collapsed ? "w-16" : "w-64",
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-yellow-200 flex items-center justify-between bg-gradient-to-r from-yellow-400 to-yellow-500 min-h-[64px]">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-full h-8 bg-white rounded-lg p-1 flex items-center justify-center">
                <div className="font-bold text-yellow-600">TRAV PLATFORMS</div>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 text-white hover:bg-white/20 ml-auto"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

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
                      if (item.id === "price-settings") {
                        setShowPriceSettings(true)
                        return
                      }
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

      <PriceSettingsDialog
        open={showPriceSettings}
        onOpenChange={setShowPriceSettings}
      />
    </>
  )
}
