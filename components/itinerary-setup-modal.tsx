"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Copy, Calendar, Package, ShoppingCart, FileText } from "lucide-react"
import { useRouter } from "next/navigation"

interface ItinerarySetupModalProps {
  isOpen: boolean
  onClose: () => void
}

type ItineraryType = "fixed-group" | "customized" | "cart-combo" | "html-editor"

export function ItinerarySetupModal({ isOpen, onClose }: ItinerarySetupModalProps) {
  const router = useRouter()
  const [setupType, setSetupType] = useState<"new" | "copy" | null>(null)
  const [itineraryType, setItineraryType] = useState<ItineraryType | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    days: "",
    productId: "",
    description: "",
    // Fixed Group specific
    startDate: null as Date | null,
    endDate: null as Date | null,
    maxGroupSize: "",
  })

  const handleInputChange = (field: string, value: string | Date | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCreateNew = () => {
    if (!itineraryType) {
      alert("Please select an itinerary type")
      return
    }

    // Validate required fields based on type
    if (itineraryType === "fixed-group") {
      if (!formData.name || !formData.productId || !formData.startDate || !formData.endDate) {
        alert("Please fill in all required fields for Fixed Group Tours")
        return
      }
    } else if (itineraryType === "customized") {
      if (!formData.name || !formData.days || !formData.productId) {
        alert("Please fill in all required fields for Customized Package")
        return
      }
    } else if (itineraryType === "cart-combo") {
      if (!formData.name || !formData.productId) {
        alert("Please fill in name and product ID for Cart/Combo")
        return
      }
    } else if (itineraryType === "html-editor") {
      if (!formData.name || !formData.productId) {
        alert("Please fill in name and product ID for HTML Editor")
        return
      }
    }

    // Navigate to the appropriate builder with query parameters
    const params = new URLSearchParams({
      name: formData.name,
      productId: formData.productId,
      itineraryType,
      mode: "new",
      ...(formData.days && { days: formData.days }),
      ...(formData.description && { description: formData.description }),
      ...(formData.startDate && { startDate: formData.startDate.toISOString() }),
      ...(formData.endDate && { endDate: formData.endDate.toISOString() }),
      ...(formData.maxGroupSize && { maxGroupSize: formData.maxGroupSize }),
    })

    router.push(`/itinerary/builder?${params.toString()}`)
    onClose()
  }

  const resetForm = () => {
    setSetupType(null)
    setItineraryType(null)
    setFormData({
      name: "",
      days: "",
      productId: "",
      description: "",
      startDate: null,
      endDate: null,
      maxGroupSize: "",
    })
  }

  const itineraryTypes = [
    {
      type: "fixed-group" as ItineraryType,
      title: "Fixed Group Tours",
      description: "Tours with fixed dates and group sizes",
      icon: Calendar,
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    },
    {
      type: "customized" as ItineraryType,
      title: "Customized Package",
      description: "Fully customizable itineraries",
      icon: Package,
      color: "bg-green-50 border-green-200 hover:bg-green-100",
    },
    {
      type: "cart-combo" as ItineraryType,
      title: "Cart/Combo Builder",
      description: "Individual items without specific dates",
      icon: ShoppingCart,
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
    },
    {
      type: "html-editor" as ItineraryType,
      title: "HTML Text Editor",
      description: "Rich text editor with HTML blocks",
      icon: FileText,
      color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
    },
  ]

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          resetForm()
          onClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
          <div className="space-y-6 p-4">
            {!itineraryType ? (
              <>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">Select Itinerary Type</h3>
                  <p className="text-sm text-gray-500">Choose the type of itinerary you want to create</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {itineraryTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <Button
                        key={type.type}
                        onClick={() => setItineraryType(type.type)}
                        variant="outline"
                        className={`h-24 flex flex-col items-center justify-center gap-2 text-left ${type.color}`}
                      >
                        <Icon size={20} />
                        <div>
                          <div className="font-medium">{type.title}</div>
                          <div className="text-xs text-gray-600">{type.description}</div>
                        </div>
                      </Button>
                    )
                  })}
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setSetupType(null)}>
                    Back
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {itineraryTypes.find(t => t.type === itineraryType)?.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {itineraryTypes.find(t => t.type === itineraryType)?.description}
                  </p>
                </div>

                {/* Common fields */}
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
                    <Input
                      value={formData.productId}
                      onChange={(e) => handleInputChange("productId", e.target.value)}
                      placeholder="Enter product ID"
                    />
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

                  {/* Conditional fields based on itinerary type */}
                  {itineraryType === "customized" && (
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
                  )}

                  {itineraryType === "fixed-group" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Start Date *</Label>
                          <Input
                            type="date"
                            value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
                            onChange={(e) => {
                              const date = e.target.value ? new Date(e.target.value) : null
                              handleInputChange("startDate", date)
                            }}
                          />
                        </div>
                        <div>
                          <Label>End Date *</Label>
                          <Input
                            type="date"
                            value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''}
                            onChange={(e) => {
                              const date = e.target.value ? new Date(e.target.value) : null
                              handleInputChange("endDate", date)
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Maximum Group Size</Label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.maxGroupSize}
                          onChange={(e) => handleInputChange("maxGroupSize", e.target.value)}
                          placeholder="Enter maximum group size"
                        />
                      </div>
                    </>
                  )}

                  {itineraryType === "cart-combo" && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-700">
                        Cart/Combo mode allows you to add individual items like activities, hotels, flights, etc. 
                        without specific dates. Items can be combined flexibly.
                      </p>
                    </div>
                  )}

                  {itineraryType === "html-editor" && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-orange-700">
                        HTML Editor mode provides a rich text editor with HTML blocks (H1, p, lists, etc.) 
                        for creating complete itineraries using structured content.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setItineraryType(null)}>
                    Back
                  </Button>
                  <Button onClick={handleCreateNew}>
                    Create Itinerary
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4 p-4">
            <p>Copy functionality coming soon...</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSetupType(null)}>
                Back
              </Button>
              <Button onClick={() => router.push("/itinerary/builder")}>
                Continue
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
