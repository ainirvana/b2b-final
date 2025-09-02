"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Palette } from "lucide-react"

interface BrandingSettings {
  headerLogo?: string
  headerText?: string
  footerLogo?: string
  footerText?: string
  primaryColor?: string
  secondaryColor?: string
}

interface BrandingSettingsProps {
  branding: BrandingSettings
  onUpdate: (branding: BrandingSettings) => void
}

export function BrandingSettings({ branding, onUpdate }: BrandingSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleUpdate = (field: keyof BrandingSettings, value: string) => {
    onUpdate({ ...branding, [field]: value })
  }

  const handleLogoUpload = async (file: File, type: "header" | "footer") => {
    try {
      // In a real implementation, upload to your storage service
      const logoUrl = URL.createObjectURL(file)
      handleUpdate(type === "header" ? "headerLogo" : "footerLogo", logoUrl)
    } catch (error) {
      console.error("Failed to upload logo:", error)
    }
  }

  if (!isOpen) {
    return (
      <Button variant="outline" onClick={() => setIsOpen(true)} className="mb-4">
        <Palette className="h-4 w-4 mr-2" />
        Brand Settings
      </Button>
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Brand Settings</span>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Header Branding */}
        <div className="space-y-4">
          <h4 className="font-medium">Header Branding</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="headerLogo">Header Logo</Label>
              <div className="mt-2">
                {branding.headerLogo ? (
                  <div className="relative">
                    <img
                      src={branding.headerLogo || "/placeholder.svg"}
                      alt="Header Logo"
                      className="h-16 object-contain"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-transparent"
                      onClick={() => {
                        const input = document.createElement("input")
                        input.type = "file"
                        input.accept = "image/*"
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0]
                          if (file) handleLogoUpload(file, "header")
                        }
                        input.click()
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Change Logo
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const input = document.createElement("input")
                      input.type = "file"
                      input.accept = "image/*"
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) handleLogoUpload(file, "header")
                      }
                      input.click()
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="headerText">Header Text</Label>
              <Input
                id="headerText"
                value={branding.headerText || ""}
                onChange={(e) => handleUpdate("headerText", e.target.value)}
                placeholder="Your Company Name"
              />
            </div>
          </div>
        </div>

        {/* Footer Branding */}
        <div className="space-y-4">
          <h4 className="font-medium">Footer Branding</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="footerLogo">Footer Logo</Label>
              <div className="mt-2">
                {branding.footerLogo ? (
                  <div className="relative">
                    <img
                      src={branding.footerLogo || "/placeholder.svg"}
                      alt="Footer Logo"
                      className="h-12 object-contain"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-transparent"
                      onClick={() => {
                        const input = document.createElement("input")
                        input.type = "file"
                        input.accept = "image/*"
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0]
                          if (file) handleLogoUpload(file, "footer")
                        }
                        input.click()
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Change Logo
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const input = document.createElement("input")
                      input.type = "file"
                      input.accept = "image/*"
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) handleLogoUpload(file, "footer")
                      }
                      input.click()
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="footerText">Footer Text</Label>
              <Textarea
                id="footerText"
                value={branding.footerText || ""}
                onChange={(e) => handleUpdate("footerText", e.target.value)}
                placeholder="Contact information, terms, etc."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Color Scheme */}
        <div className="space-y-4">
          <h4 className="font-medium">Color Scheme</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={branding.primaryColor || "#3B82F6"}
                  onChange={(e) => handleUpdate("primaryColor", e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={branding.primaryColor || "#3B82F6"}
                  onChange={(e) => handleUpdate("primaryColor", e.target.value)}
                  placeholder="#3B82F6"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={branding.secondaryColor || "#10B981"}
                  onChange={(e) => handleUpdate("secondaryColor", e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={branding.secondaryColor || "#10B981"}
                  onChange={(e) => handleUpdate("secondaryColor", e.target.value)}
                  placeholder="#10B981"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
