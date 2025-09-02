"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Share2, Eye, EyeOff, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ImageCollage } from "@/components/image-collage"
import { IGalleryItem } from "@/models/Itinerary"

interface PreviewItinerary {
  title: string
  description: string
  productId: string
  days: any[]
  branding: any
  totalPrice: number
  generatedAt: string
  additionalSections: Record<string, string>
  gallery?: IGalleryItem[]
}

export default function ItineraryPreviewPage() {
  const [itinerary, setItinerary] = useState<PreviewItinerary | null>(null)
  const [isDetailedView, setIsDetailedView] = useState(true)
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

      // Create a new window for printing
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        throw new Error("Failed to open print window")
      }

      // Add comprehensive styles for PDF
      const styles = `
        <style>
          @media print {
            @page { 
              margin: 1in; 
              size: A4;
            }
            body { 
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.5;
              color: #333;
            }
            .no-print { display: none !important; }
            .page-break { page-break-before: always; }
            .avoid-break { page-break-inside: avoid; }
            h1, h2, h3 { color: #1a1a1a; margin-top: 1.5em; margin-bottom: 0.5em; }
            .event-card { 
              border: 1px solid #e5e7eb; 
              border-radius: 8px; 
              padding: 1rem; 
              margin-bottom: 1rem;
              background: #fafafa;
            }
            .day-header {
              background: ${itinerary?.branding?.primaryColor || "#3B82F6"};
              color: white;
              padding: 1rem;
              border-radius: 8px;
              margin-bottom: 1rem;
            }
            .price-tag {
              background: #10B981;
              color: white;
              padding: 0.25rem 0.5rem;
              border-radius: 4px;
              font-weight: bold;
            }
          }
          body { 
            margin: 0; 
            padding: 2rem;
            background: white;
          }
        </style>
      `

      // Clone and prepare content for printing
      const clonedContent = printContent.cloneNode(true) as HTMLElement

      // Remove interactive elements
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

      // Wait for content to load, then print
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
        // Fallback: Copy to clipboard
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
      flight: "✈️",
      hotel: "🏨",
      activity: "🎯",
      transfer: "🚗",
      meal: "🍽️",
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 no-print">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{itinerary.title}</h1>
              <p className="text-sm text-gray-600">
                Product ID: {itinerary.productId} • Generated: {itinerary.generatedAt}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setIsDetailedView(!isDetailedView)}>
              {isDetailedView ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {isDetailedView ? "Summary View" : "Detailed View"}
            </Button>
            <Button variant="outline" onClick={handleShare} disabled={isSharing}>
              {isSharing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Share2 className="h-4 w-4 mr-2" />}
              Share
            </Button>
            <Button onClick={handleExportPDF} disabled={isExporting}>
              {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div id="preview-content" className="max-w-4xl mx-auto p-6">
        {/* Branding Header */}
        {itinerary.branding && (itinerary.branding.headerLogo || itinerary.branding.headerText) && (
          <Card className="mb-6">
            <CardContent
              className="p-6 text-center"
              style={{
                backgroundColor: itinerary.branding.primaryColor ? `${itinerary.branding.primaryColor}15` : "#f8fafc",
                borderColor: itinerary.branding.primaryColor || "#e2e8f0",
              }}
            >
              {itinerary.branding.headerLogo && (
                <img
                  src={itinerary.branding.headerLogo || "/placeholder.svg"}
                  alt="Company Logo"
                  className="h-16 mx-auto mb-4 object-contain"
                />
              )}
              {itinerary.branding.headerText && (
                <h2 className="text-xl font-semibold" style={{ color: itinerary.branding.primaryColor || "#1f2937" }}>
                  {itinerary.branding.headerText}
                </h2>
              )}
            </CardContent>
          </Card>
        )}

        {/* Itinerary Overview */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{itinerary.title}</h2>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {itinerary.days.length} {itinerary.days.length === 1 ? "Day" : "Days"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {itinerary.description && <p className="text-gray-700 mb-4">{itinerary.description}</p>}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Product ID: {itinerary.productId}</span>
              <span className="text-2xl font-bold text-green-600">{formatPrice(itinerary.totalPrice)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Gallery Section */}
        {itinerary.gallery && itinerary.gallery.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <h3 className="text-xl font-semibold">Gallery</h3>
              <p className="text-sm text-gray-600">
                {itinerary.gallery.length} {itinerary.gallery.length === 1 ? "item" : "items"}
              </p>
            </CardHeader>
            <CardContent>
              <ImageCollage gallery={itinerary.gallery} />
            </CardContent>
          </Card>
        )}

        {/* Itinerary Days */}
        {itinerary.days.map((day, index) => (
          <Card key={index} className="mb-6 avoid-break">
            <CardHeader
              className="day-header"
              style={{ backgroundColor: itinerary.branding?.primaryColor || "#3B82F6" }}
            >
              <div className="flex items-center justify-between text-white">
                <h3 className="text-xl font-semibold">
                  Day {day.day}: {day.title}
                </h3>
                {day.nights > 0 && (
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {day.nights} {day.nights === 1 ? "Night" : "Nights"}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Day Description */}
              {isDetailedView && day.detailedDescription && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{day.detailedDescription}</p>
                </div>
              )}
              {!isDetailedView && day.description && (
                <div className="mb-4">
                  <p className="text-gray-700">{day.description}</p>
                </div>
              )}

              {/* Events */}
              <div className="space-y-4">
                {day.events.map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    className="event-card border-l-4 pl-4"
                    style={{ borderLeftColor: itinerary.branding?.secondaryColor || "#10B981" }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{getEventIcon(event.category)}</span>
                          <h4 className="font-semibold text-lg">{event.title}</h4>
                          {event.time && (
                            <Badge variant="outline" className="text-xs">
                              {event.time}
                            </Badge>
                          )}
                        </div>

                        {event.description && <p className="text-gray-700 mb-2">{event.description}</p>}

                        {/* Category-specific details */}
                        {event.category === "flight" && (event.fromCity || event.toCity) && (
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Route:</span> {event.fromCity} → {event.toCity}
                          </div>
                        )}

                        {event.category === "hotel" && (event.checkIn || event.checkOut) && (
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Check-in:</span> {event.checkIn} |
                            <span className="font-medium"> Check-out:</span> {event.checkOut}
                          </div>
                        )}

                        {event.category === "activity" && (event.duration || event.difficulty) && (
                          <div className="text-sm text-gray-600 mb-2">
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
                          </div>
                        )}

                        {event.location && (
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Location:</span> {event.location}
                          </div>
                        )}

                        {/* Highlights */}
                        {isDetailedView && event.highlights && event.highlights.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {event.highlights.map((highlight, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {highlight}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Image preview */}
                        {event.category === "image" && event.imageUrl && (
                          <div className="mt-2">
                            <img
                              src={event.imageUrl || "/placeholder.svg"}
                              alt={event.imageAlt || event.title}
                              className="max-w-full h-48 object-cover rounded-lg"
                            />
                            {event.imageCaption && (
                              <p className="text-sm text-gray-600 mt-1 italic">{event.imageCaption}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      {event.price > 0 && (
                        <div className="ml-4">
                          <span className="price-tag text-sm font-bold px-2 py-1 rounded">
                            {formatPrice(event.price)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Day Meals */}
              {day.meals && (day.meals.breakfast || day.meals.lunch || day.meals.dinner) && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h5 className="font-medium text-yellow-800 mb-2">Meals Included:</h5>
                  <div className="flex gap-4 text-sm text-yellow-700">
                    {day.meals.breakfast && <span>🍳 Breakfast</span>}
                    {day.meals.lunch && <span>🥗 Lunch</span>}
                    {day.meals.dinner && <span>🍽️ Dinner</span>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Additional Sections */}
        {itinerary.additionalSections && Object.keys(itinerary.additionalSections).length > 0 && (
          <div className="space-y-6">
            {Object.entries(itinerary.additionalSections).map(([key, content]) => (
              <Card key={key} className="avoid-break">
                <CardHeader>
                  <h3 className="text-xl font-semibold capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</h3>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    {content.split("\n").map((paragraph, idx) => (
                      <p key={idx} className="mb-2">
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
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Total Itinerary Cost</h3>
                <p className="text-gray-600">
                  {itinerary.days.length} days • {itinerary.days.reduce((sum, day) => sum + day.events.length, 0)}{" "}
                  activities
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">{formatPrice(itinerary.totalPrice)}</div>
                <p className="text-sm text-gray-600">All prices in USD</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branding Footer */}
        {itinerary.branding && (itinerary.branding.footerLogo || itinerary.branding.footerText) && (
          <Card className="mt-6">
            <CardContent
              className="p-6 text-center"
              style={{
                backgroundColor: itinerary.branding.secondaryColor
                  ? `${itinerary.branding.secondaryColor}15`
                  : "#f0fdf4",
                borderColor: itinerary.branding.secondaryColor || "#10B981",
              }}
            >
              {itinerary.branding.footerLogo && (
                <img
                  src={itinerary.branding.footerLogo || "/placeholder.svg"}
                  alt="Footer Logo"
                  className="h-12 mx-auto mb-2 object-contain"
                />
              )}
              {itinerary.branding.footerText && (
                <p className="text-sm" style={{ color: itinerary.branding.secondaryColor || "#059669" }}>
                  {itinerary.branding.footerText}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
