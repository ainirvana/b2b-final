"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Copy, Calendar, Package, ShoppingCart, FileText, MapPin, Users, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

interface ItinerarySetupModalProps {
  isOpen: boolean
  onClose: () => void
}

type ItineraryType = "fixed-group-tour" | "customized-package" | "cart-combo" | "html-editor"

export function ItinerarySetupModal({ isOpen, onClose }: ItinerarySetupModalProps) {
  const router = useRouter()
  const [setupType, setSetupType] = useState<"new" | "copy" | null>(null)
  const [itineraryType, setItineraryType] = useState<ItineraryType>("customized-package")
  const [formData, setFormData] = useState({
    name: "",
    days: "",
    productId: "",
    description: "",
    destination: "",
    maxParticipants: "",
    startDate: "",
    endDate: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateProductId = () => {
    const prefix = {
      "fixed-group-tour": "FGT",
      "customized-package": "CUS", 
      "cart-combo": "CRT",
      "html-editor": "HTM"
    }[itineraryType]
    
    return `${prefix}-${Date.now().toString(36).toUpperCase()}`
  }

  const handleCreateNew = () => {
    if (!formData.name || !formData.productId) {
      alert("Please fill in required fields")
      return
    }

    // Type-specific validation
    if (itineraryType === "fixed-group-tour" && (!formData.startDate || !formData.endDate)) {
      alert("Please specify start and end dates for Fixed Group Tour")
      return
    }

    if ((itineraryType === "customized-package" || itineraryType === "html-editor") && !formData.days) {
      alert("Please specify number of days")
      return
    }

    // Navigate to the appropriate builder based on type
    const queryParams = new URLSearchParams({
      name: formData.name,
      productId: formData.productId,
      type: itineraryType,
      mode: "new",
      ...(formData.description && { description: formData.description }),
      ...(formData.destination && { destination: formData.destination }),
      ...(formData.days && { days: formData.days }),
      ...(formData.startDate && { startDate: formData.startDate }),
      ...(formData.endDate && { endDate: formData.endDate }),
      ...(formData.maxParticipants && { maxParticipants: formData.maxParticipants }),
    })

    router.push(`/itinerary/builder?${queryParams.toString()}`)
    onClose()
  }

  const handleCopyExisting = () => {
    // Will implement copy functionality later
    router.push("/itinerary/builder")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
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
          <div className="space-y-6 p-4 max-h-[600px] overflow-y-auto">
            {/* Itinerary Type Selection */}
            <div>
              <Label className="text-base font-medium mb-3 block">Select Itinerary Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={itineraryType === "fixed-group-tour" ? "default" : "outline"}
                  onClick={() => setItineraryType("fixed-group-tour")}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Calendar size={20} />
                  <div className="text-center">
                    <div className="font-medium">Fixed Group Tours</div>
                    <div className="text-xs text-muted-foreground">Fixed dates & group size</div>
                  </div>
                </Button>
                
                <Button
                  variant={itineraryType === "customized-package" ? "default" : "outline"}
                  onClick={() => setItineraryType("customized-package")}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Package size={20} />
                  <div className="text-center">
                    <div className="font-medium">Customized Package</div>
                    <div className="text-xs text-muted-foreground">Day-by-day itinerary</div>
                  </div>
                </Button>
                
                <Button
                  variant={itineraryType === "cart-combo" ? "default" : "outline"}
                  onClick={() => setItineraryType("cart-combo")}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <ShoppingCart size={20} />
                  <div className="text-center">
                    <div className="font-medium">Build a Cart/Combo</div>
                    <div className="text-xs text-muted-foreground">Individual items</div>
                  </div>
                </Button>
                
                <Button
                  variant={itineraryType === "html-editor" ? "default" : "outline"}
                  onClick={() => setItineraryType("html-editor")}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <FileText size={20} />
                  <div className="text-center">
                    <div className="font-medium">HTML Editor</div>
                    <div className="text-xs text-muted-foreground">Block-based editor</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label>Itinerary Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter itinerary name"
                />
              </div>
              
              <div>
                <Label>Product ID *</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.productId}
                    onChange={(e) => handleInputChange("productId", e.target.value)}
                    placeholder="Enter product ID"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => handleInputChange("productId", generateProductId())}
                  >
                    Generate
                  </Button>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>

              <div>
                <Label>Destination</Label>
                <Input
                  value={formData.destination}
                  onChange={(e) => handleInputChange("destination", e.target.value)}
                  placeholder="Enter destination"
                />
              </div>
            </div>

            {/* Type-specific fields */}
            {itineraryType === "fixed-group-tour" && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Calendar size={16} />
                  Fixed Group Tour Settings
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>End Date *</Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange("endDate", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Maximum Participants</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.maxParticipants}
                    onChange={(e) => handleInputChange("maxParticipants", e.target.value)}
                    placeholder="Enter max participants"
                  />
                </div>
              </div>
            )}

            {(itineraryType === "customized-package" || itineraryType === "html-editor") && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Clock size={16} />
                  Duration Settings
                </h4>
                <div>
                  <Label>Number of Days *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.days}
                    onChange={(e) => handleInputChange("days", e.target.value)}
                    placeholder="Enter number of days"
                  />
                </div>
              </div>
            )}

            {itineraryType === "cart-combo" && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium flex items-center gap-2">
                  <ShoppingCart size={16} />
                  Cart/Combo Settings
                </h4>
                <p className="text-sm text-muted-foreground">
                  This type allows you to add individual items like activities, hotels, flights, etc. without specific dates.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 border-t pt-4">
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
