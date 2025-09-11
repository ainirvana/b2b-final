"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  onSelectManual: () => void
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

  // Filter library items by component type
  const filteredLibraryItems = items
    .filter((item) => {
      const matchesCategory = item.category.toLowerCase() === componentType.toLowerCase()
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

  const handleSelectManual = () => {
    onSelectManual()
    onClose()
    setSelectedSource(null)
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

    onSelectManual() // This will create the component, we'll need to modify this to accept template data
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add {componentTitle} Component</DialogTitle>
        </DialogHeader>

        {!selectedSource && (
          <div className="flex-1 flex flex-col space-y-6 p-6">
            <p className="text-gray-600 text-center">
              How would you like to add this {componentTitle.toLowerCase()} component?
            </p>

            <div className="grid grid-cols-3 gap-6">
              {/* Manual Option */}
              <Card
                className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-400"
                onClick={handleSelectManual}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Create Manually</h3>
                  <p className="text-gray-600 text-sm">
                    Create a new {componentTitle.toLowerCase()} component from scratch
                  </p>
                  <Button className="mt-4" size="sm">
                    Create New
                  </Button>
                </CardContent>
              </Card>

              {/* Templates Option */}
              <Card
                className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-purple-400"
                onClick={() => setSelectedSource("templates")}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Copy className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Use Template</h3>
                  <p className="text-gray-600 text-sm">Start with {filteredTemplates.length} pre-designed templates</p>
                  <Button variant="outline" className="mt-4 bg-transparent" size="sm">
                    Browse Templates ({filteredTemplates.length})
                  </Button>
                </CardContent>
              </Card>

              {/* Library Option */}
              <Card
                className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-green-400"
                onClick={() => setSelectedSource("library")}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Library className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">From Library</h3>
                  <p className="text-gray-600 text-sm">Choose from {filteredLibraryItems.length} library items</p>
                  <Button variant="outline" className="mt-4 bg-transparent" size="sm">
                    Browse Library ({filteredLibraryItems.length})
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {selectedSource === "templates" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b">
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

            <div className="flex-1 overflow-auto p-4">
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
                      <CardContent className="p-4">
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
            <div className="p-4 border-b">
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

                <TabsContent value="my-libraries" className="mt-0">
                  {/* Search and Filters */}
                  <div className="flex gap-4 mb-4">
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

                  <div className="flex-1 overflow-auto">
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
                              <CardContent className="p-4">
                                <div className="flex items-start space-x-3">
                                  <div className="text-2xl">{getIcon(item.category)}</div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                      <h4 className="font-semibold text-lg text-gray-900 truncate">{item.title}</h4>
                                      <div className="flex items-center gap-2 ml-2">
                                        <button
                                          onClick={(e) => toggleFavorite(item._id, e)}
                                          className={`p-1 rounded-full hover:bg-white/50 transition-colors ${
                                            isFavorite ? "text-red-500" : "text-gray-400"
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
