"use client"



import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"

import { Switch } from "@/components/ui/switch"

import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"

import { ArrowLeft, Download, Share2, Edit, Eye, EyeOff, Loader2, MapPin, Calendar, Clock, Users, Star, Plane, Hotel, Camera, DollarSign, Globe, Heart, UtensilsCrossed, ChevronDown, ChevronUp, Car, Percent, ShoppingCart, Phone, Check, X } from "lucide-react"

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
    template: number
  }
  itineraryId?: string | null
  itineraryType?: string
  _id?: string
}



export default function ItineraryPreviewPage() {

  const [itinerary, setItinerary] = useState<PreviewItinerary | null>(null)

  const [isDetailedView, setIsDetailedView] = useState(true)

  const [showPrices, setShowPrices] = useState(true)

  const [showTimings, setShowTimings] = useState(true)

  const [isExporting, setIsExporting] = useState(false)

  const [isSharing, setIsSharing] = useState(false)

  const [collapsedDays, setCollapsedDays] = useState<Record<number, boolean>>({})

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

            /* Template 2 Specific Styles */

            .timeline-dot {

              width: 4rem;

              height: 4rem;

              border-radius: 50%;

              background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);

              display: flex;

              align-items: center;

              justify-content: center;

              color: white;

              font-weight: bold;

              font-size: 1.25rem;

              box-shadow: 0 4px 12px rgba(0,0,0,0.15);

              border: 4px solid white;

            }

            .timeline-line {

              position: absolute;

              left: 2rem;

              top: 6rem;

              width: 2px;

              background: linear-gradient(to bottom, #3b82f6, #8b5cf6);

              z-index: 0;

            }

            .event-card-t2 {

              background: white;

              border-radius: 1rem;

              box-shadow: 0 4px 12px rgba(0,0,0,0.08);

              border: 1px solid #e5e7eb;

              padding: 1.5rem;

              margin-bottom: 1rem;

            }

            .category-icon {

              width: 3rem;

              height: 3rem;

              border-radius: 0.75rem;

              display: flex;

              align-items: center;

              justify-content: center;

              color: white;

              font-size: 1.125rem;

              box-shadow: 0 2px 8px rgba(0,0,0,0.1);

            }

          }

          body { 

            margin: 0; 

            padding: 0;

            background: white;

            font-family: 'Inter', sans-serif;

          }

          /* Template 2 Print Adjustments */

          @media print {

            .timeline-line { display: none; }

            .timeline-dot { 

              width: 3rem; 

              height: 3rem; 

              font-size: 1rem;

              margin-bottom: 1rem;

            }

            .event-card-t2 {

              box-shadow: none;

              border: 1px solid #d1d5db;

              margin-bottom: 1.5rem;

            }

            .category-icon {

              width: 2.5rem;

              height: 2.5rem;

              font-size: 1rem;

            }

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



  const handleEdit = () => {
    if (!itinerary) return
    let type = itinerary.itineraryType || "customized-package"
    let rawId = itinerary.itineraryId ?? itinerary._id ?? null

    if (!rawId && typeof window !== "undefined") {
      const fallbackId = window.localStorage.getItem("last-preview-itinerary-id")
      if (fallbackId) {
        rawId = fallbackId
      }
      const fallbackType = window.localStorage.getItem("last-preview-itinerary-type")
      if (fallbackType) {
        type = fallbackType
      }
    }

    if (rawId) {
      const idString = typeof rawId === "string" ? rawId : rawId.toString()
      router.push(`/itinerary/builder?id=${idString}&mode=edit&type=${type}`)
    } else {
      router.push(`/itinerary/builder?mode=edit&type=${type}`)
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







  const toggleDayCollapse = (dayNumber: number) => {
    setCollapsedDays((previous) => ({
      ...previous,
      [dayNumber]: !previous[dayNumber],
    }))
  }

  const getDayDate = (dayNumber: number) => {
    if (!itinerary?.previewConfig?.withDates || !itinerary.previewConfig?.startDate) {
      return null
    }
    const baseDate = new Date(itinerary.previewConfig.startDate)
    baseDate.setDate(baseDate.getDate() + (dayNumber - 1))
    return baseDate
  }
  const renderTemplateTwo = () => {
    if (!itinerary) {
      return null
    }
    const galleryItems = (itinerary.gallery ?? []).filter((item) => item.type === "image")
    const collageImages = galleryItems.slice(0, 3)
    const fallbackGradients = [
      "from-amber-300 to-amber-500",
      "from-sky-300 to-sky-500",
      "from-rose-300 to-rose-500",
    ]
    const categoryCounts = itinerary.days.reduce(
      (counts: { flight: number; hotel: number; transfer: number; activity: number; meal: number }, day: any) => {
        day.events?.forEach((event: any) => {
          const category = event?.category
          switch (category) {
            case "flight":
              counts.flight += 1
              break
            case "hotel":
              counts.hotel += 1
              break
            case "transfer":
              counts.transfer += 1
              break
            case "activity":
              counts.activity += 1
              break
            case "meal":
              counts.meal += 1
              break
            default:
              break
          }
        })
        if (day.meals) {
          if (day.meals.breakfast) counts.meal += 1
          if (day.meals.lunch) counts.meal += 1
          if (day.meals.dinner) counts.meal += 1
        }
        return counts
      },
      { flight: 0, hotel: 0, transfer: 0, activity: 0, meal: 0 },
    )
    const mealActive = itinerary.days.some((day: any) => {
      const hasEventMeal = day.events?.some((event: any) => event.category === "meal")
      const hasConfiguredMeal =
        !!day.meals && (day.meals.breakfast || day.meals.lunch || day.meals.dinner)
      return hasEventMeal || hasConfiguredMeal
    })
    const formatLabel = (count: number, singular: string, plural: string) =>
      count > 0 ? `${count} ${count === 1 ? singular : plural}` : plural
    const highlightItems = [
      {
        key: "flight",
        icon: Plane,
        singular: "Flight",
        plural: "Flights",
        count: categoryCounts.flight,
      },
      {
        key: "hotel",
        icon: Hotel,
        singular: "Hotel",
        plural: "Hotels",
        count: categoryCounts.hotel,
      },
      {
        key: "transfer",
        icon: Car,
        singular: "Transfer",
        plural: "Transfers",
        count: categoryCounts.transfer,
      },
      {
        key: "activity",
        icon: Camera,
        singular: "Activity",
        plural: "Activities",
        count: categoryCounts.activity,
      },
      {
        key: "meal",
        icon: UtensilsCrossed,
        singular: "Meal",
        plural: "Meals",
        count: categoryCounts.meal,
      },
    ].map((item) => ({
      ...item,
      label:
        item.key === "meal"
          ? "Meals"
          : formatLabel(item.count, item.singular, item.plural),
      active: item.key === "meal" ? mealActive : item.count > 0,
    }))
    const travellers: string[] = []
    if (itinerary.previewConfig?.adults) {
      travellers.push(`${itinerary.previewConfig.adults} Adult${itinerary.previewConfig.adults > 1 ? "s" : ""}`)
    }
    if (itinerary.previewConfig?.children) {
      travellers.push(`${itinerary.previewConfig.children} Child${itinerary.previewConfig.children > 1 ? "ren" : ""}`)
    }
    const guestsLabel = travellers.length > 0 ? travellers.join(", ") : "Tailored on request"
    const countryLabel = itinerary.country || itinerary.destination || "Multiple Destinations"
    const durationLabel = `${itinerary.days.length} Days${itinerary.nights ? ` \u2022 ${itinerary.nights} Nights` : ""}`
    const locationSummary = itinerary.days
      .map((day: any) => day.title)
      .filter(Boolean)
      .slice(0, 5)
      .join(" \u2022 ")
    const tripStartDate =
      itinerary.previewConfig?.withDates && itinerary.previewConfig.startDate
        ? new Date(itinerary.previewConfig.startDate)
        : null
    const eventVisuals: Record<string, { icon: any; accent: string; label: string; soft: string }> = {
      flight: { icon: Plane, accent: "from-sky-500 to-blue-600", label: "Flight", soft: "text-sky-600" },
      hotel: { icon: Hotel, accent: "from-emerald-500 to-green-600", label: "Hotel", soft: "text-emerald-600" },
      activity: { icon: Camera, accent: "from-purple-500 to-pink-500", label: "Activity", soft: "text-purple-600" },
      transfer: { icon: Car, accent: "from-orange-500 to-amber-500", label: "Transfer", soft: "text-orange-500" },
      meal: { icon: UtensilsCrossed, accent: "from-amber-500 to-orange-500", label: "Meal", soft: "text-amber-600" },
      image: { icon: Camera, accent: "from-slate-500 to-slate-600", label: "Gallery", soft: "text-slate-500" },
      photo: { icon: Camera, accent: "from-slate-500 to-slate-600", label: "Photo", soft: "text-slate-500" },
      heading: { icon: Star, accent: "from-slate-500 to-slate-600", label: "Highlight", soft: "text-slate-500" },
      paragraph: { icon: Star, accent: "from-slate-500 to-slate-600", label: "Details", soft: "text-slate-500" },
      list: { icon: Star, accent: "from-slate-500 to-slate-600", label: "List", soft: "text-slate-500" },
      other: { icon: Star, accent: "from-slate-500 to-slate-600", label: "Experience", soft: "text-slate-500" },
    }
    const mealBadges = [
      { key: "breakfast", label: "Breakfast" },
      { key: "lunch", label: "Lunch" },
      { key: "dinner", label: "Dinner" },
    ] as const
    return (
      <div className="space-y-10">
        <section className="rounded-[36px] overflow-hidden bg-white shadow-[0_28px_80px_rgba(15,23,42,0.12)]">
          <div className="relative bg-slate-950">
            <div className="absolute inset-0">
              {collageImages.length > 0 ? (
                <img
                  src={collageImages[0].url}
                  alt={collageImages[0].altText || itinerary.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950" />
              )}
            </div>
            <div className="absolute inset-0 bg-slate-950/70" />
            <div className="relative px-6 py-16 text-center text-white sm:px-12 md:py-20">
              <div className="text-[11px] uppercase tracking-[0.45em] text-white/70">
                Home&nbsp;&nbsp;|&nbsp;&nbsp;Tours&nbsp;&nbsp;|&nbsp;&nbsp;{countryLabel}
              </div>
              <h1 className="mt-6 text-3xl font-black uppercase tracking-[0.12em] drop-shadow-[0_16px_40px_rgba(15,23,42,0.6)] sm:text-5xl md:text-6xl">
                {itinerary.title}
              </h1>
              {itinerary.description && (
                <p className="mx-auto mt-6 max-w-3xl text-base text-white/80 md:text-lg">
                  {itinerary.description}
                </p>
              )}
            </div>
          </div>
          <div className="bg-gradient-to-b from-white via-white to-slate-50 px-6 pb-10 pt-8 sm:px-10">
            <div className="grid gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((index) => {
                const item = collageImages[index]
                if (!item) {
                  const gradient = fallbackGradients[index % fallbackGradients.length]
                  return (
                    <div
                      key={`placeholder-${index}`}
                      className={`aspect-[4/3] w-full overflow-hidden rounded-[26px] bg-gradient-to-br ${gradient} shadow-[0_18px_40px_rgba(15,23,42,0.12)]`}
                    >
                      <div className="flex h-full w-full items-center justify-center text-sm font-semibold uppercase tracking-[0.4em] text-white/70">
                        Image
                      </div>
                    </div>
                  )
                }
                return (
                  <div
                    key={item.id}
                    className="aspect-[4/3] w-full overflow-hidden rounded-[26px] shadow-[0_18px_40px_rgba(15,23,42,0.18)]"
                  >
                    <img src={item.url} alt={item.altText || itinerary.title} className="h-full w-full object-cover" />
                  </div>
                )
              })}
            </div>
          </div>
        </section>
        <section className="rounded-[28px] border border-slate-200 bg-white px-6 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:px-10">
          <div className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-200 pb-6">
            <div className="space-y-3">
              {itinerary.branding?.headerText && (
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                  {itinerary.branding.headerText}
                </p>
              )}
              <div>
                <h2 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
                  {itinerary.title}
                </h2>
                <p className="mt-2 text-sm font-medium uppercase tracking-[0.3em] text-amber-600">
                  {countryLabel}
                </p>
              </div>
              {locationSummary && <p className="max-w-3xl text-sm text-slate-500">{locationSummary}</p>}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-right shadow-inner">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Rooms & Guests</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{guestsLabel}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <Badge className="rounded-full bg-amber-500 px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.2em] text-slate-900 shadow-sm">
              {durationLabel}
            </Badge>
            {tripStartDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-amber-600" />
                <span>
                  Starting {tripStartDate.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-600" />
              <span>{countryLabel}</span>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {highlightItems.map(({ key, label, icon: Icon, active }) => (
              <div
                key={key}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
                  active ? "border-amber-200 bg-amber-50 text-amber-700 shadow-sm" : "border-slate-200 bg-slate-100 text-slate-400"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-amber-600" : "text-slate-400"}`} />
                {label}
              </div>
            ))}
          </div>
        </section>
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                <span className={isDetailedView ? "text-amber-600" : "text-slate-400"}>Detailed</span>
                <div className="h-3 w-px bg-slate-300" />
                <span className={!isDetailedView ? "text-amber-600" : "text-slate-400"}>Summarised</span>
              </div>
              {tripStartDate && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="h-4 w-4 text-amber-600" />
                  <span>
                    {tripStartDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
            {itinerary.days.map((day: any) => {
              const dayDate = getDayDate(day.day)
              const isCollapsed = collapsedDays[day.day]
              return (
                <div
                  key={day.day}
                  className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5">
                    <div className="flex flex-wrap items-center gap-4">
                      <Badge className="rounded-full bg-amber-500 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.25em] text-slate-900 shadow-sm">
                        Day {day.day}
                      </Badge>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                          {day.title || `Day ${day.day}`}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                          {dayDate && (
                            <span className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-amber-600" />
                              {dayDate.toLocaleDateString("en-US", { day: "numeric", month: "short", weekday: "short" })}
                            </span>
                          )}
                          {day.nights ? (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-amber-600" />
                              {day.nights} {day.nights === 1 ? "Night" : "Nights"}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleDayCollapse(day.day)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-amber-200 hover:text-amber-600"
                    >
                      {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </button>
                  </div>
                  {!isCollapsed && (
                    <div className="space-y-6 px-6 py-6">
                      {isDetailedView && day.detailedDescription && (
                        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 px-5 py-4 text-sm leading-relaxed text-amber-900 shadow-inner">
                          {day.detailedDescription}
                        </div>
                      )}
                      {!isDetailedView && day.description && (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-relaxed text-slate-600">
                          {day.description}
                        </div>
                      )}
                      <div className="space-y-5">
                        {day.events.map((event: any, eventIndex: number) => {
                          const visuals = eventVisuals[event.category] || eventVisuals.other
                          const Icon = visuals.icon
                          const eventTime = event.time || event.startTime
                          const hasPrice = showPrices && typeof event.price === "number" && event.price > 0
                          return (
                            <div
                              key={`${day.day}-${eventIndex}`}
                              className="rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="flex flex-1 gap-4">
                                  <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${visuals.accent} text-white shadow-lg`}>
                                    <Icon className="h-6 w-6" />
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-3">
                                      <h4 className="text-lg font-semibold text-slate-900">{event.title}</h4>
                                      <span className={`rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${visuals.soft}`}>
                                        {visuals.label}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                      {showTimings && eventTime && (
                                        <span className="flex items-center gap-2 font-semibold text-emerald-600">
                                          <Clock className="h-4 w-4" />
                                          {eventTime}
                                        </span>
                                      )}
                                      {event.duration && (
                                        <span className="flex items-center gap-2">
                                          <Clock className="h-4 w-4 text-slate-400" />
                                          {event.duration}
                                        </span>
                                      )}
                                      {event.location && (
                                        <span className="flex items-center gap-2">
                                          <MapPin className="h-4 w-4 text-slate-400" />
                                          {event.location}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {hasPrice && (
                                  <div className="text-right">
                                    <p className="text-xs ??? font-semibold uppercase tracking-[0.25em] text-slate-400">Price</p>
                                    <p className="text-lg font-semibold text-slate-900">{formatPrice(event.price)}</p>
                                  </div>
                                )}
                              </div>
                              {event.description && (
                                <p className="mt-4 text-sm leading-relaxed text-slate-600">{event.description}</p>
                              )}
                              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                                {event.category === "flight" && (event.fromCity || event.toCity) && (
                                  <div className="flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sky-700">
                                    <Plane className="h-4 w-4" />
                                    {event.fromCity} &rarr; {event.toCity}
                                  </div>
                                )}
                                {event.category === "hotel" && (event.checkIn || event.checkOut) && (
                                  <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                                    <Hotel className="h-4 w-4" />
                                    {event.checkIn} - {event.checkOut}
                                  </div>
                                )}
                                {event.vehicleType && (
                                  <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700">
                                    <Car className="h-4 w-4" />
                                    {event.vehicleType}
                                  </div>
                                )}
                                {event.mealPlan && (
                                  <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700">
                                    <UtensilsCrossed className="h-4 w-4" />
                                    {event.mealPlan}
                                  </div>
                                )}
                              </div>
                              {isDetailedView && event.highlights && event.highlights.length > 0 && (
                                <div className="mt-4 space-y-2">
                                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Highlights</p>
                                  <div className="flex flex-wrap gap-2">
                                    {event.highlights.map((highlight: string, idx: number) => (
                                      <Badge
                                        key={idx}
                                        variant="secondary"
                                        className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                                      >
                                        {highlight}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {event.category === "image" && event.imageUrl && (
                                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                                  <img
                                    src={event.imageUrl}
                                    alt={event.imageAlt || event.title}
                                    className="h-48 w-full object-cover"
                                  />
                                  {event.imageCaption && (
                                    <p className="bg-slate-50 px-4 py-2 text-xs text-slate-500">{event.imageCaption}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex flex-wrap gap-3 pt-1">
                        {mealBadges.map((meal) => {
                          const available = Boolean(day.meals?.[meal.key])
                          return (
                            <div
                              key={meal.key}
                              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] ${
                                available
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-slate-200 bg-slate-100 text-slate-400"
                              }`}
                            >
                              {available ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                              {meal.label}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <aside className="space-y-6">
            {showPrices && (
              <div className="rounded-[28px] border border-amber-200 bg-gradient-to-b from-amber-50 via-white to-white p-6 shadow-[0_20px_60px_rgba(251,191,36,0.25)]">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.28em] text-amber-600">
                  <span>Limited Offer</span>
                  <Percent className="h-4 w-4" />
                </div>
                <div className="mt-5 space-y-1">
                  <p className="text-3xl font-semibold text-slate-900 sm:text-4xl">{formatPrice(itinerary.totalPrice)}</p>
                  <p className="text-sm text-slate-500">Excluding applicable taxes</p>
                </div>
                <Button className="mt-6 w-full rounded-full bg-amber-500 text-base font-semibold text-slate-900 hover:bg-amber-600">
                  Proceed to Payment
                </Button>
                <Button variant="ghost" className="mt-2 w-full gap-2 rounded-full text-amber-600 hover:bg-amber-50">
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
              </div>
            )}
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <h3 className="text-lg font-semibold text-slate-900">Need Assistance?</h3>
              <p className="mt-1 text-sm text-slate-500">
                Share your details and our travel experts will get in touch with you shortly.
              </p>
              <div className="mt-5 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500" htmlFor="enquiry-name">
                    Full Name
                  </Label>
                  <Input
                    id="enquiry-name"
                    placeholder="John Carter"
                    className="rounded-xl border-slate-200 bg-slate-50 focus:border-amber-400 focus:ring-amber-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500" htmlFor="enquiry-email">
                    Email
                  </Label>
                  <Input
                    id="enquiry-email"
                    type="email"
                    placeholder="you@example.com"
                    className="rounded-xl border-slate-200 bg-slate-50 focus:border-amber-400 focus:ring-amber-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500" htmlFor="enquiry-phone">
                    Phone
                  </Label>
                  <Input
                    id="enquiry-phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="rounded-xl border-slate-200 bg-slate-50 focus:border-amber-400 focus:ring-amber-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500" htmlFor="enquiry-date">
                    Travel Date
                  </Label>
                  <Input
                    id="enquiry-date"
                    type="date"
                    className="rounded-xl border-slate-200 bg-slate-50 focus:border-amber-400 focus:ring-amber-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500" htmlFor="enquiry-count">
                    Travellers
                  </Label>
                  <Input
                    id="enquiry-count"
                    placeholder="Adults & Children"
                    className="rounded-xl border-slate-200 bg-slate-50 focus:border-amber-400 focus:ring-amber-400"
                  />
                </div>
              </div>
              <Button className="mt-6 w-full rounded-full bg-amber-500 text-base font-semibold text-slate-900 hover:bg-amber-600">
                Send Enquiry
              </Button>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <Phone className="h-4 w-4" />
                <span>Prefer to talk? Call our travel desk for bespoke assistance.</span>
              </div>
            </div>
          </aside>
        </section>
        {itinerary.additionalSections && Object.keys(itinerary.additionalSections).length > 0 && (
          <div className="space-y-6">
            {Object.entries(itinerary.additionalSections).map(([key, content]) => (
              <div
                key={key}
                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
              >
                <h3 className="text-xl font-semibold text-slate-900">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </h3>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
                  {content.split("\n").map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {showPrices && (
          <div className="rounded-[28px] border border-amber-200 bg-gradient-to-r from-amber-100 via-white to-amber-50 p-6 shadow-[0_20px_60px_rgba(251,191,36,0.18)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Total Investment</h3>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-amber-600" />
                    {itinerary.days.length} days
                  </span>
                  <span className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-amber-600" />
                    {itinerary.days.reduce((sum: number, current: any) => sum + (current.events?.length || 0), 0)} activities
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-semibold text-slate-900">{formatPrice(itinerary.totalPrice)}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">Best Value Guaranteed</p>
              </div>
            </div>
          </div>
        )}
        {itinerary.branding && (itinerary.branding.footerLogo || itinerary.branding.footerText) && (
          <div className="rounded-[32px] border border-slate-800 bg-slate-900 p-6 text-center text-white shadow-[0_20px_60px_rgba(15,23,42,0.35)]">
            {itinerary.branding.footerLogo && (
              <img
                src={itinerary.branding.footerLogo || "/placeholder.svg"}
                alt="Footer Logo"
                className="mx-auto mb-4 h-12 object-contain"
              />
            )}
            {itinerary.branding.footerText && (
              <p className="text-sm text-white/80">{itinerary.branding.footerText}</p>
            )}
            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-white/50">Crafted for unforgettable journeys</p>
          </div>
        )}
      </div>
    )
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

            <Button variant="outline" onClick={handleEdit} className="hover:bg-gray-50">

              <Edit className="h-4 w-4 mr-2" />

              Edit

            </Button>

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

        {itinerary.previewConfig?.template === 2 ? (
          renderTemplateTwo()
        ) : (

          <>

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

                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 opacity-90"></div>

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

          </>

        )}

      </div>

    </div>

  )

}








