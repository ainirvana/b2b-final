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
  Plus,
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
  Library,
  Search,
  X
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ICartItem } from "@/models/Itinerary"
import { useToast } from "@/hooks/use-toast"
import { useLibrary } from "@/hooks/use-library"
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

export function CartComboBuilder({ itineraryId, onBack }: CartComboBuilderProps) {
  const { toast } = useToast()
  const { items: libraryItems, loading: libraryLoading } = useLibrary()
  const [title, setTitle] = useState("New Cart/Combo")
  const [description, setDescription] = useState("")
  const [productId, setProductId] = useState(`CRT-${Date.now().toString(36).toUpperCase()}`)
  const [cartItems, setCartItems] = useState<ICartItem[]>([])
  const [showAddItemForm, setShowAddItemForm] = useState(false)
  const [showLibraryImportModal, setShowLibraryImportModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ICartItem | null>(null)
  const [selectedLibraryItems, setSelectedLibraryItems] = useState<string[]>([])
  const [librarySearchQuery, setLibrarySearchQuery] = useState("")
  const [libraryCategoryFilter, setLibraryCategoryFilter] = useState<string>("all")
  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    category: "activity" as ICartItem["category"],
    price: 0,
    nights: 0,
    quantity: 1,
  })

  // Gallery state
  const [gallery, setGallery] = useState<IGalleryItem[]>([])

  // Load existing cart data if editing
  useEffect(() => {
    if (itineraryId) {
      loadCartData()
    } else {
      // Initialize from URL params if creating new
      initializeFromParams()
    }
  }, [itineraryId])

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

  const initializeFromParams = () => {
    const params = new URLSearchParams(window.location.search)
    setTitle(params.get("name") || "New Cart/Combo")
    setDescription(params.get("description") || "")
    setProductId(params.get("productId") || productId)
  }

  const handleAddItem = () => {
    if (!itemForm.name || !itemForm.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in name and price",
        variant: "destructive",
      })
      return
    }

    const newItem: ICartItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId: `${productId}-${cartItems.length + 1}`,
      name: itemForm.name,
      description: itemForm.description,
      category: itemForm.category,
      price: itemForm.price,
      quantity: itemForm.quantity,
      addedAt: new Date(),
      ...(itemForm.category === "hotel" && itemForm.nights > 0 && { nights: itemForm.nights }),
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
      nights: item.nights || 0,
      quantity: item.quantity,
    })
    setShowAddItemForm(true)
  }

  const handleUpdateItem = () => {
    if (!editingItem || !itemForm.name || !itemForm.price) {
      toast({
        title: "Validation Error", 
        description: "Please fill in name and price",
        variant: "destructive",
      })
      return
    }

    const updatedItems = cartItems.map(item => 
      item.id === editingItem.id 
        ? {
            ...item,
            name: itemForm.name,
            description: itemForm.description,
            category: itemForm.category,
            price: itemForm.price,
            quantity: itemForm.quantity,
            ...(itemForm.category === "hotel" && itemForm.nights > 0 && { nights: itemForm.nights }),
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
    setCartItems(cartItems.filter(item => item.id !== itemId))
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
      nights: 0,
      quantity: 1,
    })
  }

  const handleSave = async () => {
    try {
      const itineraryData = {
        productId,
        title,
        description,
        type: "cart-combo",
        destination: "Multiple", // Cart items can be from multiple destinations
        duration: "Variable",
        totalPrice: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        currency: "USD",
        status: "draft",
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
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  // Map LibraryItem to ICartItem
  const mapLibraryItemToCartItem = (libraryItem: any, quantity: number = 1): ICartItem => {
    // Map library category to cart category
    const categoryMapping: Record<string, ICartItem["category"]> = {
      'flight': 'flight',
      'hotel': 'hotel',
      'activity': 'activity',
      'transfer': 'transfer',
      'meal': 'meal',
      // Default to 'other' for unknown categories
    }

    const mappedCategory = categoryMapping[libraryItem.category?.toLowerCase()] || 'other'

    return {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId: `${productId}-${cartItems.length + 1}`,
      name: libraryItem.title || libraryItem.name || 'Unnamed Item',
      description: libraryItem.notes || libraryItem.description || '',
      category: mappedCategory,
      price: libraryItem.basePrice || libraryItem.price || 0,
      quantity: quantity,
      addedAt: new Date(),
      // Add nights for hotel category if available
      ...(mappedCategory === "hotel" && libraryItem.nights && { nights: libraryItem.nights }),
    }
  }

  // Handle importing selected library items
  const handleImportFromLibrary = () => {
    const selectedItems = libraryItems.filter(item => selectedLibraryItems.includes(item._id))
    const newCartItems = selectedItems.map(item => mapLibraryItemToCartItem(item))

    if (newCartItems.length > 0) {
      setCartItems([...cartItems, ...newCartItems])
      setSelectedLibraryItems([])
      setShowLibraryImportModal(false)
      setLibrarySearchQuery("")
      setLibraryCategoryFilter("all")

      toast({
        title: "Success",
        description: `${newCartItems.length} item${newCartItems.length > 1 ? 's' : ''} imported from library`,
      })
    }
  }

  // Toggle selection of library item
  const toggleLibraryItemSelection = (itemId: string) => {
    setSelectedLibraryItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  // Filter library items based on search and category
  const filteredLibraryItems = libraryItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(librarySearchQuery.toLowerCase()) ||
                         (item.city?.toLowerCase().includes(librarySearchQuery.toLowerCase())) ||
                         (item.country?.toLowerCase().includes(librarySearchQuery.toLowerCase()))
    const matchesCategory = libraryCategoryFilter === 'all' ||
                           item.category.toLowerCase() === libraryCategoryFilter ||
                           (libraryCategoryFilter === 'others' && !['flight', 'hotel', 'activity', 'transfer', 'meal'].includes(item.category.toLowerCase()))
    return matchesSearch && matchesCategory
  })

  return (
    <div className="p-6">
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
          <Button variant="outline" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Library Import Modal */}
      {showLibraryImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Import Items from Library</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowLibraryImportModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Tabs defaultValue="my-libraries" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="my-libraries" className="text-sm">
                  <Library className="h-4 w-4 mr-2" />
                  My Libraries
                </TabsTrigger>
                <TabsTrigger value="global-libraries" className="text-sm">
                  <Library className="h-4 w-4 mr-2" />
                  Global Libraries
                </TabsTrigger>
              </TabsList>

              <TabsContent value="my-libraries" className="mt-0">
                <div className="flex gap-4 mb-4">
                  <Input
                    placeholder="Search library..."
                    value={librarySearchQuery}
                    onChange={(e) => setLibrarySearchQuery(e.target.value)}
                    className="flex-grow"
                  />
                  <select
                    value={libraryCategoryFilter}
                    onChange={(e) => setLibraryCategoryFilter(e.target.value)}
                    className="p-2 border rounded-md"
                  >
                    <option value="all">All Categories</option>
                    <option value="flight">Flight</option>
                    <option value="hotel">Hotel</option>
                    <option value="activity">Activity</option>
                    <option value="transfer">Transfer</option>
                    <option value="meal">Meal</option>
                    <option value="others">Others</option>
                  </select>
                </div>
                <div className="max-h-96 overflow-y-auto border rounded-md p-2">
                  {libraryLoading ? (
                    <p>Loading library items...</p>
                  ) : filteredLibraryItems.length === 0 ? (
                    <p>No items found.</p>
                  ) : (
                    filteredLibraryItems.map(item => (
                      <div
                        key={item._id}
                        className={`flex items-center justify-between p-2 border-b last:border-b-0 cursor-pointer ${
                          selectedLibraryItems.includes(item._id) ? "bg-blue-100" : ""
                        }`}
                        onClick={() => toggleLibraryItemSelection(item._id)}
                      >
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-xs text-gray-500">
                            {item.category} - {item.city}, {item.country}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedLibraryItems.includes(item._id)}
                          readOnly
                        />
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="global-libraries" className="mt-0">
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <Library className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">Global Libraries</h3>
                    <p className="text-sm text-gray-400">
                      Coming soon! Access to global library items from all agencies.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <div className="flex justify-end mt-4 gap-2">
              <Button variant="outline" onClick={() => setShowLibraryImportModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleImportFromLibrary} disabled={selectedLibraryItems.length === 0}>
                Import Selected ({selectedLibraryItems.length})
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter cart/combo title"
                />
              </div>
              <div>
                <Label>Product ID</Label>
                <Input
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  placeholder="Enter product ID"
                />
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

          {/* Cart Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Cart Items ({cartItems.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowLibraryImportModal(true)}>
                    <Library className="h-4 w-4 mr-2" />
                    Import from Library
                  </Button>
                  <Button onClick={() => setShowAddItemForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No items in cart</p>
                  <Button 
                    onClick={() => setShowAddItemForm(true)}
                    className="mt-4"
                  >
                    Add First Item
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const IconComponent = CATEGORY_ICONS[item.category]
                    return (
                      <div
                        key={item.id}
                        className="border rounded-lg p-4 flex items-center justify-between"
                      >
                        {/* Details Section */}
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`p-2 rounded-full ${CATEGORY_COLORS[item.category]}`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-gray-500">{item.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {item.category}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Qty: {item.quantity}
                              </span>
                              {item.nights && (
                                <span className="text-xs text-gray-500">
                                  {item.nights} nights
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Separator */}
                        <div className="h-12 w-px bg-gray-200 mx-4"></div>

                        {/* Price Section */}
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[80px]">
                            <p className="font-medium">${item.price * item.quantity}</p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-gray-500">${item.price} each</p>
                            )}
                          </div>

                          {/* Separator */}
                          <div className="h-12 w-px bg-gray-200"></div>

                          {/* Actions Section */}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditItem(item)}
                            >
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
              <GalleryUpload
                gallery={gallery}
                onGalleryUpdate={setGallery}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Total Items:</span>
                <span className="font-medium">{getTotalItems()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Categories:</span>
                <span className="font-medium">
                  {new Set(cartItems.map(item => item.category)).size}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="font-medium">Total Price:</span>
                  <span className="font-bold text-lg">${getTotalPrice()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          {cartItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(
                    cartItems.reduce((acc, item) => {
                      acc[item.category] = (acc[item.category] || 0) + item.quantity
                      return acc
                    }, {} as Record<string, number>)
                  ).map(([category, count]) => {
                    const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          <span className="capitalize">{category}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      {showAddItemForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">
              {editingItem ? "Edit Item" : "Add New Item"}
            </h3>
            <div className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={itemForm.name}
                  onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
              <div>
                <Label>Category</Label>
                <select
                  value={itemForm.category}
                  onChange={(e) => setItemForm(prev => ({ ...prev, category: e.target.value as ICartItem["category"] }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="activity">Activity</option>
                  <option value="hotel">Hotel</option>
                  <option value="flight">Flight</option>
                  <option value="transfer">Transfer</option>
                  <option value="meal">Meal</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={itemForm.price}
                    onChange={(e) => setItemForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={itemForm.quantity}
                    onChange={(e) => setItemForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>
              {itemForm.category === "hotel" && (
                <div>
                  <Label>Number of Nights</Label>
                  <Input
                    type="number"
                    min="0"
                    value={itemForm.nights}
                    onChange={(e) => setItemForm(prev => ({ ...prev, nights: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
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
    </div>
  )
}
