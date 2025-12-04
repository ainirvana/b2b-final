"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Library, Star, Clock, Filter, Copy, Heart } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLibrary } from "@/hooks/use-library"
import { LibraryToItineraryConverter } from "@/lib/library-converter"

interface ComponentSourceModalProps {
  isOpen: boolean
  onClose: () => void
  componentType: string
  componentTitle: string
  onSelectManual: (data?: any) => void
  onSelectLibrary: (libraryItem: any) => void
}

interface ComponentTemplate {
  id: string
  name: string
  description: string
  category: string
  template: any
  isPopular?: boolean
  difficulty?: "Easy" | "Medium" | "Advanced"
}

const COMPONENT_TEMPLATES: ComponentTemplate[] = [
  // Flight Templates
  {
    id: "flight-domestic",
    name: "Domestic Flight",
    description: "Standard domestic flight with basic details",
    category: "flight",
    template: {
      title: "Domestic Flight",
      description: "Domestic flight within the country",
      fromCity: "Origin City",
      toCity: "Destination City",
      mainPoint: "Economy Class",
      time: "09:00",
      highlights: ["Economy Class", "Checked Baggage"],
    },
    isPopular: true,
    difficulty: "Easy",
  },
  {
    id: "flight-international",
    name: "International Flight",
    description: "International flight with premium features",
    category: "flight",
    template: {
      title: "International Flight",
      description: "International flight with premium services",
      fromCity: "Origin Country",
      toCity: "Destination Country",
      mainPoint: "Business Class",
      time: "14:00",
      highlights: ["Business Class", "Priority Boarding", "Lounge Access", "Extra Baggage"],
    },
    difficulty: "Medium",
  },
  // Hotel Templates
  {
    id: "hotel-luxury",
    name: "Luxury Hotel",
    description: "5-star luxury accommodation",
    category: "hotel",
    template: {
      title: "Luxury Resort & Spa",
      description: "5-star luxury accommodation with premium amenities",
      location: "Prime Location",
      checkIn: "15:00",
      checkOut: "11:00",
      nights: 2,
      highlights: ["5-Star Rating", "Spa Services", "Pool", "Fine Dining", "Concierge"],
    },
    isPopular: true,
    difficulty: "Easy",
  },
  {
    id: "hotel-boutique",
    name: "Boutique Hotel",
    description: "Unique boutique accommodation",
    category: "hotel",
    template: {
      title: "Boutique Hotel",
      description: "Charming boutique hotel with personalized service",
      location: "Historic District",
      checkIn: "14:00",
      checkOut: "12:00",
      nights: 1,
      highlights: ["Unique Design", "Local Character", "Personalized Service"],
    },
    difficulty: "Easy",
  },
  // Activity Templates
  {
    id: "activity-cultural",
    name: "Cultural Tour",
    description: "Guided cultural experience",
    category: "activity",
    template: {
      title: "Cultural Heritage Tour",
      description: "Explore local culture and historical sites with expert guide",
      location: "Historic Center",
      duration: "4 hours",
      difficulty: "Easy",
      capacity: 15,
      time: "09:00",
      highlights: ["Expert Guide", "Historical Sites", "Cultural Insights", "Photo Opportunities"],
    },
    isPopular: true,
    difficulty: "Easy",
  },
  {
    id: "activity-adventure",
    name: "Adventure Activity",
    description: "Thrilling outdoor adventure",
    category: "activity",
    template: {
      title: "Adventure Experience",
      description: "Exciting outdoor adventure for thrill seekers",
      location: "Adventure Park",
      duration: "6 hours",
      difficulty: "Hard",
      capacity: 8,
      time: "08:00",
      highlights: ["Professional Equipment", "Safety Briefing", "Certified Instructors", "Action Photos"],
    },
    difficulty: "Advanced",
  },
  // Transfer Templates
  {
    id: "transfer-private",
    name: "Private Transfer",
    description: "Comfortable private transportation",
    category: "transfer",
    template: {
      title: "Private Car Transfer",
      description: "Comfortable private transfer with professional driver",
      mainPoint: "Private Vehicle",
      highlights: ["Professional Driver", "Air Conditioning", "Door-to-Door Service"],
    },
    isPopular: true,
    difficulty: "Easy",
  },
  {
    id: "transfer-luxury",
    name: "Luxury Transfer",
    description: "Premium luxury transportation",
    category: "transfer",
    template: {
      title: "Luxury Transfer Service",
      description: "Premium luxury transfer with VIP treatment",
      mainPoint: "Luxury Vehicle",
      highlights: ["Luxury Vehicle", "VIP Service", "Refreshments", "WiFi", "Professional Chauffeur"],
    },
    difficulty: "Easy",
  },
]

export function ComponentSourceModal({
  isOpen,
  onClose,
  componentType,
  componentTitle,
  onSelectManual,
  onSelectLibrary,
}: ComponentSourceModalProps) {
  const { items } = useLibrary()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSource, setSelectedSource] = useState<"manual" | "library" | "templates" | null>(null)
  const [sortBy, setSortBy] = useState<"name" | "price" | "rating" | "recent">("name")
  const [filterBy, setFilterBy] = useState<"all" | "popular" | "recent" | "favorites">("all")
  const [recentComponents, setRecentComponents] = useState<string[]>([])
  const [favoriteComponents, setFavoriteComponents] = useState<string[]>([])

  useEffect(() => {
    if (!isOpen) {
      setSelectedSource(null)
      setSearchQuery("")
    }
  }, [isOpen])

  useEffect(() => {
    const recent = localStorage.getItem("recent-components")
    const favorites = localStorage.getItem("favorite-components")

    if (recent) {
      setRecentComponents(JSON.parse(recent))
    }
    if (favorites) {
      setFavoriteComponents(JSON.parse(favorites))
    }
  }, [])

  // Filter library items by component type. For the Additional Information
  // component we accept multiple category name forms (e.g. "additionalInformation",
  // "additional-info", "additional info") and also include items that have
  // `extraFields.additionalInfo` populated so they appear automatically.
  const filteredLibraryItems = items
    .filter((item) => {
      const itemCategory = (item.category || "").toString().toLowerCase()
      const compType = (componentType || "").toString().toLowerCase()

      const isAdditionalComponent = compType.includes("additional") || compType.includes("additionalinformation")
      const isAncillaryComponent = compType.includes("ancill") || compType.includes("ancillary")

      let matchesCategory = false
      if (isAdditionalComponent) {
        // Match if item's category name suggests additional info
        matchesCategory = itemCategory.includes("additional") || itemCategory.includes("information") || itemCategory.includes("info")

        // Also accept if the library item contains extraFields.additionalInfo
        if (!matchesCategory && item.extraFields) {
          const ai = item.extraFields.additionalInfo
          if (Array.isArray(ai) && ai.length > 0) matchesCategory = true
          if (typeof ai === "string" && ai.trim().length > 0) matchesCategory = true
        }

        // Also accept if subCategory hints at additional information
        if (!matchesCategory && item.subCategory) {
          const sc = item.subCategory.toString().toLowerCase()
          if (sc.includes("additional") || sc.includes("info") || sc.includes("information")) matchesCategory = true
        }
      } else if (isAncillaryComponent) {
        // Match items whose category indicates ancillaries or have ancillaries data
        matchesCategory = itemCategory.includes("ancill") || itemCategory.includes("ancillary") || itemCategory.includes("ancillaries")

        if (!matchesCategory && item.extraFields) {
          const ef = item.extraFields
          if (Array.isArray(ef.ancillaries) && ef.ancillaries.length) matchesCategory = true
          if (typeof ef.ancillaries === 'string' && ef.ancillaries.trim()) matchesCategory = true
        }

        if (!matchesCategory && item.subCategory) {
          const sc = item.subCategory.toString().toLowerCase()
          if (sc.includes("ancill") || sc.includes("ancillary")) matchesCategory = true
        }
      } else {
        matchesCategory = itemCategory === compType
      }

      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.country?.toLowerCase().includes(searchQuery.toLowerCase())

      let matchesFilter = true
      if (filterBy === "favorites") {
        matchesFilter = favoriteComponents.includes(item._id)
      } else if (filterBy === "recent") {
        matchesFilter = recentComponents.includes(item._id)
      }

      return matchesCategory && matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price":
          return (a.basePrice || 0) - (b.basePrice || 0)
        case "name":
          return a.title.localeCompare(b.title)
        case "rating":
          return (b.rating || 0) - (a.rating || 0) // Note: rating might not exist on LibraryItem type
        case "recent":
          const aIndex = recentComponents.indexOf(a._id)
          const bIndex = recentComponents.indexOf(b._id)
          if (aIndex === -1 && bIndex === -1) return 0
          if (aIndex === -1) return 1
          if (bIndex === -1) return -1
          return aIndex - bIndex
        default:
          return 0
      }
    })

  // Filter component templates
  const filteredTemplates = COMPONENT_TEMPLATES.filter((template) => {
    const matchesCategory = template.category.toLowerCase() === componentType.toLowerCase()
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())

    let matchesFilter = true
    if (filterBy === "popular") {
      matchesFilter = template.isPopular || false
    }

    return matchesCategory && matchesSearch && matchesFilter
  })

  // When the user chooses Manual from the options, show a manual editor
  // for additionalInformation. For other component types we simply call the
  // onSelectManual callback.
  const handleSelectManual = () => {
    setSelectedSource("manual")
  }

  const [manualTitle, setManualTitle] = useState("")
  const [manualBullets, setManualBullets] = useState<string[]>([""])
  const [manualDescription, setManualDescription] = useState("")
  const [manualMainPoint, setManualMainPoint] = useState("")
  const [manualFromCity, setManualFromCity] = useState("")
  const [manualToCity, setManualToCity] = useState("")
  const [manualTime, setManualTime] = useState("")
  const [manualLocation, setManualLocation] = useState("")
  const [manualNights, setManualNights] = useState<number | "">("")
  // Additional fields for comprehensive component editing
  const [manualCheckIn, setManualCheckIn] = useState("")
  const [manualCheckOut, setManualCheckOut] = useState("")
  const [manualPrice, setManualPrice] = useState<number | "">("")
  const [manualCapacity, setManualCapacity] = useState<number | "">("")
  const [manualDuration, setManualDuration] = useState("")
  const [manualDifficulty, setManualDifficulty] = useState("Easy")
  const [manualHotelName, setManualHotelName] = useState("")
  const [manualRoomCategory, setManualRoomCategory] = useState("")
  const [manualHotelRating, setManualHotelRating] = useState<number | "">("")
  const [manualMealPlan, setManualMealPlan] = useState("")
  const [manualHotelNotes, setManualHotelNotes] = useState("")
  const [manualImageUrl, setManualImageUrl] = useState("")
  const [manualImageCaption, setManualImageCaption] = useState("")
  const [manualImageAlt, setManualImageAlt] = useState("")
  const [manualVehicleType, setManualVehicleType] = useState("")
  const [manualAmenities, setManualAmenities] = useState<string[]>([""])
  const [manualHighlights, setManualHighlights] = useState<string[]>([""])

  const handleManualBulletChange = (index: number, value: string) => {
    const copy = [...manualBullets]
    copy[index] = value
    setManualBullets(copy)
  }

  const handleAddManualBullet = () => setManualBullets([...manualBullets, ""])
  const handleRemoveManualBullet = (index: number) => {
    const copy = manualBullets.filter((_, i) => i !== index)
    setManualBullets(copy.length ? copy : [""])
  }

  const handleManualAmenitiesChange = (index: number, value: string) => {
    const copy = [...manualAmenities]
    copy[index] = value
    setManualAmenities(copy)
  }

  const handleAddManualAmenity = () => setManualAmenities([...manualAmenities, ""])
  const handleRemoveManualAmenity = (index: number) => {
    const copy = manualAmenities.filter((_, i) => i !== index)
    setManualAmenities(copy.length ? copy : [""])
  }

  const handleManualHighlightsChange = (index: number, value: string) => {
    const copy = [...manualHighlights]
    copy[index] = value
    setManualHighlights(copy)
  }

  const handleAddManualHighlight = () => setManualHighlights([...manualHighlights, ""])
  const handleRemoveManualHighlight = (index: number) => {
    const copy = manualHighlights.filter((_, i) => i !== index)
    setManualHighlights(copy.length ? copy : [""])
  }

  const handleSubmitManual = () => {
    const cleanedBullets = manualBullets.map((b) => (b || "").toString()).map((s) => s.trim()).filter(Boolean)
    const cleanedAmenities = manualAmenities.map((a) => (a || "").toString()).map((s) => s.trim()).filter(Boolean)
    const cleanedHighlights = manualHighlights.map((h) => (h || "").toString()).map((s) => s.trim()).filter(Boolean)

    const payload: any = {
      id: `event-${Date.now()}`,
      title: manualTitle || componentTitle || "Untitled",
      description: manualDescription || "",
      category: componentType.toLowerCase(),
      componentType,
      componentSource: "manual",
      listItems: cleanedBullets,
      highlights: cleanedHighlights,
      versionHistory: [
        {
          timestamp: new Date(),
          action: "created",
          source: "manual",
        },
      ],
    }

    // Add type-specific fields
    if (manualFromCity) payload.fromCity = manualFromCity
    if (manualToCity) payload.toCity = manualToCity
    if (manualTime) payload.time = manualTime
    if (manualMainPoint) payload.mainPoint = manualMainPoint
    if (manualLocation) payload.location = manualLocation
    if (manualNights) payload.nights = Number(manualNights)
    if (manualCheckIn) payload.checkIn = manualCheckIn
    if (manualCheckOut) payload.checkOut = manualCheckOut
    if (manualPrice) payload.price = Number(manualPrice)
    if (manualCapacity) payload.capacity = Number(manualCapacity)
    if (manualDuration) payload.duration = manualDuration
    if (manualDifficulty) payload.difficulty = manualDifficulty
    if (manualHotelName) payload.hotelName = manualHotelName
    if (manualRoomCategory) payload.roomCategory = manualRoomCategory
    if (manualHotelRating) payload.hotelRating = Number(manualHotelRating)
    if (manualMealPlan) payload.mealPlan = manualMealPlan
    if (manualHotelNotes) payload.hotelNotes = manualHotelNotes
    if (manualImageUrl) payload.imageUrl = manualImageUrl
    if (manualImageCaption) payload.imageCaption = manualImageCaption
    if (manualImageAlt) payload.imageAlt = manualImageAlt
    if (manualVehicleType) payload.vehicleType = manualVehicleType
    if (cleanedAmenities.length) payload.amenities = cleanedAmenities

    onSelectManual(payload)
    onClose()
    setSelectedSource(null)
    // Reset all manual fields
    setManualTitle("")
    setManualBullets([""])
    setManualDescription("")
    setManualFromCity("")
    setManualToCity("")
    setManualTime("")
    setManualLocation("")
    setManualNights("")
    setManualCheckIn("")
    setManualCheckOut("")
    setManualPrice("")
    setManualCapacity("")
    setManualDuration("")
    setManualDifficulty("Easy")
    setManualHotelName("")
    setManualRoomCategory("")
    setManualHotelRating("")
    setManualMealPlan("")
    setManualHotelNotes("")
    setManualImageUrl("")
    setManualImageCaption("")
    setManualImageAlt("")
    setManualVehicleType("")
    setManualAmenities([""])
    setManualHighlights([""])
  }

  const handleSelectTemplate = (template: ComponentTemplate) => {
    // Create a manual component with template data
    const templateEvent = {
      ...template.template,
      id: `event-${Date.now()}`,
      category: template.category,
      componentSource: "manual",
      versionHistory: [
        {
          timestamp: new Date(),
          action: "created",
          source: "template",
        },
      ],
    }

    // Add to recent components
    const updatedRecent = [template.id, ...recentComponents.filter((id) => id !== template.id)].slice(0, 10)
    setRecentComponents(updatedRecent)
    localStorage.setItem("recent-components", JSON.stringify(updatedRecent))

    onSelectManual(templateEvent)
    onClose()
    setSelectedSource(null)
  }

  const handleSelectLibraryItem = (item: any) => {
    // Add to recent components
    const updatedRecent = [item._id, ...recentComponents.filter((id) => id !== item._id)].slice(0, 10)
    setRecentComponents(updatedRecent)
    localStorage.setItem("recent-components", JSON.stringify(updatedRecent))

    onSelectLibrary(item)
    onClose()
    setSelectedSource(null)
  }

  const toggleFavorite = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updatedFavorites = favoriteComponents.includes(itemId)
      ? favoriteComponents.filter((id) => id !== itemId)
      : [...favoriteComponents, itemId]

    setFavoriteComponents(updatedFavorites)
    localStorage.setItem("favorite-components", JSON.stringify(updatedFavorites))
  }

  const getIcon = (category: string) => {
    const lowerCategory = category.toLowerCase()
    switch (lowerCategory) {
      case "flight":
        return "✈️"
      case "hotel":
        return "🏨"
      case "activity":
        return "🎯"
      case "transfer":
        return "🚗"
      case "meal":
        return "🍽️"
      default:
        return "📍"
    }
  }

  const getColor = (category: string) => {
    const lowerCategory = category.toLowerCase()
    switch (lowerCategory) {
      case "flight":
        return "bg-orange-50 border-orange-200 hover:bg-orange-100"
      case "hotel":
        return "bg-green-50 border-green-200 hover:bg-green-100"
      case "activity":
        return "bg-purple-50 border-purple-200 hover:bg-purple-100"
      case "transfer":
        return "bg-blue-50 border-blue-200 hover:bg-blue-100"
      case "meal":
        return "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
      default:
        return "bg-gray-50 border-gray-200 hover:bg-gray-100"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>Add {componentTitle} Component</DialogTitle>
        </DialogHeader>

        {!selectedSource && (
          <div className="flex-1 flex flex-col space-y-4 p-4">
            <p className="text-gray-600 text-center text-sm">
              How would you like to add this {componentTitle.toLowerCase()} component?
            </p>

            <div className="grid grid-cols-3 gap-4 flex-1">
              {/* Manual Option */}
              <Card
                className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-400 flex flex-col"
                onClick={handleSelectManual}
              >
                <CardContent className="p-6 text-center flex flex-col items-center justify-center flex-1">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-base font-semibold mb-2">Create Manually</h3>
                  <p className="text-gray-600 text-xs mb-4">
                    Create a new {componentTitle.toLowerCase()} component from scratch
                  </p>
                  <Button className="mt-auto w-full">
                    Create New
                  </Button>
                </CardContent>
              </Card>

              {/* Templates Option */}
              <Card
                className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-purple-400 flex flex-col"
                onClick={() => setSelectedSource("templates")}
              >
                <CardContent className="p-6 text-center flex flex-col items-center justify-center flex-1">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Copy className="h-10 w-10 text-purple-600" />
                  </div>
                  <h3 className="text-base font-semibold mb-2">Use Template</h3>
                  <p className="text-gray-600 text-xs mb-4">Start with {filteredTemplates.length} pre-designed templates</p>
                  <Button variant="outline" className="mt-auto w-full bg-transparent">
                    Browse Templates ({filteredTemplates.length})
                  </Button>
                </CardContent>
              </Card>

              {/* Library Option */}
              <Card
                className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-green-400 flex flex-col"
                onClick={() => setSelectedSource("library")}
              >
                <CardContent className="p-6 text-center flex flex-col items-center justify-center flex-1">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Library className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-base font-semibold mb-2">From Library</h3>
                  <p className="text-gray-600 text-xs mb-4">Choose from {filteredLibraryItems.length} library items</p>
                  <Button variant="outline" className="mt-auto w-full bg-transparent">
                    Browse Library ({filteredLibraryItems.length})
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {selectedSource === "manual" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4">
              {(componentType.toLowerCase() === "additionalinformation" || componentType.toLowerCase().includes("ancill")) ? (
                // Additional Information and Ancillaries special case
                <div className="space-y-4">
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Mandatory Fields
                    </h4>
                    <div className="space-y-4 pl-4 border-l-2 border-red-200">
                      <div>
                        <label className="text-sm font-medium">Title</label>
                        <Input value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} placeholder={componentType.toLowerCase().includes("ancill") ? "Section title e.g. Optional Extras" : "Section title e.g. Terms and Conditions"} />
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                      Details
                    </h4>
                    <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                      <div>
                        <label className="text-sm font-medium mb-2 block">{componentType.toLowerCase().includes("ancill") ? "Ancillaries (bullet points)" : "Additional Information (bullet points)"}</label>
                        <div className="space-y-2">
                          {manualBullets.map((b, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="text-sm mt-2">•</span>
                              <Textarea
                                value={b}
                                onChange={(e) => handleManualBulletChange(idx, e.target.value)}
                                className="flex-1 min-h-[40px] resize-none"
                                placeholder="Add information (can be a bullet point or full paragraph)"
                                rows={1}
                                onInput={(e) => {
                                  const target = e.target as HTMLTextAreaElement;
                                  target.style.height = 'auto';
                                  target.style.height = target.scrollHeight + 'px';
                                }}
                              />
                              <Button variant="ghost" size="sm" onClick={() => handleRemoveManualBullet(idx)} className="mt-1">Remove</Button>
                            </div>
                          ))}
                          <Button size="sm" onClick={handleAddManualBullet} variant="outline">Add Bullet</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Generic component types
                <div className="space-y-4">
                  {/* Mandatory Fields Section */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Mandatory Fields
                    </h4>
                    <div className="space-y-4 pl-4 border-l-2 border-red-200">
                      <div>
                        <label className="text-sm font-medium">Title</label>
                        <Input value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} placeholder={`Title for ${componentTitle}`} />
                      </div>
                    </div>
                  </div>

                  {/* Non-Mandatory Fields Section */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                      Non-Mandatory Fields
                    </h4>
                    <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Input value={manualDescription} onChange={(e) => setManualDescription(e.target.value)} placeholder="Description (optional)" />
                      </div>

                      {/* Flight-specific fields */}
                      {componentType.toLowerCase() === "flight" && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">From City</label>
                              <Input value={manualFromCity} onChange={(e) => setManualFromCity(e.target.value)} placeholder="e.g., Delhi" />
                            </div>
                            <div>
                              <label className="text-sm font-medium">To City</label>
                              <Input value={manualToCity} onChange={(e) => setManualToCity(e.target.value)} placeholder="e.g., Bangkok" />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Flight Class / Main Point</label>
                            <Input value={manualMainPoint} onChange={(e) => setManualMainPoint(e.target.value)} placeholder="e.g., Economy Class" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Departure Time</label>
                              <Input value={manualTime} onChange={(e) => setManualTime(e.target.value)} placeholder="09:00" />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Duration</label>
                              <Input value={manualDuration} onChange={(e) => setManualDuration(e.target.value)} placeholder="2h 30m" />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Hotel-specific fields */}
                      {componentType.toLowerCase() === "hotel" && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Hotel Name</label>
                              <Input value={manualHotelName} onChange={(e) => setManualHotelName(e.target.value)} placeholder="Hotel name" />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Location</label>
                              <Input value={manualLocation} onChange={(e) => setManualLocation(e.target.value)} placeholder="City / Area" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Nights</label>
                              <Input type="number" value={manualNights as any} onChange={(e) => setManualNights(Number(e.target.value) || "")} placeholder="No. of nights" />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Room Category</label>
                              <Input value={manualRoomCategory} onChange={(e) => setManualRoomCategory(e.target.value)} placeholder="e.g., Deluxe" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Check-in Time</label>
                              <Input value={manualCheckIn} onChange={(e) => setManualCheckIn(e.target.value)} placeholder="15:00" />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Check-out Time</label>
                              <Input value={manualCheckOut} onChange={(e) => setManualCheckOut(e.target.value)} placeholder="11:00" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Rating</label>
                              <Input type="number" value={manualHotelRating as any} onChange={(e) => setManualHotelRating(Number(e.target.value) || "")} placeholder="e.g., 5" />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Meal Plan</label>
                              <Input value={manualMealPlan} onChange={(e) => setManualMealPlan(e.target.value)} placeholder="e.g., Breakfast included" />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Amenities</label>
                            <div className="space-y-2">
                              {manualAmenities.map((a, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <Input value={a} onChange={(e) => handleManualAmenitiesChange(idx, e.target.value)} className="flex-1" placeholder="e.g., WiFi, Pool" />
                                  <Button variant="ghost" size="sm" onClick={() => handleRemoveManualAmenity(idx)}>Remove</Button>
                                </div>
                              ))}
                              <Button size="sm" onClick={handleAddManualAmenity} variant="outline">Add Amenity</Button>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Notes</label>
                            <Input value={manualHotelNotes} onChange={(e) => setManualHotelNotes(e.target.value)} placeholder="Additional notes" />
                          </div>
                        </>
                      )}

                      {/* Activity-specific fields */}
                      {componentType.toLowerCase() === "activity" && (
                        <>
                          <div>
                            <label className="text-sm font-medium">Location / Meeting Point</label>
                            <Input value={manualLocation} onChange={(e) => setManualLocation(e.target.value)} placeholder="Meeting point / location" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Start Time</label>
                              <Input value={manualTime} onChange={(e) => setManualTime(e.target.value)} placeholder="09:00" />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Duration</label>
                              <Input value={manualDuration} onChange={(e) => setManualDuration(e.target.value)} placeholder="2-3 hours" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Difficulty Level</label>
                              <Select value={manualDifficulty} onValueChange={setManualDifficulty}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Easy">Easy</SelectItem>
                                  <SelectItem value="Moderate">Moderate</SelectItem>
                                  <SelectItem value="Hard">Hard</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Max Capacity</label>
                              <Input type="number" value={manualCapacity as any} onChange={(e) => setManualCapacity(Number(e.target.value) || "")} placeholder="Max people" />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Price per Person</label>
                            <Input type="number" value={manualPrice as any} onChange={(e) => setManualPrice(Number(e.target.value) || "")} placeholder="Per person" />
                          </div>
                        </>
                      )}

                      {/* Transfer-specific fields */}
                      {componentType.toLowerCase() === "transfer" && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Pickup Location</label>
                              <Input value={manualFromCity} onChange={(e) => setManualFromCity(e.target.value)} placeholder="Pickup location" />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Dropoff Location</label>
                              <Input value={manualToCity} onChange={(e) => setManualToCity(e.target.value)} placeholder="Dropoff location" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Vehicle Type</label>
                              <Input value={manualVehicleType} onChange={(e) => setManualVehicleType(e.target.value)} placeholder="e.g., Sedan, SUV" />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Pickup Time</label>
                              <Input value={manualTime} onChange={(e) => setManualTime(e.target.value)} placeholder="09:00" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Capacity (Passengers)</label>
                              <Input type="number" value={manualCapacity as any} onChange={(e) => setManualCapacity(Number(e.target.value) || "")} placeholder="Max passengers" />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Duration</label>
                              <Input value={manualDuration} onChange={(e) => setManualDuration(e.target.value)} placeholder="1h 30m" />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Price</label>
                            <Input type="number" value={manualPrice as any} onChange={(e) => setManualPrice(Number(e.target.value) || "")} placeholder="Total price" />
                          </div>
                        </>
                      )}

                      {/* Image fields */}
                      <div>
                        <label className="text-sm font-medium">Image URL</label>
                        <Input value={manualImageUrl} onChange={(e) => setManualImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
                      </div>
                      {manualImageUrl && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Image Caption</label>
                            <Input value={manualImageCaption} onChange={(e) => setManualImageCaption(e.target.value)} placeholder="Image description" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Image Alt Text</label>
                            <Input value={manualImageAlt} onChange={(e) => setManualImageAlt(e.target.value)} placeholder="Alternative text" />
                          </div>
                        </div>
                      )}

                      {/* Highlights */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Highlights</label>
                        <div className="space-y-2">
                          {manualHighlights.map((h, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-sm">✓</span>
                              <Input value={h} onChange={(e) => handleManualHighlightsChange(idx, e.target.value)} className="flex-1" placeholder="e.g., Free WiFi, Pool" />
                              <Button variant="ghost" size="sm" onClick={() => handleRemoveManualHighlight(idx)}>Remove</Button>
                            </div>
                          ))}
                          <Button size="sm" onClick={handleAddManualHighlight} variant="outline">Add Highlight</Button>
                        </div>
                      </div>

                      {/* Details / Additional Information */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Details / Additional Information</label>
                        <div className="space-y-2">
                          {manualBullets.map((b, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="text-sm mt-2">•</span>
                              <Textarea
                                value={b}
                                onChange={(e) => handleManualBulletChange(idx, e.target.value)}
                                className="flex-1 min-h-[40px] resize-none"
                                placeholder="Add detail (can be a bullet point or full paragraph)"
                                rows={1}
                                onInput={(e) => {
                                  const target = e.target as HTMLTextAreaElement;
                                  target.style.height = 'auto';
                                  target.style.height = target.scrollHeight + 'px';
                                }}
                              />
                              <Button variant="ghost" size="sm" onClick={() => handleRemoveManualBullet(idx)} className="mt-1">Remove</Button>
                            </div>
                          ))}
                          <Button size="sm" onClick={handleAddManualBullet} variant="outline">Add Detail</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t flex justify-end gap-2">
              <Button variant="ghost" onClick={() => {
                setSelectedSource(null)
                setManualTitle("")
                setManualBullets([""])
                setManualDescription("")
                setManualFromCity("")
                setManualToCity("")
                setManualTime("")
                setManualLocation("")
                setManualNights("")
                setManualCheckIn("")
                setManualCheckOut("")
                setManualPrice("")
                setManualCapacity("")
                setManualDuration("")
                setManualDifficulty("Easy")
                setManualHotelName("")
                setManualRoomCategory("")
                setManualHotelRating("")
                setManualMealPlan("")
                setManualHotelNotes("")
                setManualImageUrl("")
                setManualImageCaption("")
                setManualImageAlt("")
                setManualVehicleType("")
                setManualMainPoint("")
                setManualAmenities([""])
                setManualHighlights([""])
              }}>Cancel</Button>
              <Button onClick={handleSubmitManual}>Create</Button>
            </div>
          </div>
        )}

        {selectedSource === "templates" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-2 border-b">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Choose {componentTitle} Template</h3>
                <Button variant="ghost" onClick={() => setSelectedSource(null)}>
                  Back to Options
                </Button>
              </div>

              {/* Search and Filters */}
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={`Search ${componentTitle.toLowerCase()} templates...`}
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterBy} onValueChange={(value) => setFilterBy(value as "all" | "popular" | "recent" | "favorites")}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Templates</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 border border-gray-200 rounded p-4 pr-3">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <Copy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No templates found</p>
                  <p className="text-sm text-gray-400">Try creating one manually instead</p>
                  <Button variant="outline" className="mt-4 bg-transparent" onClick={handleSelectManual}>
                    Create Manually
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className={`${getColor(template.category)} cursor-pointer hover:shadow-md transition-all`}
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <CardContent className="p-2">
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">{getIcon(template.category)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold text-lg text-gray-900">{template.name}</h4>
                              <div className="flex gap-1 ml-2">
                                {template.isPopular && (
                                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                    <Star className="h-3 w-3 mr-1" />
                                    Popular
                                  </Badge>
                                )}
                                {template.difficulty && (
                                  <Badge className={getDifficultyColor(template.difficulty)}>
                                    {template.difficulty}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 mt-1">{template.description}</p>

                            <div className="flex items-center justify-between mt-3">
                              <div className="flex flex-wrap gap-1">
                                {template.template.highlights?.slice(0, 2).map((highlight: string, idx: number) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {highlight}
                                  </Badge>
                                ))}
                                {template.template.highlights?.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{template.template.highlights.length - 2} more
                                  </Badge>
                                )}
                              </div>
                              <Button size="sm">Use Template</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {selectedSource === "library" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-2 border-b flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Choose {componentTitle} from Library</h3>
                <Button variant="ghost" onClick={() => setSelectedSource(null)}>
                  Back to Options
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

                <TabsContent value="my-libraries" className="mt-0 flex flex-col overflow-hidden h-[400px]">
                  {/* Search and Filters */}
                  <div className="flex gap-4 mb-4 flex-shrink-0">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder={`Search ${componentTitle.toLowerCase()} items...`}
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as "name" | "price" | "rating" | "recent")}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="recent">Recent</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterBy} onValueChange={(value) => setFilterBy(value as "all" | "popular" | "recent" | "favorites")}>
                      <SelectTrigger className="w-32">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Items</SelectItem>
                        <SelectItem value="favorites">Favorites</SelectItem>
                        <SelectItem value="recent">Recent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1 overflow-y-auto min-h-0 border border-gray-200 rounded library-scrollbar pr-2">
                    {filteredLibraryItems.length === 0 ? (
                      <div className="text-center py-12">
                        <Library className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">No {componentTitle.toLowerCase()} items found in library</p>
                        <p className="text-sm text-gray-400">Try creating one manually instead</p>
                        <Button variant="outline" className="mt-4 bg-transparent" onClick={handleSelectManual}>
                          Create Manually
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 p-4">
                        {filteredLibraryItems.map((item) => {
                          const validation = LibraryToItineraryConverter.validateLibraryItemForItinerary(item)
                          const previewSummary = LibraryToItineraryConverter.getPreviewSummary(item)
                          const isFavorite = favoriteComponents.includes(item._id)
                          const isRecent = recentComponents.includes(item._id)

                          return (
                            <Card
                              key={item._id}
                              className={`${getColor(item.category)} cursor-pointer hover:shadow-md transition-all ${!validation.isValid ? "opacity-75 border-yellow-300" : ""}`}
                              onClick={() => handleSelectLibraryItem(item)}
                            >
                              <CardContent className="p-2">
                                <div className="flex items-start space-x-3">
                                  <div className="text-2xl">{getIcon(item.category)}</div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                      <h4 className="font-semibold text-lg text-gray-900 truncate">{item.title}</h4>
                                      <div className="flex items-center gap-2 ml-2">
                                        <button
                                          onClick={(e) => toggleFavorite(item._id, e)}
                                          className={`p-1 rounded-full hover:bg-white/50 transition-colors ${isFavorite ? "text-red-500" : "text-gray-400"
                                            }`}
                                        >
                                          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                                        </button>
                                        {item.basePrice && (
                                          <Badge variant="secondary">
                                            {item.currency} {item.basePrice}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>

                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{previewSummary}</p>

                                    <div className="flex items-center justify-between mt-3">
                                      <div className="flex flex-wrap gap-1">
                                        {isRecent && (
                                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                            <Clock className="h-3 w-3 mr-1" />
                                            Recent
                                          </Badge>
                                        )}
                                        {item.city && (
                                          <Badge variant="outline" className="text-xs">
                                            {item.city}
                                          </Badge>
                                        )}
                                        {item.subCategory && (
                                          <Badge variant="secondary" className="text-xs">
                                            {item.subCategory}
                                          </Badge>
                                        )}
                                      </div>
                                      <Button size="sm">Select This Item</Button>
                                    </div>
                                  </div>
                                </div>

                                {item.multimedia && item.multimedia.length > 0 && (
                                  <div className="mt-3">
                                    <img
                                      src={item.multimedia[0] || "/placeholder.svg"}
                                      alt={item.title}
                                      className="w-full h-32 object-cover rounded border"
                                    />
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
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
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
