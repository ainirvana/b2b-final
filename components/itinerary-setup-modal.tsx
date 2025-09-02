"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Copy } from "lucide-react"
import { useRouter } from "next/navigation"

interface ItinerarySetupModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ItinerarySetupModal({ isOpen, onClose }: ItinerarySetupModalProps) {
  const router = useRouter()
  const [setupType, setSetupType] = useState<"new" | "copy" | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    days: "",
    productId: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCreateNew = () => {
    if (!formData.name || !formData.days || !formData.productId) {
      alert("Please fill in all fields")
      return
    }

    // Navigate to the builder with query parameters
    router.push(`/itinerary/builder?name=${encodeURIComponent(formData.name)}&days=${formData.days}&productId=${encodeURIComponent(formData.productId)}&mode=new`)
    onClose()
  }

  const handleCopyExisting = () => {
    // Will implement copy functionality later
    router.push("/itinerary/builder")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Itinerary</DialogTitle>
        </DialogHeader>

        {!setupType ? (
          <div className="grid grid-cols-2 gap-4 p-4">
            <Button
              onClick={() => setSetupType("new")}
              className="h-32 flex flex-col items-center justify-center gap-2"
            >
              <Plus size={24} />
              <span>Create New</span>
            </Button>
            <Button
              onClick={() => setSetupType("copy")}
              className="h-32 flex flex-col items-center justify-center gap-2"
              variant="outline"
            >
              <Copy size={24} />
              <span>Copy Existing</span>
            </Button>
          </div>
        ) : setupType === "new" ? (
          <div className="space-y-4 p-4">
            <div>
              <Label>Itinerary Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter itinerary name"
              />
            </div>
            <div>
              <Label>Number of Days</Label>
              <Input
                type="number"
                min="1"
                value={formData.days}
                onChange={(e) => handleInputChange("days", e.target.value)}
                placeholder="Enter number of days"
              />
            </div>
            <div>
              <Label>Product ID</Label>
              <Input
                value={formData.productId}
                onChange={(e) => handleInputChange("productId", e.target.value)}
                placeholder="Enter product ID"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSetupType(null)}>
                Back
              </Button>
              <Button onClick={handleCreateNew}>
                Create Itinerary
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            <p>Copy functionality coming soon...</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSetupType(null)}>
                Back
              </Button>
              <Button onClick={handleCopyExisting}>
                Continue
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
