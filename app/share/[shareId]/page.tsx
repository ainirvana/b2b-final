"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Eye, Lock, Calendar, MapPin, DollarSign, Users, Clock, Loader2, Share2, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { IPublicShare } from "@/models/PublicShare"
import { IItinerary } from "@/models/Itinerary"
import { ImageCollage } from "@/components/image-collage"

interface PublicShareData extends IPublicShare {
  itinerary?: IItinerary
  itineraries?: IItinerary[]
}

export default function PublicSharePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [shareData, setShareData] = useState<PublicShareData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [passwordRequired, setPasswordRequired] = useState(false)
  const [password, setPassword] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)

  const shareId = params.shareId as string

  useEffect(() => {
    if (shareId) {
      fetchShareData()
    }
  }, [shareId])

  const fetchShareData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/shares/${shareId}`)
      
      if (response.status === 404) {
        setError("Share not found or has been removed")
        return
      }
      
      if (response.status === 410) {
        setError("This share has expired")
        return
      }
      
      if (!response.ok) {
        throw new Error("Failed to fetch share data")
      }

      const data = await response.json()
      const share = data.share as PublicShareData
      
      if (share.passwordProtected && !verified) {
        setPasswordRequired(true)
        setShareData(share)
      } else {
        setShareData(share)
        // Track view
        trackView()
      }
    } catch (err) {
      console.error("Error fetching share:", err)
      setError("Failed to load share data")
    } finally {
      setLoading(false)
    }
  }

  const trackView = async () => {
    try {
      await fetch(`/api/shares/${shareId}/view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      })
    } catch (err) {
      console.error("Error tracking view:", err)
    }
  }

  const verifyPassword = async () => {
    if (!password.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter the password to access this share",
        variant: "destructive"
      })
      return
    }

    try {
      setVerifying(true)
      const response = await fetch(`/api/shares/${shareId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      })

      if (response.status === 401) {
        toast({
          title: "Invalid Password",
          description: "The password you entered is incorrect",
          variant: "destructive"
        })
        return
      }

      if (!response.ok) {
        throw new Error("Failed to verify password")
      }

      setVerified(true)
      setPasswordRequired(false)
      trackView()
      
      toast({
        title: "Access Granted",
        description: "Password verified successfully"
      })
    } catch (err) {
      console.error("Error verifying password:", err)
      toast({
        title: "Verification Failed",
        description: "Failed to verify password. Please try again.",
        variant: "destructive"
      })
    } finally {
      setVerifying(false)
    }
  }

  const handleShare = async () => {
    try {
      const shareInfo = {
        title: `${shareData?.title} - Travel Itinerary`,
        text: shareData?.description || "Check out this amazing travel itinerary!",
        url: window.location.href,
      }

      if (navigator.share && navigator.canShare(shareInfo)) {
        await navigator.share(shareInfo)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link Copied",
          description: "Share link copied to clipboard!"
        })
      }
    } catch (err) {
      console.error("Share failed:", err)
      toast({
        title: "Share Failed",
        description: "Failed to share. Please try again.",
        variant: "destructive"
      })
    }
  }

  const formatPrice = (price: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency
    }).format(price)
  }

  const getTypeColor = (type: string) => {
    const colors = {
      "fixed-group-tour": "bg-blue-100 text-blue-800",
      "customized-package": "bg-green-100 text-green-800",
      "cart-combo": "bg-purple-100 text-purple-800",
      "html-editor": "bg-orange-100 text-orange-800"
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      "fixed-group-tour": "Fixed Group Tour",
      "customized-package": "Customized Package",
      "cart-combo": "Cart/Combo",
      "html-editor": "Custom Content"
    }
    return labels[type as keyof typeof labels] || type
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading shared content...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 mb-4">
              <Lock className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push("/")} variant="outline">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (passwordRequired && !verified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="text-blue-500 mb-4">
              <Lock className="h-12 w-12 mx-auto" />
            </div>
            <CardTitle>Protected Content</CardTitle>
            <p className="text-gray-600">This content is password protected</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && verifyPassword()}
              />
            </div>
            <Button
              onClick={verifyPassword}
              disabled={verifying}
              className="w-full"
            >
              {verifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                "Access Content"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!shareData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>No data available</p>
      </div>
    )
  }

  const branding = shareData.settings.customBranding || 
    (shareData.shareType === "individual" ? shareData.itinerary?.branding : null)

  // Helper to safely get branding properties
  const getBrandingProp = (prop: string) => {
    if (shareData.settings.customBranding) {
      return (shareData.settings.customBranding as any)[prop]
    }
    if (shareData.shareType === "individual" && shareData.itinerary?.branding) {
      // Map itinerary branding to custom branding structure
      const itineraryBranding = shareData.itinerary.branding
      switch (prop) {
        case 'logo':
          return itineraryBranding.headerLogo
        case 'primaryColor':
          return itineraryBranding.primaryColor
        case 'companyName':
          return itineraryBranding.headerText
        default:
          return undefined
      }
    }
    return undefined
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header 
        className="bg-white shadow-sm border-b"
        style={{
          backgroundColor: getBrandingProp('primaryColor') || "#ffffff",
          color: getBrandingProp('primaryColor') ? "#ffffff" : "#1f2937"
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {getBrandingProp('logo') && (
                <img
                  src={getBrandingProp('logo')}
                  alt="Logo"
                  className="h-10 w-auto"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">{shareData.title}</h1>
                {shareData.description && (
                  <p className="text-sm opacity-80">{shareData.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleShare}
                variant="outline"
                size="sm"
                className="bg-white text-gray-700 hover:bg-gray-50"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {shareData.shareType === "individual" && shareData.itinerary ? (
          <IndividualItineraryView 
            itinerary={shareData.itinerary} 
            settings={shareData.settings}
          />
        ) : shareData.shareType === "collection" && shareData.itineraries ? (
          <CollectionView 
            itineraries={shareData.itineraries} 
            settings={shareData.settings}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No content available</p>
          </div>
        )}
      </main>

      {/* Footer */}
      {shareData.settings.showContactInfo && getBrandingProp('companyName') && (
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">{getBrandingProp('companyName')}</h3>
              {getBrandingProp('contactEmail') && (
                <p className="text-gray-600">Email: {getBrandingProp('contactEmail')}</p>
              )}
              {getBrandingProp('contactPhone') && (
                <p className="text-gray-600">Phone: {getBrandingProp('contactPhone')}</p>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

function IndividualItineraryView({ 
  itinerary, 
  settings 
}: { 
  itinerary: IItinerary
  settings: any 
}) {
  const formatPrice = (price: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency
    }).format(price)
  }

  const getTypeColor = (type: string) => {
    const colors = {
      "fixed-group-tour": "bg-blue-100 text-blue-800",
      "customized-package": "bg-green-100 text-green-800",
      "cart-combo": "bg-purple-100 text-purple-800",
      "html-editor": "bg-orange-100 text-orange-800"
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      "fixed-group-tour": "Fixed Group Tour",
      "customized-package": "Customized Package",
      "cart-combo": "Cart/Combo",
      "html-editor": "Custom Content"
    }
    return labels[type as keyof typeof labels] || type
  }
  return (
    <div className="space-y-8">
      {/* Header Info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold">{itinerary.title}</h2>
                <Badge className={getTypeColor(itinerary.type)}>
                  {getTypeLabel(itinerary.type)}
                </Badge>
              </div>
              <p className="text-gray-600 mb-4">{itinerary.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{itinerary.destination}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{itinerary.duration}</span>
                </div>
                {settings.showPricing && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">
                      {formatPrice(itinerary.totalPrice, itinerary.currency)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {itinerary.gallery && itinerary.gallery.length > 0 && (
              <div>
                <ImageCollage gallery={itinerary.gallery} className="max-h-[300px]" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Highlights */}
      {itinerary.highlights && itinerary.highlights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid md:grid-cols-2 gap-2">
              {itinerary.highlights.map((highlight, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Days */}
      {itinerary.days && itinerary.days.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Detailed Itinerary</h3>
          {itinerary.days.map((day, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Day {day.day}: {day.title}
                  </CardTitle>
                  <Badge variant="outline">{day.date}</Badge>
                </div>
                {day.description && (
                  <p className="text-gray-600">{day.description}</p>
                )}
              </CardHeader>
              <CardContent>
                {day.events && day.events.length > 0 && (
                  <div className="space-y-4">
                    {day.events.map((event, eventIndex) => (
                      <div key={eventIndex} className="border-l-4 border-blue-200 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{event.category}</Badge>
                          <span className="font-medium">{event.title}</span>
                        </div>
                        {event.description && (
                          <p className="text-gray-600 text-sm">{event.description}</p>
                        )}
                        {event.time && (
                          <p className="text-gray-500 text-sm">Time: {event.time}</p>
                        )}
                        {event.location && (
                          <p className="text-gray-500 text-sm">Location: {event.location}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function CollectionView({ 
  itineraries, 
  settings 
}: { 
  itineraries: IItinerary[]
  settings: any 
}) {
  const [selectedItinerary, setSelectedItinerary] = useState<IItinerary | null>(null)
  const [showModal, setShowModal] = useState(false)

  const formatPrice = (price: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency
    }).format(price)
  }

  const getTypeColor = (type: string) => {
    const colors = {
      "fixed-group-tour": "bg-blue-100 text-blue-800",
      "customized-package": "bg-green-100 text-green-800",
      "cart-combo": "bg-purple-100 text-purple-800",
      "html-editor": "bg-orange-100 text-orange-800"
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      "fixed-group-tour": "Fixed Group Tour",
      "customized-package": "Customized Package",
      "cart-combo": "Cart/Combo",
      "html-editor": "Custom Content"
    }
    return labels[type as keyof typeof labels] || type
  }

  const handleViewItinerary = (itinerary: IItinerary) => {
    setSelectedItinerary(itinerary)
    setShowModal(true)
  }

  const closeModal = () => {
    setSelectedItinerary(null)
    setShowModal(false)
  }
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Travel Collection</h2>
        <p className="text-gray-600">
          Explore {itineraries.length} carefully curated travel experiences
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {itineraries.map((itinerary, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
            {itinerary.gallery && itinerary.gallery.length > 0 && (
              <div className="h-48 overflow-hidden">
                <img
                  src={itinerary.gallery[0].url}
                  alt={itinerary.gallery[0].altText || itinerary.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-lg">{itinerary.title}</h3>
                <Badge className={getTypeColor(itinerary.type)} variant="secondary">
                  {getTypeLabel(itinerary.type)}
                </Badge>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {itinerary.description}
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{itinerary.destination}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{itinerary.duration}</span>
                </div>
                {settings.showPricing && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">
                      {formatPrice(itinerary.totalPrice, itinerary.currency)}
                    </span>
                  </div>
                )}
              </div>

              {itinerary.highlights && itinerary.highlights.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-sm mb-2">Key Highlights:</h4>
                  <ul className="space-y-1">
                    {itinerary.highlights.slice(0, 3).map((highlight, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                        <div className="w-1 h-1 bg-blue-500 rounded-full" />
                        {highlight}
                      </li>
                    ))}
                    {itinerary.highlights.length > 3 && (
                      <li className="text-xs text-gray-500">
                        +{itinerary.highlights.length - 3} more highlights
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* View Details Button */}
              <div className="mt-4 pt-4 border-t">
                <Button
                  onClick={() => handleViewItinerary(itinerary)}
                  className="w-full"
                  size="sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Individual Itinerary Modal */}
      {showModal && selectedItinerary && (
        <Dialog open={showModal} onOpenChange={closeModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl">{selectedItinerary.title}</DialogTitle>
                <Badge className={getTypeColor(selectedItinerary.type)}>
                  {getTypeLabel(selectedItinerary.type)}
                </Badge>
              </div>
              <p className="text-gray-600">{selectedItinerary.description}</p>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Destination</p>
                    <p className="font-medium">{selectedItinerary.destination}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-medium">{selectedItinerary.duration}</p>
                  </div>
                </div>
                {settings.showPricing && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="font-medium">
                        {formatPrice(selectedItinerary.totalPrice, selectedItinerary.currency)}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Days</p>
                    <p className="font-medium">{selectedItinerary.days?.length || 0}</p>
                  </div>
                </div>
              </div>

              {/* Gallery */}
              {selectedItinerary.gallery && selectedItinerary.gallery.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Gallery</h4>
                  <ImageCollage gallery={selectedItinerary.gallery} className="max-h-[300px]" />
                </div>
              )}

              {/* Highlights */}
              {selectedItinerary.highlights && selectedItinerary.highlights.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Highlights</h4>
                  <ul className="grid md:grid-cols-2 gap-2">
                    {selectedItinerary.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        <span className="text-sm">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Days Itinerary */}
              {selectedItinerary.days && selectedItinerary.days.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Day-by-Day Itinerary</h4>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedItinerary.days.map((day, index) => (
                      <Card key={index} className="border border-gray-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                              Day {day.day}: {day.title}
                            </CardTitle>
                            <Badge variant="outline" className="text-xs">{day.date}</Badge>
                          </div>
                          {day.description && (
                            <p className="text-sm text-gray-600">{day.description}</p>
                          )}
                        </CardHeader>
                        <CardContent className="pt-0">
                          {day.events && day.events.length > 0 && (
                            <div className="space-y-3">
                              {day.events.map((event, eventIndex) => (
                                <div key={eventIndex} className="border-l-2 border-blue-200 pl-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-xs">{event.category}</Badge>
                                    <span className="font-medium text-sm">{event.title}</span>
                                  </div>
                                  {event.description && (
                                    <p className="text-xs text-gray-600 mb-1">{event.description}</p>
                                  )}
                                  <div className="flex gap-4 text-xs text-gray-500">
                                    {event.time && <span>⏰ {event.time}</span>}
                                    {event.location && <span>📍 {event.location}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Type-specific content */}
              {selectedItinerary.type === "fixed-group-tour" && selectedItinerary.fixedDates && (
                <div>
                  <h4 className="font-semibold mb-3">Tour Information</h4>
                  <div className="grid md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="font-medium">{new Date(selectedItinerary.fixedDates.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">End Date</p>
                      <p className="font-medium">{new Date(selectedItinerary.fixedDates.endDate).toLocaleDateString()}</p>
                    </div>
                    {selectedItinerary.fixedDates.maxParticipants && (
                      <div>
                        <p className="text-sm text-gray-600">Capacity</p>
                        <p className="font-medium">
                          {selectedItinerary.fixedDates.currentBookings || 0} / {selectedItinerary.fixedDates.maxParticipants} participants
                        </p>
                      </div>
                    )}
                    {selectedItinerary.fixedDates.availableDates && selectedItinerary.fixedDates.availableDates.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600">Available Dates</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedItinerary.fixedDates.availableDates.slice(0, 3).map((date, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {new Date(date).toLocaleDateString()}
                            </Badge>
                          ))}
                          {selectedItinerary.fixedDates.availableDates.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{selectedItinerary.fixedDates.availableDates.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedItinerary.type === "cart-combo" && selectedItinerary.cartItems && selectedItinerary.cartItems.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Cart Items</h4>
                  <div className="space-y-2">
                    {selectedItinerary.cartItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-600">{item.description}</p>
                          <Badge variant="outline" className="text-xs mt-1">{item.category}</Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">${item.price}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedItinerary.type === "html-editor" && selectedItinerary.htmlBlocks && selectedItinerary.htmlBlocks.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Content Blocks</h4>
                  <div className="space-y-3">
                    {selectedItinerary.htmlBlocks.map((block, idx) => (
                      <div key={idx} className="p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{block.type}</Badge>
                          {block.level && <span className="text-xs text-gray-500">Level {block.level}</span>}
                        </div>
                        <div className="text-sm" dangerouslySetInnerHTML={{ __html: block.content }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
