"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Hotel, Plane, Camera, Car, UtensilsCrossed, MapPin } from "lucide-react"
import { ICartItem } from "@/models/Itinerary"

interface CartComboBuilderProps {
  onBack: () => void
  itineraryData?: {
    name: string
    productId: string
    description?: string
  }
}

export function CartComboBuilder({ onBack, itineraryData }: CartComboBuilderProps) {
  const [cartItems, setCartItems] = useState<ICartItem[]>([])
  const [newItem, setNewItem] = useState<Partial<ICartItem>>({
    name: "",
    productId: "",
    description: "",
    category: "activity",
    price: 0,
    location: "",
  })

  const categoryIcons = {
    hotel: Hotel,
    flight: Plane,
    activity: Camera,
    transfer: Car,
    meal: UtensilsCrossed,
    other: MapPin,
  }

  const categoryColors = {
    hotel: "bg-blue-50 border-blue-200",
    flight: "bg-orange-50 border-orange-200", 
    activity: "bg-green-50 border-green-200",
    transfer: "bg-purple-50 border-purple-200",
    meal: "bg-yellow-50 border-yellow-200",
    other: "bg-gray-50 border-gray-200",
  }

  const handleAddItem = () => {
    if (!newItem.name || !newItem.productId) {
      alert("Please fill in at least name and product ID")
      return
    }

    const item: ICartItem = {
      id: `item-${Date.now()}`,
      name: newItem.name!,
      productId: newItem.productId!,
      description: newItem.description || "",
      category: newItem.category as ICartItem["category"],
      price: newItem.price || 0,
      location: newItem.location || "",
      ...(newItem.category === "hotel" && {
        nights: newItem.nights || 1,
        roomType: newItem.roomType || "",
      }),
      ...(newItem.category === "activity" && {
        duration: newItem.duration || "",
        difficulty: newItem.difficulty || "",
      }),
    }

    setCartItems([...cartItems, item])
    setNewItem({
      name: "",
      productId: "",
      description: "",
      category: "activity",
      price: 0,
      location: "",
    })
  }

  const handleRemoveItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id))
  }

  const handleSave = async () => {
    const itineraryPayload = {
      ...itineraryData,
      title: itineraryData?.name || "Cart/Combo Package",
      destination: "Multiple Locations",
      countries: ["India"],
      duration: "Flexible",
      totalPrice: cartItems.reduce((sum, item) => sum + (item.price || 0), 0),
      currency: "INR",
      status: "draft",
      createdBy: "Current User",
      days: [],
      highlights: [],
      images: [],
      itineraryType: "cart-combo",
      cartItems,
    }

    try {
      const response = await fetch("/api/itineraries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itineraryPayload),
      })

      if (response.ok) {
        alert("Cart/Combo package saved successfully!")
        onBack()
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      console.error("Error saving cart/combo:", error)
      alert("Error saving cart/combo package")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-brand-primary-50/30 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Cart/Combo Builder</h1>
            <p className="text-gray-600">Add individual items without specific dates</p>
            {itineraryData && (
              <p className="text-sm text-gray-500 mt-1">
                Building: {itineraryData.name} ({itineraryData.productId})
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={handleSave} disabled={cartItems.length === 0}>
              Save Package ({cartItems.length} items)
            </Button>
          </div>
        </div>

        {/* Add New Item Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Item
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label>Item Name *</Label>
                <Input
                  value={newItem.name || ""}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  placeholder="e.g., Mountain Resort Stay"
                />
              </div>
              <div>
                <Label>Product ID *</Label>
                <Input
                  value={newItem.productId || ""}
                  onChange={(e) => setNewItem({...newItem, productId: e.target.value})}
                  placeholder="e.g., HTL-001"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select 
                  value={newItem.category} 
                  onValueChange={(value) => setNewItem({...newItem, category: value as ICartItem["category"]})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="flight">Flight</SelectItem>
                    <SelectItem value="activity">Activity</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="meal">Meal</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price (INR)</Label>
                <Input
                  type="number"
                  value={newItem.price || ""}
                  onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={newItem.location || ""}
                  onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                  placeholder="e.g., Manali"
                />
              </div>
              
              {/* Category-specific fields */}
              {newItem.category === "hotel" && (
                <>
                  <div>
                    <Label>Nights</Label>
                    <Input
                      type="number"
                      value={newItem.nights || ""}
                      onChange={(e) => setNewItem({...newItem, nights: Number(e.target.value)})}
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <Label>Room Type</Label>
                    <Input
                      value={newItem.roomType || ""}
                      onChange={(e) => setNewItem({...newItem, roomType: e.target.value})}
                      placeholder="e.g., Deluxe"
                    />
                  </div>
                </>
              )}
              
              {newItem.category === "activity" && (
                <>
                  <div>
                    <Label>Duration</Label>
                    <Input
                      value={newItem.duration || ""}
                      onChange={(e) => setNewItem({...newItem, duration: e.target.value})}
                      placeholder="e.g., 3 hours"
                    />
                  </div>
                  <div>
                    <Label>Difficulty</Label>
                    <Select 
                      value={newItem.difficulty || ""} 
                      onValueChange={(value) => setNewItem({...newItem, difficulty: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
            
            <div>
              <Label>Description</Label>
              <Textarea
                value={newItem.description || ""}
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                placeholder="Describe this item..."
                rows={2}
              />
            </div>
            
            <Button onClick={handleAddItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardContent>
        </Card>

        {/* Cart Items List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Cart Items ({cartItems.length})
            {cartItems.length > 0 && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                Total: ₹{cartItems.reduce((sum, item) => sum + (item.price || 0), 0).toLocaleString()}
              </span>
            )}
          </h2>
          
          {cartItems.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500">No items added yet. Add items above to build your package.</p>
              </CardContent>
            </Card>
          ) : (
            cartItems.map((item) => {
              const Icon = categoryIcons[item.category]
              const colorClass = categoryColors[item.category]
              
              return (
                <Card key={item.id} className={`${colorClass}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Icon className="h-5 w-5 mt-1 text-gray-600" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{item.name}</h3>
                            <span className="text-xs bg-white px-2 py-1 rounded-full border">
                              {item.category}
                            </span>
                            <span className="text-xs text-gray-600">
                              {item.productId}
                            </span>
                          </div>
                          
                          {item.location && (
                            <p className="text-sm text-gray-600 mb-1">
                              📍 {item.location}
                            </p>
                          )}
                          
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {item.price && (
                              <span className="font-medium">₹{item.price.toLocaleString()}</span>
                            )}
                            {item.nights && (
                              <span>{item.nights} night{item.nights > 1 ? "s" : ""}</span>
                            )}
                            {item.roomType && (
                              <span>{item.roomType}</span>
                            )}
                            {item.duration && (
                              <span>{item.duration}</span>
                            )}
                            {item.difficulty && (
                              <span className="capitalize">{item.difficulty}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}