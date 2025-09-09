"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, MapPin, Clock, Edit, Package, ShoppingCart, FileText, Users, DollarSign, Share2, Copy } from "lucide-react"
import { IItinerary } from "@/models/Itinerary"
import { useToast } from "@/hooks/use-toast"

interface ItineraryListProps {
  onCreateNew: () => void
  onViewItinerary: (id: string) => void
  onEditItinerary: (id: string) => void
  onShareItinerary?: (id: string) => void
}

const TYPE_CONFIG = {
  "fixed-group-tour": {
    label: "Fixed Group Tour",
    icon: Calendar,
    color: "bg-blue-50 border-blue-200 text-blue-800",
  },
  "customized-package": {
    label: "Customized Package", 
    icon: Package,
    color: "bg-green-50 border-green-200 text-green-800",
  },
  "cart-combo": {
    label: "Cart/Combo",
    icon: ShoppingCart,
    color: "bg-purple-50 border-purple-200 text-purple-800",
  },
  "html-editor": {
    label: "HTML Editor",
    icon: FileText,
    color: "bg-orange-50 border-orange-200 text-orange-800",
  },
}

export function ItineraryList({ onCreateNew, onViewItinerary, onEditItinerary, onShareItinerary }: ItineraryListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [itineraries, setItineraries] = useState<IItinerary[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Load itineraries
  useEffect(() => {
    fetch("/api/itineraries")
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data?.data)) {
          setItineraries(data.data);
        } else if (Array.isArray(data)) {
          setItineraries(data);
        } else {
          console.error("Unexpected data format:", data);
          setItineraries([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch itineraries:", err);
        setItineraries([]);
        setLoading(false);
      });
  }, [])

  const createQuickShare = async (itinerary: IItinerary) => {
    try {
      const response = await fetch("/api/shares", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: `${itinerary.title} - Public Share`,
          description: itinerary.description,
          shareType: "individual",
          itineraryId: itinerary._id,
          settings: {
            allowComments: false,
            showPricing: true,
            showContactInfo: true
          }
        })
      })

      if (!response.ok) {
        throw new Error("Failed to create share")
      }

      const result = await response.json()
      const shareUrl = result.publicUrl

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl)
      
      toast({
        title: "Share Link Created",
        description: "Public share link copied to clipboard!"
      })
    } catch (err) {
      console.error("Error creating quick share:", err)
      toast({
        title: "Share Failed",
        description: "Failed to create share link. Please try again.",
        variant: "destructive"
      })
    }
  }

  const filteredItineraries = itineraries.filter(itinerary => 
    itinerary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    itinerary.destination.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-lg font-medium">Loading itineraries...</p>
          <p className="text-sm text-gray-500">Please wait</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Itineraries</h2>
          <p className="text-sm text-gray-500">Create and manage your travel itineraries</p>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create New
        </Button>
      </div>

      <div className="mb-6">
        <Input
          type="search"
          placeholder="Search itineraries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItineraries.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium">No itineraries found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by creating your first itinerary
            </p>
            <Button onClick={onCreateNew} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create New Itinerary
            </Button>
          </div>
        ) : (
          filteredItineraries.map((itinerary) => {
            const itineraryType = itinerary.type || "customized-package"
            const typeConfig = TYPE_CONFIG[itineraryType as keyof typeof TYPE_CONFIG] || TYPE_CONFIG["customized-package"]
            const TypeIcon = typeConfig.icon

            return (
              <Card 
                key={itinerary._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {itinerary.title}
                        <Badge className={`text-xs ${typeConfig.color}`}>
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {typeConfig.label}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="mr-1 h-4 w-4" />
                        {itinerary.destination}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={itinerary.status === "published" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {itinerary.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Duration and Price */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <Clock className="mr-1 h-4 w-4" />
                        {itinerary.duration}
                      </div>
                      {itinerary.totalPrice > 0 && (
                        <div className="flex items-center text-gray-700 font-medium">
                          <DollarSign className="mr-1 h-4 w-4" />
                          {itinerary.totalPrice}
                        </div>
                      )}
                    </div>

                    {/* Type-specific information */}
                    {itinerary.type === "fixed-group-tour" && itinerary.fixedDates && (
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          Start: {new Date(itinerary.fixedDates.startDate).toLocaleDateString()}
                        </span>
                        {itinerary.fixedDates.maxParticipants && (
                          <div className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {itinerary.fixedDates.currentBookings || 0}/{itinerary.fixedDates.maxParticipants}
                          </div>
                        )}
                      </div>
                    )}

                    {itinerary.type === "cart-combo" && itinerary.cartItems && (
                      <div className="text-xs text-gray-500">
                        {itinerary.cartItems.length} item{itinerary.cartItems.length !== 1 ? 's' : ''} in cart
                      </div>
                    )}

                    {itinerary.type === "html-editor" && itinerary.htmlBlocks && (
                      <div className="text-xs text-gray-500">
                        {itinerary.htmlBlocks.length} content block{itinerary.htmlBlocks.length !== 1 ? 's' : ''}
                      </div>
                    )}

                    <p className="text-sm text-gray-600 line-clamp-2">{itinerary.description}</p>
                    
                    {/* Creator and Updated info */}
                    <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t">
                      <span>
                        Created by {itinerary.createdBy || 'Unknown'}
                      </span>
                      <span>
                        {new Date(itinerary.updatedAt).toLocaleDateString('en-US', {
                          day: '2-digit',
                          month: 'short', 
                          year: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="flex justify-end space-x-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => onViewItinerary(itinerary._id!)}>
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onEditItinerary(itinerary._id!)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => createQuickShare(itinerary)}
                        title="Create quick public share"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
