"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Save,
  Trash2,
  ShoppingCart,
  Plane,
  Car,
  UtensilsCrossed,
  Camera,
  Sun,
  Edit,
  Package,
  GripVertical,
  ChevronDown,
  ChevronLeft,
  Building2,
  Tent,
  ArrowRight,
  Eye,
  X,
} from "lucide-react"
import { ICartItem } from "@/models/Itinerary"
import { useToast } from "@/hooks/use-toast"
import { GalleryUpload } from "./itinerary-builder/gallery-upload"
import type { IGalleryItem } from "@/models/Itinerary"

interface CartComboBuilderProps {
  itineraryId?: string
  onBack: () => void
}

const CATEGORY_ICONS = {
  activity: Camera,
  hotel: Sun,
  flight: Plane,
  transfer: Car,
  meal: UtensilsCrossed,
  other: Package,
}

const CATEGORY_COLORS = {
  activity: "bg-green-50 border-green-200 text-green-800",
  hotel: "bg-blue-50 border-blue-200 text-blue-800",
  flight: "bg-orange-50 border-orange-200 text-orange-800",
  transfer: "bg-purple-50 border-purple-200 text-purple-800",
  meal: "bg-yellow-50 border-yellow-200 text-yellow-800",
  other: "bg-gray-50 border-gray-200 text-gray-800",
}

const COMPONENT_TEMPLATES = [
  {
    category: "flight",
    title: "Flight",
    icon: Plane,
    color: "bg-orange-50 border-orange-200",
  },
  {
    category: "transfer",
    title: "Transfer",
    icon: Car,
    color: "bg-purple-50 border-purple-200",
  },
  {
    category: "hotel",
    title: "Hotel",
    icon: Building2,
    color: "bg-blue-50 border-blue-200",
  },
  {
    category: "activity",
    title: "Activity",
    icon: Tent,
    color: "bg-green-50 border-green-200",
  },
  {
    category: "meal",
    title: "Meals",
    icon: UtensilsCrossed,
    color: "bg-yellow-50 border-yellow-200",
  },
  {
    category: "other",
    title: "Others",
    icon: Package,
    color: "bg-gray-50 border-gray-200",
  },
]

export function CartComboBuilder({ itineraryId, onBack }: CartComboBuilderProps) {
  const { toast } = useToast()
  const [title, setTitle] = useState("New Cart/Combo")
  const [description, setDescription] = useState("")
  const [productId, setProductId] = useState(`CRT-${Date.now().toString(36).toUpperCase()}`)
  const [cartItems, setCartItems] = useState<ICartItem[]>([])
  const [showAddItemForm, setShowAddItemForm] = useState(false)
  const [editingItem, setEditingItem] = useState<ICartItem | null>(null)
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false)
  const [draggedComponent, setDraggedComponent] = useState<any>(null)
  const [itemForm, setItemForm] = useState<Partial<ICartItem>>({
    name: "",
    description: "",
    category: "activity" as ICartItem["category"],
    price: 0,
    currency: "USD",
    date: "",
    nights: 0,
    quantity: 1,
    // Flight fields
    fromCity: "",
    toCity: "",
    airline: "",
    flightNumber: "",
    startTime: "",
    endTime: "",
    flightClass: "",
    // Hotel fields
    hotelName: "",
    location: "",
    checkIn: "",
    checkOut: "",
    roomCategory: "",
    // Transfer fields
    fromLocation: "",
    toLocation: "",
    vehicleType: "",
    transferType: "private" as "private" | "shared",
    // Activity fields
    duration: "",
    difficulty: "",
    // Meal fields
    mealType: "",
  })

  // Gallery state
  const [gallery, setGallery] = useState<IGalleryItem[]>([])

  // Preview state
  const [showPreview, setShowPreview] = useState(false)

  // Check for view mode from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const mode = params.get('mode')
      if (mode === 'view' && cartItems.length > 0) {
        setShowPreview(true)
      }
    }
  }, [cartItems.length])

  // Load existing cart data if editing
  useEffect(() => {
    if (itineraryId) {
      loadCartData()
    }
  }, [])

  const loadCartData = async () => {
    try {
      const response = await fetch(`/api/itineraries/${itineraryId}`)
      if (response.ok) {
        const data = await response.json()
        setTitle(data.title || "Cart/Combo")
        setDescription(data.description || "")
        setProductId(data.productId || productId)
        setCartItems(data.cartItems || [])
        setGallery(data.gallery || [])
      }
    } catch (error) {
      console.error("Failed to load cart data:", error)
      toast({
        title: "Error",
        description: "Failed to load cart data",
        variant: "destructive",
      })
    }
  }

  const handleComponentDragStart = (component: any) => {
    setDraggedComponent(component)
  }

  const handleDropZoneDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedComponent) {
      resetItemForm()
      setItemForm((prev) => ({
        ...prev,
        category: draggedComponent.category,
      }))
      setShowAddItemForm(true)
      setDraggedComponent(null)
    }
  }

  const handleAddItem = () => {
    if (!itemForm.name || !itemForm.price || !itemForm.date) {
      toast({
        title: "Validation Error",
        description: "Please fill in name, price, and date (date is mandatory)",
        variant: "destructive",
      })
      return
    }

    const newItem: ICartItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId: `${productId}-${cartItems.length + 1}`,
      name: itemForm.name!,
      description: itemForm.description || "",
      category: itemForm.category!,
      price: itemForm.price!,
      date: itemForm.date!,
      currency: itemForm.currency,
      quantity: itemForm.quantity || 1,
      addedAt: new Date(),
      ...(itemForm.category === "hotel" && itemForm.nights && { nights: itemForm.nights }),
      // Flight fields
      ...(itemForm.category === "flight" && {
        fromCity: itemForm.fromCity,
        toCity: itemForm.toCity,
        airline: itemForm.airline,
        flightNumber: itemForm.flightNumber,
        startTime: itemForm.startTime,
        endTime: itemForm.endTime,
        flightClass: itemForm.flightClass,
      }),
      // Hotel fields
      ...(itemForm.category === "hotel" && {
        hotelName: itemForm.hotelName,
        location: itemForm.location,
        checkIn: itemForm.checkIn,
        checkOut: itemForm.checkOut,
        roomCategory: itemForm.roomCategory,
      }),
      // Transfer fields
      ...(itemForm.category === "transfer" && {
        fromLocation: itemForm.fromLocation,
        toLocation: itemForm.toLocation,
        vehicleType: itemForm.vehicleType,
        transferType: itemForm.transferType,
      }),
      // Activity fields
      ...(itemForm.category === "activity" && {
        duration: itemForm.duration,
        difficulty: itemForm.difficulty,
        location: itemForm.location,
      }),
      // Meal fields
      ...(itemForm.category === "meal" && {
        mealType: itemForm.mealType,
      }),
    }

    setCartItems([...cartItems, newItem])
    resetItemForm()
    setShowAddItemForm(false)

    toast({
      title: "Success",
      description: "Item added to cart",
    })
  }

  const handleEditItem = (item: ICartItem) => {
    setEditingItem(item)
    setItemForm({
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      currency: item.currency || "USD",
      date: item.date,
      nights: item.nights || 0,
      quantity: item.quantity,
      // Flight fields
      fromCity: item.fromCity || "",
      toCity: item.toCity || "",
      airline: item.airline || "",
      flightNumber: item.flightNumber || "",
      startTime: item.startTime || "",
      endTime: item.endTime || "",
      flightClass: item.flightClass || "",
      // Hotel fields
      hotelName: item.hotelName || "",
      location: item.location || "",
      checkIn: item.checkIn || "",
      checkOut: item.checkOut || "",
      roomCategory: item.roomCategory || "",
      // Transfer fields
      fromLocation: item.fromLocation || "",
      toLocation: item.toLocation || "",
      vehicleType: item.vehicleType || "",
      transferType: item.transferType || "private",
      // Activity fields
      duration: item.duration || "",
      difficulty: item.difficulty || "",
      // Meal fields
      mealType: item.mealType || "",
    })
    setShowAddItemForm(true)
  }

  const handleUpdateItem = () => {
    if (!editingItem || !itemForm.name || !itemForm.price || !itemForm.date) {
      toast({
        title: "Validation Error",
        description: "Please fill in name, price, and date (date is mandatory)",
        variant: "destructive",
      })
      return
    }

    const updatedItems = cartItems.map((item) =>
      item.id === editingItem.id
        ? {
          ...item,
          name: itemForm.name!,
          description: itemForm.description || "",
          category: itemForm.category!,
          price: itemForm.price!,
          currency: itemForm.currency,
          date: itemForm.date!,
          quantity: itemForm.quantity || 1,
          ...(itemForm.category === "hotel" && itemForm.nights && { nights: itemForm.nights }),
          // Flight fields
          ...(itemForm.category === "flight" && {
            fromCity: itemForm.fromCity,
            toCity: itemForm.toCity,
            airline: itemForm.airline,
            flightNumber: itemForm.flightNumber,
            startTime: itemForm.startTime,
            endTime: itemForm.endTime,
            flightClass: itemForm.flightClass,
          }),
          // Hotel fields
          ...(itemForm.category === "hotel" && {
            hotelName: itemForm.hotelName,
            location: itemForm.location,
            checkIn: itemForm.checkIn,
            checkOut: itemForm.checkOut,
            roomCategory: itemForm.roomCategory,
          }),
          // Transfer fields
          ...(itemForm.category === "transfer" && {
            fromLocation: itemForm.fromLocation,
            toLocation: itemForm.toLocation,
            vehicleType: itemForm.vehicleType,
            transferType: itemForm.transferType,
          }),
          // Activity fields
          ...(itemForm.category === "activity" && {
            duration: itemForm.duration,
            difficulty: itemForm.difficulty,
            location: itemForm.location,
          }),
          // Meal fields
          ...(itemForm.category === "meal" && {
            mealType: itemForm.mealType,
          }),
        }
        : item
    )

    setCartItems(updatedItems)
    resetItemForm()
    setShowAddItemForm(false)
    setEditingItem(null)

    toast({
      title: "Success",
      description: "Item updated successfully",
    })
  }

  const handleDeleteItem = (itemId: string) => {
    setCartItems(cartItems.filter((item) => item.id !== itemId))
    toast({
      title: "Success",
      description: "Item removed from cart",
    })
  }

  const resetItemForm = () => {
    setItemForm({
      name: "",
      description: "",
      category: "activity",
      price: 0,
      currency: "USD",
      date: "",
      nights: 0,
      quantity: 1,
      fromCity: "",
      toCity: "",
      airline: "",
      flightNumber: "",
      startTime: "",
      endTime: "",
      flightClass: "",
      hotelName: "",
      location: "",
      checkIn: "",
      checkOut: "",
      roomCategory: "",
      fromLocation: "",
      toLocation: "",
      vehicleType: "",
      transferType: "private",
      duration: "",
      difficulty: "",
      mealType: "",
    })
  }

  const handleSave = async () => {
    try {
      const itineraryData = {
        productId,
        title,
        description,
        type: "cart-combo",
        destination: "Multiple",
        duration: "Variable",
        totalPrice: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        currency: "USD",
        createdBy: "agent-user",
        lastUpdatedBy: "agent-user",
        countries: [],
        days: [],
        highlights: [],
        images: [],
        cartItems,
        gallery,
      }

      const url = itineraryId ? `/api/itineraries/${itineraryId}` : "/api/itineraries"
      const method = itineraryId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itineraryData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Cart/Combo ${itineraryId ? "updated" : "created"} successfully`,
        })
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast({
        title: "Error",
        description: "Failed to save cart/combo",
        variant: "destructive",
      })
    }
  }

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item.price) || 0
      const quantity = Number(item.quantity) || 1
      return sum + (price * quantity)
    }, 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0
      return sum + quantity
    }, 0)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const day = date.getDate()
    const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
    const year = date.getFullYear()
    return { day, month, year }
  }

  // Sort cart items by date
  const sortedCartItems = [...cartItems].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  // Render item details based on category
  const renderItemDetails = (item: ICartItem) => {
    switch (item.category) {
      case "flight":
        return (
          <div className="flex items-center gap-2 text-sm text-gray-700 mt-2">
            <span className="font-medium">{item.fromCity || "N/A"}</span>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{item.toCity || "N/A"}</span>
            {item.airline && <span className="text-gray-500">• {item.airline}</span>}
            {item.flightNumber && <span className="text-gray-500">• {item.flightNumber}</span>}
          </div>
        )
      case "hotel":
        return (
          <div className="text-sm text-gray-700 mt-2">
            {item.hotelName && <p className="font-medium">{item.hotelName}</p>}
            {item.location && <p className="text-gray-600">{item.location}</p>}
            {item.checkIn && item.checkOut && (
              <p className="text-gray-500">
                Check-in: {item.checkIn} • Check-out: {item.checkOut}
              </p>
            )}
          </div>
        )
      case "transfer":
        return (
          <div className="flex items-center gap-2 text-sm text-gray-700 mt-2">
            <span className="font-medium">{item.fromLocation || "N/A"}</span>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{item.toLocation || "N/A"}</span>
            {item.vehicleType && <span className="text-gray-500">• {item.vehicleType}</span>}
            {item.transferType && <span className="text-gray-500 capitalize">• {item.transferType}</span>}
          </div>
        )
      case "activity":
        return (
          <div className="text-sm text-gray-700 mt-2">
            {item.location && <p className="text-gray-600">{item.location}</p>}
            <div className="flex gap-2">
              {item.duration && <span className="text-gray-500">Duration: {item.duration}</span>}
              {item.difficulty && <span className="text-gray-500 capitalize">• {item.difficulty}</span>}
            </div>
          </div>
        )
      case "meal":
        return (
          <div className="text-sm text-gray-700 mt-2">
            {item.mealType && <span className="text-gray-600 capitalize">{item.mealType}</span>}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen relative">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Cart/Combo Builder</h1>
              <p className="text-sm text-gray-500">Build individual item collections</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPreview(true)} disabled={cartItems.length === 0}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Basic Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter cart/combo title" />
            </div>
            <div>
              <Label>Product ID</Label>
              <Input value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="Enter product ID" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cart Items Drop Zone */}
        <Card
          className="mb-6 border-2 border-dashed"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropZoneDrop}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart Items ({cartItems.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {sortedCartItems.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium mb-2">No items in cart</p>
                <p className="text-sm text-gray-500">Drag components from the right sidebar to add items</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedCartItems.map((item) => {
                  const IconComponent = CATEGORY_ICONS[item.category]
                  const { day, month, year } = formatDate(item.date)
                  return (
                    <div
                      key={item.id}
                      className="border-2 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white"
                    >
                      <div className="flex items-center">
                        {/* Date Section - Left Side */}
                        <div className="flex-shrink-0 w-32 bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 flex flex-col items-center justify-center">
                          <div className="text-4xl font-black leading-none">{day}</div>
                          <div className="text-lg font-bold tracking-wider mt-1">{month}</div>
                          <div className="text-sm font-medium mt-1 opacity-90">{year}</div>
                        </div>

                        {/* Content Section - Middle */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${CATEGORY_COLORS[item.category]}`}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-lg text-gray-900">{item.name}</h4>
                              {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                              {renderItemDetails(item)}
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <Badge variant="secondary" className="text-xs capitalize">
                                  {item.category}
                                </Badge>
                                <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                                {item.nights && <span className="text-xs text-gray-500">{item.nights} nights</span>}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Price and Actions - Right Side */}
                        <div className="flex-shrink-0 flex items-center gap-4 pr-4">
                          <div className="text-right">
                            <p className="text-2xl font-black text-gray-900">
                              {item.currency === "INR" ? "₹" : "$"}
                              {((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-gray-500">
                                {item.currency === "INR" ? "₹" : "$"}
                                {(Number(item.price) || 0).toFixed(2)} each
                              </p>
                            )}
                          </div>

                          <div className="h-12 w-px bg-gray-200" />

                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEditItem(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gallery */}
        <Card>
          <CardHeader>
            <CardTitle>Gallery</CardTitle>
          </CardHeader>
          <CardContent>
            <GalleryUpload gallery={gallery} onGalleryUpdate={setGallery} />
          </CardContent>
        </Card>

        {/* Summary Card at Bottom */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-lg">
              <span className="font-medium">Total Items:</span>
              <span className="font-bold text-blue-900">{getTotalItems()}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="font-medium">Total Categories:</span>
              <span className="font-bold text-blue-900">
                {new Set(cartItems.map((item) => item.category)).size}
              </span>
            </div>
            <div className="border-t-2 border-blue-200 pt-3">
              <div className="flex justify-between text-xl">
                <span className="font-bold">Total Price:</span>
                <span className="font-black text-2xl text-blue-900">${getTotalPrice().toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Component Sidebar */}
      <div
        className={`border-l bg-white flex flex-col h-screen transition-all duration-300 ${isSidebarMinimized ? "w-20" : "w-80"
          }`}
      >
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-4 border-b flex-shrink-0 flex items-center justify-between">
              {!isSidebarMinimized && <h3 className="font-semibold text-lg">Components</h3>}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
                className="p-2"
                title={isSidebarMinimized ? "Expand sidebar" : "Minimize sidebar"}
              >
                {isSidebarMinimized ? <ChevronLeft className="h-4 w-4" /> : <ChevronDown className="h-4 w-4 rotate-90" />}
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              <div className={`space-y-3 ${isSidebarMinimized ? "flex flex-col items-center" : ""}`}>
                {COMPONENT_TEMPLATES.map((component) => {
                  const Icon = component.icon
                  return (
                    <Card
                      key={component.category}
                      className={`${component.color} cursor-move hover:shadow-md transition-shadow ${isSidebarMinimized ? "w-12 h-12 flex items-center justify-center" : ""
                        }`}
                      draggable
                      onDragStart={() => handleComponentDragStart(component)}
                      title={isSidebarMinimized ? component.title : undefined}
                    >
                      <CardContent
                        className={isSidebarMinimized ? "p-0 flex items-center justify-center" : "p-3"}
                      >
                        {isSidebarMinimized ? (
                          <Icon className="h-5 w-5" />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                            <Icon className="h-4 w-4" />
                            <span className="font-medium">{component.title}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      {showAddItemForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">{editingItem ? "Edit Item" : "Add New Item"}</h3>
            <div className="space-y-4">
              {/* Common Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={itemForm.date}
                    onChange={(e) => setItemForm((prev) => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <select
                    value={itemForm.category}
                    onChange={(e) =>
                      setItemForm((prev) => ({ ...prev, category: e.target.value as ICartItem["category"] }))
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="flight">Flight</option>
                    <option value="hotel">Hotel</option>
                    <option value="transfer">Transfer</option>
                    <option value="activity">Activity</option>
                    <option value="meal">Meal</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={itemForm.name}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description"
                  rows={2}
                />
              </div>

              {/* Category-Specific Fields */}
              {itemForm.category === "flight" && (
                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-semibold text-sm text-gray-700">Flight Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>From City</Label>
                      <Input
                        value={itemForm.fromCity}
                        onChange={(e) => setItemForm((prev) => ({ ...prev, fromCity: e.target.value }))}
                        placeholder="Origin"
                      />
                    </div>
                    <div>
                      <Label>To City</Label>
                      <Input
                        value={itemForm.toCity}
                        onChange={(e) => setItemForm((prev) => ({ ...prev, toCity: e.target.value }))}
                        placeholder="Destination"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Airline</Label>
                      <Input
                        value={itemForm.airline}
                        onChange={(e) => setItemForm((prev) => ({ ...prev, airline: e.target.value }))}
                        placeholder="Airline name"
                      />
                    </div>
                    <div>
                      <Label>Flight Number</Label>
                      <Input
                        value={itemForm.flightNumber}
                        onChange={(e) => setItemForm((prev) => ({ ...prev, flightNumber: e.target.value }))}
                        placeholder="XX123"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Departure Time</Label>
                      <Input
                        type="time"
                        value={itemForm.startTime}
                        onChange={(e) => setItemForm((prev) => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Arrival Time</Label>
                      <Input
                        type="time"
                        value={itemForm.endTime}
                        onChange={(e) => setItemForm((prev) => ({ ...prev, endTime: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Class</Label>
                      <select
                        value={itemForm.flightClass}
                        onChange={(e) => setItemForm((prev) => ({ ...prev, flightClass: e.target.value }))}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Select</option>
                        <option value="Economy">Economy</option>
                        <option value="Premium Economy">Premium Economy</option>
                        <option value="Business">Business</option>
                        <option value="First Class">First Class</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {itemForm.category === "hotel" && (
                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-semibold text-sm text-gray-700">Hotel Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Hotel Name</Label>
                      <Input
                        value={itemForm.hotelName}
                        onChange={(e) => setItemForm((prev) => ({ ...prev, hotelName: e.target.value }))}
                        placeholder="Hotel name"
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={itemForm.location}
                        onChange={(e) => setItemForm((prev) => ({ ...prev, location: e.target.value }))}
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Check-in</Label>
                      <Input
                        type="time"
                        value={itemForm.checkIn}
                        onChange={(e) => setItemForm((prev) => ({ ...prev, checkIn: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Check-out</Label>
                      <Input
                        type="time"
                        value={itemForm.checkOut}
                        onChange={(e) => setItemForm((prev) => ({ ...prev, checkOut: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Nights</Label>
                      <Input
                        type="number"
                        min="0"
                        value={itemForm.nights === 0 || itemForm.nights ? itemForm.nights : ""}
                        onChange={(e) =>
                          setItemForm((prev) => ({ ...prev, nights: e.target.value ? parseInt(e.target.value) || 0 : 0 }))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Room Category</Label>
                    <Input
                      value={itemForm.roomCategory}
                      onChange={(e) => setItemForm((prev) => ({ ...prev, roomCategory: e.target.value }))}
                      placeholder="e.g., Deluxe, Suite"
                    />
                  </div>
                </div>
              )}

              {itemForm.category === "transfer" && (
                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-semibold text-sm text-gray-700">Transfer Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>From Location</Label>
                      <Input
                        value={itemForm.fromLocation}
                        onChange={(e) => setItemForm((prev) => ({ ...prev, fromLocation: e.target.value }))}
                        placeholder="Pickup location"
                      />
                    </div>
                    <div>
                      <Label>To Location</Label>
                      <Input
                        value={itemForm.toLocation}
                        onChange={(e) => setItemForm((prev) => ({ ...prev, toLocation: e.target.value }))}
                        placeholder="Drop location"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Vehicle Type</Label>
                      <Input
                        value={itemForm.vehicleType}
                        onChange={(e) => setItemForm((prev) => ({ ...prev, vehicleType: e.target.value }))}
                        placeholder="e.g., Sedan, SUV"
                      />
                    </div>
                    <div>
                      <Label>Transfer Type</Label>
                      <select
                        value={itemForm.transferType}
                        onChange={(e) =>
                          setItemForm((prev) => ({
                            ...prev,
                            transferType: e.target.value as "private" | "shared",
                          }))
                        }
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="private">Private</option>
                        <option value="shared">Shared</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {itemForm.category === "activity" && (
                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-semibold text-sm text-gray-700">Activity Details</h4>
                  <div>
                    <Label>Location</Label>
                    <Input
                      value={itemForm.location}
                      onChange={(e) => setItemForm((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="Activity location"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Duration</Label>
                      <Input
                        value={itemForm.duration}
                        onChange={(e) => setItemForm((prev) => ({ ...prev, duration: e.target.value }))}
                        placeholder="e.g., 2 hours"
                      />
                    </div>
                    <div>
                      <Label>Difficulty</Label>
                      <select
                        value={itemForm.difficulty}
                        onChange={(e) => setItemForm((prev) => ({ ...prev, difficulty: e.target.value }))}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Select</option>
                        <option value="easy">Easy</option>
                        <option value="moderate">Moderate</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {itemForm.category === "meal" && (
                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-semibold text-sm text-gray-700">Meal Details</h4>
                  <div>
                    <Label>Meal Type</Label>
                    <select
                      value={itemForm.mealType}
                      onChange={(e) => setItemForm((prev) => ({ ...prev, mealType: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select</option>
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snacks">Snacks</option>
                      <option value="buffet">Buffet</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Pricing Fields */}
              <div className="border-t pt-4 space-y-4">
                <h4 className="font-semibold text-sm text-gray-700">Pricing</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>
                      Price <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={itemForm.price === 0 || itemForm.price ? itemForm.price : ""}
                      onChange={(e) => setItemForm((prev) => ({ ...prev, price: e.target.value ? parseFloat(e.target.value) || 0 : 0 }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <select
                      value={itemForm.currency}
                      onChange={(e) => setItemForm((prev) => ({ ...prev, currency: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={itemForm.quantity || 1}
                      onChange={(e) => setItemForm((prev) => ({ ...prev, quantity: e.target.value ? parseInt(e.target.value) || 1 : 1 }))}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddItemForm(false)
                  setEditingItem(null)
                  resetItemForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={editingItem ? handleUpdateItem : handleAddItem}>
                {editingItem ? "Update" : "Add"} Item
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-500">{productId}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              {description && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{description}</p>
                </div>
              )}

              {/* Cart Items by Date */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Package Contents
                </h3>

                {/* Group items by date */}
                {(() => {
                  const itemsByDate = sortedCartItems.reduce((acc, item) => {
                    if (!acc[item.date]) {
                      acc[item.date] = []
                    }
                    acc[item.date].push(item)
                    return acc
                  }, {} as Record<string, ICartItem[]>)

                  return Object.entries(itemsByDate).map(([date, items]) => {
                    const { day, month, year } = formatDate(date)
                    return (
                      <div key={date} className="space-y-3">
                        {/* Date Header */}
                        <div className="flex items-center gap-3 pb-2 border-b-2 border-blue-200">
                          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-black">{day}</span>
                              <span className="text-sm font-bold">{month}</span>
                              <span className="text-xs opacity-75">{year}</span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {items.length} {items.length === 1 ? "item" : "items"}
                          </div>
                        </div>

                        {/* Items for this date */}
                        <div className="space-y-3 pl-4">
                          {items.map((item) => {
                            const IconComponent = CATEGORY_ICONS[item.category]
                            return (
                              <div
                                key={item.id}
                                className="flex items-start gap-4 p-4 rounded-lg border-2 border-gray-100 hover:border-blue-200 transition-colors bg-white"
                              >
                                {/* Icon */}
                                <div className={`p-3 rounded-full ${CATEGORY_COLORS[item.category]} flex-shrink-0`}>
                                  <IconComponent className="h-6 w-6" />
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-lg text-gray-900">{item.name}</h4>
                                  {item.description && (
                                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                  )}

                                  {/* Category-specific details */}
                                  <div className="mt-2 text-sm text-gray-700">
                                    {item.category === "flight" && (
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{item.fromCity || "Origin"}</span>
                                        <ArrowRight className="h-4 w-4 text-gray-400" />
                                        <span className="font-medium">{item.toCity || "Destination"}</span>
                                        {item.airline && <span className="text-gray-500">• {item.airline}</span>}
                                        {item.flightNumber && <span className="text-gray-500">• {item.flightNumber}</span>}
                                        {item.startTime && item.endTime && (
                                          <span className="text-gray-500">
                                            • {item.startTime} - {item.endTime}
                                          </span>
                                        )}
                                      </div>
                                    )}

                                    {item.category === "hotel" && (
                                      <div>
                                        {item.hotelName && <p className="font-medium">{item.hotelName}</p>}
                                        {item.location && <p className="text-gray-600">{item.location}</p>}
                                        <div className="flex gap-2 text-gray-500 mt-1">
                                          {item.checkIn && <span>Check-in: {item.checkIn}</span>}
                                          {item.checkOut && <span>• Check-out: {item.checkOut}</span>}
                                          {item.nights && <span>• {item.nights} night{item.nights > 1 ? "s" : ""}</span>}
                                        </div>
                                        {item.roomCategory && (
                                          <p className="text-gray-600 mt-1">{item.roomCategory}</p>
                                        )}
                                      </div>
                                    )}

                                    {item.category === "transfer" && (
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{item.fromLocation || "Pickup"}</span>
                                        <ArrowRight className="h-4 w-4 text-gray-400" />
                                        <span className="font-medium">{item.toLocation || "Drop"}</span>
                                        {item.vehicleType && <span className="text-gray-500">• {item.vehicleType}</span>}
                                        {item.transferType && (
                                          <span className="text-gray-500 capitalize">• {item.transferType}</span>
                                        )}
                                      </div>
                                    )}

                                    {item.category === "activity" && (
                                      <div>
                                        {item.location && <p className="text-gray-600">{item.location}</p>}
                                        <div className="flex gap-2 text-gray-500 mt-1">
                                          {item.duration && <span>Duration: {item.duration}</span>}
                                          {item.difficulty && (
                                            <span className="capitalize">• {item.difficulty}</span>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {item.category === "meal" && item.mealType && (
                                      <p className="text-gray-600 capitalize">{item.mealType}</p>
                                    )}
                                  </div>

                                  {/* Meta info */}
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="secondary" className="text-xs capitalize">
                                      {item.category}
                                    </Badge>
                                    {item.quantity > 1 && (
                                      <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                                    )}
                                  </div>
                                </div>

                                {/* Price */}
                                <div className="text-right flex-shrink-0">
                                  <p className="text-xl font-black text-gray-900">
                                    {item.currency === "INR" ? "₹" : "$"}
                                    {((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)}
                                  </p>
                                  {item.quantity > 1 && (
                                    <p className="text-xs text-gray-500">
                                      {item.currency === "INR" ? "₹" : "$"}
                                      {(Number(item.price) || 0).toFixed(2)} each
                                    </p>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>

              {/* Gallery */}
              {gallery.length > 0 && (
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-xl font-bold text-gray-900">Gallery</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {gallery.map((image, index) => (
                      <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.caption || `Gallery image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {image.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-xs">
                            {image.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200 space-y-3">
                <h3 className="text-lg font-bold text-blue-900">Package Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-blue-900">{getTotalItems()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Categories</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {new Set(cartItems.map((item) => item.category)).size}
                    </p>
                  </div>
                </div>
                <div className="border-t-2 border-blue-200 pt-3">
                  <p className="text-sm text-gray-600">Total Price</p>
                  <p className="text-3xl font-black text-blue-900">${getTotalPrice().toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end">
              <Button onClick={() => setShowPreview(false)}>Close Preview</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
