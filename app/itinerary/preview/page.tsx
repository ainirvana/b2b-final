"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Download, Share2, Eye, EyeOff, Loader2, MapPin, Calendar, Clock, Users, Star, Plane, Hotel, Camera, DollarSign, Globe, Heart, UtensilsCrossed } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ImageCollage } from "@/components/image-collage"
import { IGalleryItem } from "@/models/Itinerary"

interface PreviewItinerary {
  title: string
  description: string
  productId: string
  country: string
  days: any[]
  nights: number
  branding: any
  totalPrice: number
  generatedAt: string
  additionalSections: Record<string, string>
  gallery?: IGalleryItem[]
  previewConfig?: {
    adults: number
    children: number
    withDates: boolean
    startDate?: string
  }
}

export default function ItineraryPreviewPage() {
  const [itinerary, setItinerary] = useState<PreviewItinerary | null>(null)
  const [isDetailedView, setIsDetailedView] = useState(true)
  const [showPrices, setShowPrices] = useState(true)
  const [showTimings, setShowTimings] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const previewData = localStorage.getItem("itinerary-preview")
    if (previewData) {
      try {
        const parsedData = JSON.parse(previewData)
        setItinerary(parsedData)
      } catch (error) {
        console.error("Failed to parse preview data:", error)
        toast({
          title: "Preview Error",
          description: "Failed to load preview data. Please try again.",
          variant: "destructive",
        })
      }
    }
  }, [toast])

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const printContent = document.getElementById("preview-content")
      if (!printContent) {
        throw new Error("Preview content not found")
      }

      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        throw new Error("Failed to open print window")
      }

      const styles = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
          @media print {
            @page { 
              margin: 0.75in; 
              size: A4;
            }
            body { 
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #1a1a1a;
              background: white;
            }
            .no-print { display: none !important; }
            .page-break { page-break-before: always; }
            .avoid-break { page-break-inside: avoid; }
            .hero-title { font-family: 'Playfair Display', serif; font-size: 2.5rem; font-weight: 700; }
            .section-title { font-family: 'Playfair Display', serif; font-size: 1.75rem; font-weight: 600; }
            .day-title { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 600; }
            .event-card { 
              border: none;
              border-left: 4px solid #e5e7eb;
              border-radius: 0;
              padding: 1.5rem;
              margin-bottom: 1.5rem;
              background: #fefefe;
              box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }
            .luxury-gradient {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .price-tag {
              background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
              color: white;
              padding: 0.5rem 1rem;
              border-radius: 25px;
              font-weight: 600;
              font-size: 0.9rem;
            }
            .gallery-grid {
              display: grid;
              gap: 0.5rem;
              margin: 1rem 0;
            }
          }
          body { 
            margin: 0; 
            padding: 0;
            background: white;
            font-family: 'Inter', sans-serif;
          }
        </style>
      `

      const clonedContent = printContent.cloneNode(true) as HTMLElement
      const interactiveElements = clonedContent.querySelectorAll("button, .no-print")
      interactiveElements.forEach((el) => el.remove())

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${itinerary?.title || "Itinerary"} - ${itinerary?.productId}</title>
            ${styles}
          </head>
          <body>
            ${clonedContent.innerHTML}
          </body>
        </html>
      `)

      printWindow.document.close()

      setTimeout(() => {
        printWindow.print()
        printWindow.onafterprint = () => printWindow.close()
      }, 1000)

      toast({
        title: "Export Started",
        description: "PDF export dialog opened. Choose 'Save as PDF' in the print dialog.",
      })
    } catch (error) {
      console.error("Export failed:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleShare = async () => {
    setIsSharing(true)
    try {
      const shareData = {
        title: `${itinerary?.title} - Travel Itinerary`,
        text: `Check out this ${itinerary?.days?.length}-day travel itinerary: ${itinerary?.description}`,
        url: window.location.href,
      }

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        toast({
          title: "Shared Successfully",
          description: "Itinerary shared successfully!",
        })
      } else {
        const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`
        await navigator.clipboard.writeText(shareText)
        toast({
          title: "Copied to Clipboard",
          description: "Itinerary details copied to clipboard!",
        })
      }
    } catch (error) {
      console.error("Share failed:", error)
      toast({
        title: "Share Failed",
        description: "Failed to share itinerary. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  const getEventIcon = (category: string) => {
    const icons = {
      flight: "✈",
      hotel: "🏨",
      activity: "🎯",
      transfer: "🚗",
      meal: "🍽",
      image: "📷",
      heading: "📝",
      paragraph: "📄",
      list: "📋",
    }
    return icons[category as keyof typeof icons] || "📍"
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Preview Data</h2>
          <p className="text-gray-600 mb-4">Please generate a preview from the itinerary builder.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 no-print sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()} className="hover:bg-gray-100/80">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {itinerary.title}
              </h1>
              <p className="text-sm text-gray-500">
                {itinerary.country || 'Multiple Destinations'} • Generated: {itinerary.generatedAt}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
              <label className="text-sm font-medium text-gray-700">Detailed</label>
              <Switch checked={isDetailedView} onCheckedChange={setIsDetailedView} />
            </div>
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
              <DollarSign className="h-4 w-4 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Prices</label>
              <Switch checked={showPrices} onCheckedChange={setShowPrices} />
            </div>
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Timings</label>
              <Switch checked={showTimings} onCheckedChange={setShowTimings} />
            </div>
            <Button variant="outline" onClick={handleShare} disabled={isSharing} className="hover:bg-gray-50">
              {isSharing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Share2 className="h-4 w-4 mr-2" />}
              Share
            </Button>
            <Button onClick={handleExportPDF} disabled={isExporting} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div id="preview-content" className="max-w-5xl mx-auto p-4 space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6 md:p-8">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "url('data:image/svg+xml;utf8,<svg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"none\" fill-rule=\"evenodd\"><g fill=\"%23ffffff\" fill-opacity=\"0.05\"><circle cx=\"30\" cy=\"30\" r=\"2\"/></g></g></svg>')"
          }}></div>
          
          <div className="relative z-10">
            {/* Branding Header */}
            {itinerary.branding && (itinerary.branding.headerLogo || itinerary.branding.headerText) && (
              <div className="text-center mb-8">
                {itinerary.branding.headerLogo && (
                  <img
                    src={itinerary.branding.headerLogo || "/placeholder.svg"}
                    alt="Company Logo"
                    className="h-16 mx-auto mb-4 object-contain filter brightness-0 invert"
                  />
                )}
                {itinerary.branding.headerText && (
                  <p className="text-lg font-medium text-white/90">
                    {itinerary.branding.headerText}
                  </p>
                )}
              </div>
            )}

            {/* Hero Title */}
            <div className="text-center mb-8">
              <div className="mb-4">
                <h2 className="text-2xl md:text-4xl font-bold mb-2 text-white/90" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {itinerary.country || 'Amazing Destination'}
                </h2>
                <h1 className="hero-title text-3xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {itinerary.title}
                </h1>
              </div>
              {itinerary.description && (
                <p className="text-lg text-white/80 max-w-3xl mx-auto leading-relaxed">
                  {itinerary.description}
                </p>
              )}
            </div>

            {/* Trip Stats */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                <Calendar className="h-4 w-4 text-blue-300" />
                <span className="font-medium text-sm">
                  {itinerary.days.length} {itinerary.days.length === 1 ? "Day" : "Days"} {itinerary.nights > 0 ? `${itinerary.nights} ${itinerary.nights === 1 ? "Night" : "Nights"}` : `${Math.max(0, itinerary.days.length - 1)} ${Math.max(0, itinerary.days.length - 1) === 1 ? "Night" : "Nights"}`}
                </span>
              </div>
              {itinerary.previewConfig && (
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                  <Users className="h-4 w-4 text-purple-300" />
                  <span className="font-medium text-sm">
                    {itinerary.previewConfig.adults} Adults {itinerary.previewConfig.children > 0 ? `${itinerary.previewConfig.children} Children` : ''}
                  </span>
                </div>
              )}
              {itinerary.previewConfig?.withDates && itinerary.previewConfig.startDate && (
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                  <Calendar className="h-4 w-4 text-green-300" />
                  <span className="font-medium text-sm">
                    {new Date(itinerary.previewConfig.startDate).toLocaleDateString()} - {new Date(new Date(itinerary.previewConfig.startDate).getTime() + (itinerary.days.length - 1) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                </div>
              )}
              {showPrices && (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full px-4 py-1.5">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-bold">{formatPrice(itinerary.totalPrice)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pinterest-Style Gallery Showcase */}
        {itinerary.gallery && itinerary.gallery.length > 0 && (
          <div className="rounded-2xl overflow-hidden shadow-2xl bg-white h-96">
              {itinerary.gallery.length === 1 && (
                <img 
                  src={itinerary.gallery[0].url} 
                  alt="Gallery 1" 
                  className="w-full h-full object-cover"
                />
              )}
              {itinerary.gallery.length === 2 && (
                <div className="flex h-full gap-2 p-2">
                  <div className="flex-1 rounded-xl overflow-hidden">
                    <img src={itinerary.gallery[0].url} alt="Gallery 1" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 rounded-xl overflow-hidden">
                    <img src={itinerary.gallery[1].url} alt="Gallery 2" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
              {itinerary.gallery.length === 3 && (
                <div className="flex h-full gap-2 p-2">
                  <div className="flex-2 rounded-xl overflow-hidden">
                    <img src={itinerary.gallery[0].url} alt="Gallery 1" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex-1 rounded-xl overflow-hidden">
                      <img src={itinerary.gallery[1].url} alt="Gallery 2" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 rounded-xl overflow-hidden">
                      <img src={itinerary.gallery[2].url} alt="Gallery 3" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              )}
              {itinerary.gallery.length === 4 && (
                <div className="flex h-full gap-2 p-2">
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex-2 rounded-xl overflow-hidden">
                      <img src={itinerary.gallery[0].url} alt="Gallery 1" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 rounded-xl overflow-hidden">
                      <img src={itinerary.gallery[1].url} alt="Gallery 2" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex-1 rounded-xl overflow-hidden">
                      <img src={itinerary.gallery[2].url} alt="Gallery 3" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-2 rounded-xl overflow-hidden">
                      <img src={itinerary.gallery[3].url} alt="Gallery 4" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              )}
              {itinerary.gallery.length >= 5 && (
                <div className="flex h-full gap-2 p-2">
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex-2 rounded-xl overflow-hidden">
                      <img src={itinerary.gallery[0].url} alt="Gallery 1" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex gap-2">
                      <div className="flex-1 rounded-xl overflow-hidden">
                        <img src={itinerary.gallery[1].url} alt="Gallery 2" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 rounded-xl overflow-hidden">
                        <img src={itinerary.gallery[2].url} alt="Gallery 3" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex-1 rounded-xl overflow-hidden">
                      <img src={itinerary.gallery[3].url} alt="Gallery 4" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-2 relative rounded-xl overflow-hidden">
                      <img src={itinerary.gallery[4].url} alt="Gallery 5" className="w-full h-full object-cover" />
                      {itinerary.gallery.length > 5 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <div className="text-white text-center">
                            <p className="text-2xl font-bold">+{itinerary.gallery.length - 5}</p>
                            <p className="text-sm">more photos</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Itinerary Days */}
        <div className="space-y-4">
          {itinerary.days.map((day, index) => (
            <Card key={index} className="avoid-break overflow-hidden border-0 shadow-lg bg-white">
              {/* Day Header */}
              <div className="luxury-gradient p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-90"></div>
                <div className="relative z-10 flex items-center justify-between text-white">
                  <div>
                    <h3 className="day-title text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Day {day.day}: {day.title}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-4">
                    {day.nights > 0 && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        {day.nights} {day.nights === 1 ? "Night" : "Nights"}
                      </Badge>
                    )}
                    {/* Calendar Date Display */}
                    {itinerary.previewConfig?.withDates && itinerary.previewConfig.startDate && (
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-center min-w-[80px]">
                        <div className="text-xs uppercase tracking-wide opacity-90 leading-none">
                          {new Date(new Date(itinerary.previewConfig.startDate).getTime() + (day.day - 1) * 24 * 60 * 60 * 1000).toLocaleDateString('en', { month: 'short' })}-{new Date(new Date(itinerary.previewConfig.startDate).getTime() + (day.day - 1) * 24 * 60 * 60 * 1000).getFullYear().toString().slice(-2)}
                        </div>
                        <div className="text-3xl font-bold leading-none">
                          {new Date(new Date(itinerary.previewConfig.startDate).getTime() + (day.day - 1) * 24 * 60 * 60 * 1000).getDate()}
                        </div>
                        <div className="text-xs uppercase tracking-wide opacity-90 leading-none">
                          {new Date(new Date(itinerary.previewConfig.startDate).getTime() + (day.day - 1) * 24 * 60 * 60 * 1000).toLocaleDateString('en', { weekday: 'short' })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                {/* Day Description */}
                {isDetailedView && day.detailedDescription && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <p className="text-gray-700 leading-relaxed">{day.detailedDescription}</p>
                  </div>
                )}
                {!isDetailedView && day.description && (
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed">{day.description}</p>
                  </div>
                )}

                {/* Events */}
                <div className="space-y-3">
                  {day.events.map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className="event-card bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm">
                              {getEventIcon(event.category)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-lg text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                                {event.title}
                              </h4>
                              {showTimings && event.time && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {event.time}
                                </div>
                              )}
                            </div>
                          </div>

                          {event.description && (
                            <p className="text-gray-700 mb-3 leading-relaxed text-sm">{event.description}</p>
                          )}

                          {/* Category-specific details */}
                          <div className="space-y-2 mb-3">
                            {event.category === "flight" && (event.fromCity || event.toCity) && (
                              <div className="flex items-center text-xs text-gray-600 bg-blue-50 rounded p-2">
                                <Plane className="h-3 w-3 mr-1 text-blue-500" />
                                <span className="font-medium">Route:</span>
                                <span className="ml-1">{event.fromCity} → {event.toCity}</span>
                              </div>
                            )}

                            {event.category === "hotel" && (event.checkIn || event.checkOut) && (
                              <div className="flex items-center text-xs text-gray-600 bg-green-50 rounded p-2">
                                <Hotel className="h-3 w-3 mr-1 text-green-500" />
                                <span>
                                  <span className="font-medium">Check-in:</span> {event.checkIn} |
                                  <span className="font-medium"> Check-out:</span> {event.checkOut}
                                </span>
                              </div>
                            )}

                            {event.category === "activity" && (event.duration || event.difficulty) && (
                              <div className="flex items-center text-xs text-gray-600 bg-purple-50 rounded p-2">
                                <Star className="h-3 w-3 mr-1 text-purple-500" />
                                <span>
                                  {event.duration && (
                                    <span>
                                      <span className="font-medium">Duration:</span> {event.duration}
                                    </span>
                                  )}
                                  {event.duration && event.difficulty && " | "}
                                  {event.difficulty && (
                                    <span>
                                      <span className="font-medium">Difficulty:</span> {event.difficulty}
                                    </span>
                                  )}
                                </span>
                              </div>
                            )}

                            {event.location && (
                              <div className="flex items-center text-xs text-gray-600 bg-orange-50 rounded p-2">
                                <MapPin className="h-3 w-3 mr-1 text-orange-500" />
                                <span className="font-medium">Location:</span>
                                <span className="ml-1">{event.location}</span>
                              </div>
                            )}
                          </div>

                          {/* Highlights */}
                          {isDetailedView && event.highlights && event.highlights.length > 0 && (
                            <div className="mb-3">
                              <h5 className="text-xs font-semibold text-gray-700 mb-1 flex items-center">
                                <Heart className="h-3 w-3 mr-1 text-red-400" />
                                Highlights
                              </h5>
                              <div className="flex flex-wrap gap-1">
                                {event.highlights.map((highlight, idx) => (
                                  <Badge key={idx} variant="secondary" className="bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 border-purple-200 px-2 py-0.5 text-xs">
                                    {highlight}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Image preview */}
                          {event.category === "image" && event.imageUrl && (
                            <div className="mt-2">
                              <img
                                src={event.imageUrl || "/placeholder.svg"}
                                alt={event.imageAlt || event.title}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              {event.imageCaption && (
                                <p className="text-xs text-gray-600 mt-1 italic text-center">{event.imageCaption}</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Price */}
                        {showPrices && event.price > 0 && (
                          <div className="ml-4">
                            <div className="price-tag bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full font-bold text-xs">
                              {formatPrice(event.price)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Day Meals */}
                {day.meals && (day.meals.breakfast || day.meals.lunch || day.meals.dinner) && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                    <h5 className="font-bold text-amber-800 mb-2 flex items-center text-sm">
                      <UtensilsCrossed className="h-4 w-4 mr-1" />
                      Meals Included
                    </h5>
                    <div className="flex gap-3 text-amber-700">
                      {day.meals.breakfast && (
                        <div className="flex items-center bg-white/60 rounded px-2 py-1">
                          <span className="text-sm mr-1">🍳</span>
                          <span className="font-medium text-xs">Breakfast</span>
                        </div>
                      )}
                      {day.meals.lunch && (
                        <div className="flex items-center bg-white/60 rounded px-2 py-1">
                          <span className="text-sm mr-1">🥗</span>
                          <span className="font-medium text-xs">Lunch</span>
                        </div>
                      )}
                      {day.meals.dinner && (
                        <div className="flex items-center bg-white/60 rounded px-2 py-1">
                          <span className="text-sm mr-1">🍽️</span>
                          <span className="font-medium text-xs">Dinner</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Sections */}
        {itinerary.additionalSections && Object.keys(itinerary.additionalSections).length > 0 && (
          <div className="space-y-4">
            {Object.entries(itinerary.additionalSections).map(([key, content]) => (
              <Card key={key} className="avoid-break border-0 shadow-lg bg-white overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100 p-3">
                  <h3 className="section-title text-lg font-bold text-gray-900 capitalize" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </h3>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="prose max-w-none">
                    {content.split("\n").map((paragraph, idx) => (
                      <p key={idx} className="mb-2 text-gray-700 leading-relaxed text-sm">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Total Summary */}
        {showPrices && (
          <Card className="mt-4 border-0 shadow-lg bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10"></div>
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="section-title text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Total Investment
                  </h3>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-sm">{itinerary.days.length} days</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Globe className="h-4 w-4 text-purple-500" />
                      <span className="font-medium text-sm">
                        {itinerary.days.reduce((sum, day) => sum + day.events.length, 0)} activities
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">
                    {formatPrice(itinerary.totalPrice)}
                  </div>
                  <p className="text-xs text-gray-600 font-medium">All prices in USD</p>
                  <Badge variant="secondary" className="mt-1 bg-green-100 text-green-700 border-green-200 text-xs">
                    Best Value Guaranteed
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Branding Footer */}
        {itinerary.branding && (itinerary.branding.footerLogo || itinerary.branding.footerText) && (
          <Card className="mt-4 border-0 shadow-lg bg-gradient-to-r from-slate-900 to-gray-900 text-white overflow-hidden">
            <CardContent className="p-4 text-center relative z-10">
              {itinerary.branding.footerLogo && (
                <img
                  src={itinerary.branding.footerLogo || "/placeholder.svg"}
                  alt="Footer Logo"
                  className="h-12 mx-auto mb-2 object-contain filter brightness-0 invert"
                />
              )}
              {itinerary.branding.footerText && (
                <p className="text-sm font-medium text-white/90">
                  {itinerary.branding.footerText}
                </p>
              )}
              <div className="mt-3 pt-3 border-t border-white/20">
                <p className="text-xs text-white/60">
                  Created with ❤️ for unforgettable journeys
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}