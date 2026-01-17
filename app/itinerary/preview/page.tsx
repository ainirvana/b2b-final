"use client"



import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"

import { Switch } from "@/components/ui/switch"

import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"

import { ArrowLeft, Download, Share2, Edit, Eye, EyeOff, Loader2, MapPin, Calendar, Clock, Users, Star, Plane, Hotel, Camera, DollarSign, Globe, Heart, UtensilsCrossed, ChevronDown, ChevronUp, Car, Percent, ShoppingCart, Phone, Check, X, Shield } from "lucide-react"

import { useRouter } from "next/navigation"

import { useToast } from "@/hooks/use-toast"

import { ImageCollage } from "@/components/image-collage"

import { IGalleryItem } from "@/models/Itinerary"

import { calculateComponentPrice, getExchangeRates, PricingConfig } from "@/lib/pricing-calculator"

import { formatCurrencyWithSymbol } from "@/lib/currency-utils"
import { ItineraryTemplate4 } from "@/components/itinerary-builder/previews/template-4"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"



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

  const [selectedTemplate, setSelectedTemplate] = useState<number>(2)

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
        if (parsedData.previewConfig?.template) {
          setSelectedTemplate(parsedData.previewConfig.template)
        }

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
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <script src="https://cdn.tailwindcss.com"></script>
            <script>
              tailwind.config = {
                theme: {
                  extend: {
                    fontFamily: {
                      sans: ['Inter', 'sans-serif'],
                      serif: ['Playfair Display', 'serif'],
                    },
                    colors: {
                      border: "hsl(var(--border))",
                      input: "hsl(var(--input))",
                      ring: "hsl(var(--ring))",
                      background: "hsl(var(--background))",
                      foreground: "hsl(var(--foreground))",
                    }
                  }
                }
              }
            </script>
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

        text: `Check out this ${itinerary?.days?.length} -day travel itinerary: ${itinerary?.description} `,

        url: window.location.href,

      }



      if (navigator.share && navigator.canShare(shareData)) {

        await navigator.share(shareData)

        toast({

          title: "Shared Successfully",

          description: "Itinerary shared successfully!",

        })

      } else {

        const shareText = `${shareData.title} \n${shareData.text} \n${shareData.url} `

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
      router.push(`/ itinerary / builder ? id = ${idString}& mode=edit & type=${type} `)
    } else {
      router.push(`/ itinerary / builder ? mode = edit & type=${type} `)
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
      count > 0 ? `${count} ${count === 1 ? singular : plural} ` : plural
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
      travellers.push(`${itinerary.previewConfig.adults} Adult${itinerary.previewConfig.adults > 1 ? "s" : ""} `)
    }
    if (itinerary.previewConfig?.children) {
      travellers.push(`${itinerary.previewConfig.children} Child${itinerary.previewConfig.children > 1 ? "ren" : ""} `)
    }
    const guestsLabel = travellers.length > 0 ? travellers.join(", ") : "Tailored on request"
    const countryLabel = itinerary.country || itinerary.destination || "Multiple Destinations"
    const durationLabel = `${itinerary.days.length} Days${itinerary.nights ? ` \u2022 ${itinerary.nights} Nights` : ""} `
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

    // Get pricing config from itinerary.previewConfig and pricing settings (same as Template 3)
    const { rates: exchangeRates, baseCurrency } = getExchangeRates()
    const targetCurrency = baseCurrency || "INR"
    const pricingConfig: PricingConfig = {
      adults: itinerary.previewConfig?.adults || 2,
      children: itinerary.previewConfig?.children || 0,
      targetCurrency: targetCurrency,
      exchangeRates: exchangeRates,
      baseCurrency: baseCurrency,
    }

    // Calculate total price with currency conversion
    let calculatedTotalPrice = 0
    itinerary.days.forEach((day: any) => {
      day.events?.forEach((event: any) => {
        if (event.price && event.price > 0) {
          const priceResult = calculateComponentPrice(event, pricingConfig)
          if (priceResult) {
            calculatedTotalPrice += priceResult.calculatedPrice
          }
        }
      })
    })

    // Format total price with target currency
    const displayTotalPrice = formatCurrencyWithSymbol(calculatedTotalPrice, targetCurrency)

    // Helper to format event price with currency conversion
    const formatEventPrice = (event: any) => {
      if (event.price && event.price > 0) {
        const priceResult = calculateComponentPrice(event, pricingConfig)
        if (priceResult) {
          return priceResult.displayPrice
        }
      }
      return formatCurrencyWithSymbol(event.price || 0, targetCurrency)
    }

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
                      key={`placeholder - ${index} `}
                      className={`aspect - [4 / 3] w - full overflow - hidden rounded - [26px] bg - gradient - to - br ${gradient} shadow - [0_18px_40px_rgba(15, 23, 42, 0.12)]`}
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
                className={`flex items - center gap - 2 rounded - full border px - 4 py - 2 text - sm font - semibold ${active ? "border-amber-200 bg-amber-50 text-amber-700 shadow-sm" : "border-slate-200 bg-slate-100 text-slate-400"
                  } `}
              >
                <Icon className={`h - 4 w - 4 ${active ? "text-amber-600" : "text-slate-400"} `} />
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
                          {day.title || `Day ${day.day} `}
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
                              key={`${day.day} -${eventIndex} `}
                              className="rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="flex flex-1 gap-4">
                                  <div className={`flex h - 14 w - 14 flex - shrink - 0 items - center justify - center rounded - 2xl bg - gradient - to - br ${visuals.accent} text - white shadow - lg`}>
                                    <Icon className="h-6 w-6" />
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-3">
                                      <h4 className="text-lg font-semibold text-slate-900">{event.title}</h4>
                                      <span className={`rounded - full bg - slate - 100 px - 2.5 py - 1 text - xs font - semibold uppercase tracking - [0.18em] ${visuals.soft} `}>
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
                                    <p className="text-lg font-semibold text-slate-900">{formatEventPrice(event)}</p>
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
                              className={`flex items - center gap - 2 rounded - full border px - 3 py - 1.5 text - xs font - semibold uppercase tracking - [0.2em] ${available
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-slate-200 bg-slate-100 text-slate-400"
                                } `}
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
                  <p className="text-3xl font-semibold text-slate-900 sm:text-4xl">{displayTotalPrice}</p>
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
                <p className="text-3xl font-semibold text-slate-900">{displayTotalPrice}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">Best Value Guaranteed</p>
              </div>
            </div>
          </div>
        )}
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

  // ===============================================
  // TEMPLATE 3: LUXURY BROCHURE
  // ===============================================
  const renderTemplateThree = () => {
    if (!itinerary) return null

    const galleryImages = (itinerary.gallery ?? []).filter((g) => g.type === "image")
    const heroImage = galleryImages[0]?.url
    const tripStartDate = itinerary.previewConfig?.withDates && itinerary.previewConfig.startDate
      ? new Date(itinerary.previewConfig.startDate)
      : null
    const tripEndDate = tripStartDate
      ? new Date(tripStartDate.getTime() + (itinerary.days.length - 1) * 24 * 60 * 60 * 1000)
      : null

    // Guest and Agency details from itinerary
    const guestDetails = (itinerary as any).guestDetails
    const agencyDetails = (itinerary as any).agencyDetails
    const overviewEvents = (itinerary as any).overviewEvents || []

    // Category icons and colors
    const categoryConfig: Record<string, { icon: any; color: string; bg: string; border: string; label: string }> = {
      flight: { icon: Plane, color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200", label: "Flight" },
      hotel: { icon: Hotel, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "Hotel" },
      activity: { icon: Camera, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", label: "Activity" },
      transfer: { icon: Car, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", label: "Transfer" },
      meal: { icon: UtensilsCrossed, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "Meal" },
      ancillaries: { icon: Globe, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", label: "Ancillary" },
      cruise: { icon: Globe, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200", label: "Cruise" },
      note: { icon: Star, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", label: "Note" },
      image: { icon: Camera, color: "text-pink-600", bg: "bg-pink-50", border: "border-pink-200", label: "Image" },
      photo: { icon: Camera, color: "text-pink-600", bg: "bg-pink-50", border: "border-pink-200", label: "Photo" },
      other: { icon: Star, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", label: "Other" },
      others: { icon: Star, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", label: "Other" },
      heading: { icon: Star, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", label: "Heading" },
      paragraph: { icon: Star, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", label: "Info" },
      list: { icon: Star, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", label: "List" },
    }

    // Ancillary subcategory labels and icons
    const ancillarySubcategoryConfig: Record<string, { label: string; icon: any }> = {
      "visa": { label: "Visa", icon: Globe },
      "forex": { label: "Forex", icon: DollarSign },
      "travel-insurance": { label: "Travel Insurance", icon: Shield },
    }

    // Get pricing config from itinerary.previewConfig and pricing settings
    const { rates: exchangeRates, baseCurrency } = getExchangeRates()
    const targetCurrency = baseCurrency || "INR"
    const pricingConfig: PricingConfig = {
      adults: itinerary.previewConfig?.adults || 2,
      children: itinerary.previewConfig?.children || 0,
      targetCurrency: targetCurrency,
      exchangeRates: exchangeRates,
      baseCurrency: baseCurrency,
    }

    // Calculate pricing breakdown using pricing calculator
    const pricingBreakdown: { category: string; items: { title: string; price: number; displayPrice: string }[] }[] = []
    const categoryTotals: Record<string, number> = {}
    let calculatedTotalPrice = 0

    itinerary.days.forEach((day: any) => {
      day.events?.forEach((event: any) => {
        if (event.price && event.price > 0) {
          const priceResult = calculateComponentPrice(event, pricingConfig)
          if (priceResult) {
            const cat = event.category || "other"
            if (!categoryTotals[cat]) categoryTotals[cat] = 0
            categoryTotals[cat] += priceResult.calculatedPrice
            calculatedTotalPrice += priceResult.calculatedPrice
          }
        }
      })
    })

    // Format total price with target currency
    const displayTotalPrice = formatCurrencyWithSymbol(calculatedTotalPrice, targetCurrency)

    // Format currency helper (for legacy/fallback use)
    const formatCurrency = (amount: number, currency?: string) => {
      return formatCurrencyWithSymbol(amount, currency || targetCurrency)
    }

    // Render individual event card based on category
    const renderEventCard = (event: any, eventIndex: number) => {
      // Handle ancillaries specially - use subcategory for label and icon
      let config = categoryConfig[event.category] || categoryConfig.note
      let displayLabel = config.label
      let DisplayIcon = config.icon

      // For ancillaries, use subcategory as the main label
      if (event.category === "ancillaries") {
        // Try to get subCategory from event, or detect from event data
        let detectedSubCategory = event.subCategory

        // Fallback detection based on event data fields
        if (!detectedSubCategory) {
          if (event.visaType || event.country || event.entryMethod || event.visaDuration) {
            detectedSubCategory = "visa"
          } else if (event.forexCurrency || event.baseCurrency || event.amount) {
            detectedSubCategory = "forex"
          } else if (event.insuranceType || event.destinations || event.sumInsured || event.noOfTravellers) {
            detectedSubCategory = "travel-insurance"
          }
        }

        if (detectedSubCategory) {
          const subcatConfig = ancillarySubcategoryConfig[detectedSubCategory]
          if (subcatConfig) {
            displayLabel = subcatConfig.label
            DisplayIcon = subcatConfig.icon
          } else {
            // Handle other possible subcategory values - normalize to display name
            displayLabel = detectedSubCategory.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
          }
        }
      }

      // Calculate price using pricing calculator (based on passengers and currency)
      const priceResult = showPrices && event.price > 0
        ? calculateComponentPrice(event, pricingConfig)
        : null

      return (
        <div key={eventIndex} className={`rounded - 2xl border ${config.border} ${config.bg} p - 5 shadow - sm hover: shadow - md transition - shadow`}>
          {/* Event Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className={`p - 2.5 rounded - xl bg - white shadow - sm ${config.color} `}>
                <DisplayIcon className="h-5 w-5" />
              </div>
              <div>
                <span className={`text - xs font - bold uppercase tracking - wider ${config.color} `}>{displayLabel}</span>
                <h4 className="text-lg font-bold text-slate-900">{event.title || displayLabel}</h4>
              </div>
            </div>
            {priceResult && (
              <div className="text-right">
                <span className="text-xs text-slate-500 uppercase tracking-wide">Total Price</span>
                <p className="text-lg font-bold text-emerald-600">{priceResult.displayPrice}</p>
                {priceResult.breakdown && (
                  <p className="text-xs text-slate-400">{priceResult.breakdown}</p>
                )}
              </div>
            )}
          </div>

          {/* FLIGHT SPECIFIC */}
          {event.category === "flight" && (
            <div className="space-y-3">
              {/* Route */}
              <div className="flex items-center gap-4 py-3 px-4 bg-white rounded-xl">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">{event.fromCity || "—"}</p>
                  <p className="text-xs text-slate-500 uppercase">From</p>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <p className="text-xs text-slate-500 mb-1">{event.numberOfStops === 0 ? "Non-stop" : event.numberOfStops ? `${event.numberOfStops} stop(s)` : event.stops || ""}</p>
                  <div className="w-full flex items-center">
                    <div className="flex-1 h-px bg-sky-300"></div>
                    <Plane className="h-4 w-4 text-sky-500 mx-2 -rotate-45" />
                    <div className="flex-1 h-px bg-sky-300"></div>
                  </div>
                  <p className="text-sm font-semibold text-sky-600 mt-1">{event.duration || ""}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">{event.toCity || "—"}</p>
                  <p className="text-xs text-slate-500 uppercase">To</p>
                </div>
              </div>
              {/* Times */}
              {showTimings && (event.startTime || event.endTime) && (
                <div className="flex justify-between text-sm px-4">
                  <span className="text-slate-600"><Clock className="h-3.5 w-3.5 inline mr-1" />Dep: <strong>{event.startTime || event.time || "—"}</strong></span>
                  <span className="text-slate-600">Arr: <strong>{event.endTime || "—"}</strong></span>
                </div>
              )}
              {/* Airline & Flight Details */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                {event.airlines && <div className="px-3 py-2 bg-white rounded-lg"><span className="text-slate-500">Airline:</span> <strong>{event.airlines}</strong></div>}
                {event.flightNumber && <div className="px-3 py-2 bg-white rounded-lg"><span className="text-slate-500">Flight:</span> <strong>{event.flightNumber}</strong></div>}
                {event.flightClass && <div className="px-3 py-2 bg-white rounded-lg"><span className="text-slate-500">Class:</span> <strong>{event.flightClass}</strong></div>}
                {event.pnr && <div className="px-3 py-2 bg-white rounded-lg"><span className="text-slate-500">PNR:</span> <strong className="font-mono">{event.pnr}</strong></div>}
                {event.seatNumber && <div className="px-3 py-2 bg-white rounded-lg"><span className="text-slate-500">Seat:</span> <strong>{event.seatNumber}</strong></div>}
                {event.bookingId && <div className="px-3 py-2 bg-white rounded-lg"><span className="text-slate-500">Booking ID:</span> <strong>{event.bookingId}</strong></div>}
              </div>
              {/* Baggage */}
              {(event.checkinBags || event.cabinBags || event.baggage) && (
                <div className="px-3 py-2 bg-white rounded-lg text-sm">
                  <span className="text-slate-500">Baggage:</span>{" "}
                  <strong>
                    {event.checkinBags ? `${event.checkinBags}× Check -in (${event.checkinBagWeight || ""})` : ""}
                    {event.checkinBags && event.cabinBags ? " + " : ""}
                    {event.cabinBags ? `${event.cabinBags}× Cabin(${event.cabinBagWeight || ""})` : ""}
                    {!event.checkinBags && !event.cabinBags && event.baggage ? event.baggage : ""}
                  </strong>
                </div>
              )}
              {event.inFlightMeals && <div className="px-3 py-2 bg-white rounded-lg text-sm"><span className="text-slate-500">In-flight Meal:</span> <strong>{event.inFlightMeals}</strong></div>}
              {event.refundable && <div className="px-3 py-2 bg-green-50 rounded-lg text-sm text-green-700"><Shield className="h-3.5 w-3.5 inline mr-1" />{event.refundable}</div>}
            </div>
          )}

          {/* HOTEL SPECIFIC */}
          {event.category === "hotel" && (
            <div className="space-y-3">
              {/* Rating & Nights */}
              <div className="flex items-center gap-2 flex-wrap">
                {event.hotelRating && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-full text-yellow-700 text-sm font-semibold">
                    <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />{event.hotelRating} Star
                  </span>
                )}
                {event.nights && <span className="px-2 py-1 bg-emerald-100 rounded-full text-emerald-700 text-sm font-semibold">{event.nights} Night(s)</span>}
                {event.hotelNightIndex && event.hotelTotalNights && (
                  <span className="px-2 py-1 bg-blue-100 rounded-full text-blue-700 text-sm font-semibold">
                    Night {event.hotelNightIndex}/{event.hotelTotalNights}
                  </span>
                )}
              </div>
              {/* Location & Address */}
              {event.location && <div className="flex items-center gap-1 text-sm text-slate-600"><MapPin className="h-4 w-4" />{event.location}</div>}
              {event.address && <p className="text-sm text-slate-500 ml-5">{event.address}</p>}
              {/* Room & Occupancy */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                {event.roomCategory && <div className="px-3 py-2 bg-white rounded-lg"><span className="text-slate-500">Room:</span> <strong>{event.roomCategory}</strong></div>}
                {event.propertyType && <div className="px-3 py-2 bg-white rounded-lg"><span className="text-slate-500">Type:</span> <strong>{event.propertyType}</strong></div>}
                {(event.adults || event.children) && (
                  <div className="px-3 py-2 bg-white rounded-lg">
                    <span className="text-slate-500">Guests:</span> <strong>{event.adults && `${event.adults} A`}{event.adults && event.children ? " + " : ""}{event.children && `${event.children} C`}</strong>
                  </div>
                )}
                {event.mealPlan && <div className="px-3 py-2 bg-amber-50 rounded-lg text-amber-700"><UtensilsCrossed className="h-3.5 w-3.5 inline mr-1" /><strong>{event.mealPlan}</strong></div>}
                {event.confirmationNumber && <div className="px-3 py-2 bg-white rounded-lg"><span className="text-slate-500">Confirmation:</span> <strong className="font-mono">{event.confirmationNumber}</strong></div>}
              </div>
              {/* Check-in/out times */}
              {showTimings && (event.checkIn || event.checkOut) && (
                <div className="flex gap-4 text-sm px-3 py-2 bg-white rounded-lg">
                  <span><Clock className="h-3.5 w-3.5 inline mr-1 text-slate-400" />Check-in: <strong>{event.checkIn || "14:00"}</strong></span>
                  <span>Check-out: <strong>{event.checkOut || "11:00"}</strong></span>
                </div>
              )}
              {/* Amenities */}
              {event.amenities && event.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {event.amenities.map((amenity: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-white rounded-full text-xs text-slate-600 border border-slate-200">{amenity}</span>
                  ))}
                </div>
              )}
              {event.hotelLink && (
                <a href={event.hotelLink} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-600 hover:underline">View Hotel →</a>
              )}
            </div>
          )}

          {/* ACTIVITY SPECIFIC */}
          {event.category === "activity" && (
            <div className="space-y-3">
              {event.subtitle && <p className="text-sm italic text-slate-600">{event.subtitle}</p>}
              {event.location && <div className="flex items-center gap-1 text-sm text-slate-600"><MapPin className="h-4 w-4" />{event.location}</div>}
              <div className="flex flex-wrap gap-2 text-sm">
                {event.duration && <span className="px-3 py-1 bg-white rounded-full border border-slate-200"><Clock className="h-3.5 w-3.5 inline mr-1" />{event.duration}</span>}
                {event.difficulty && <span className={`px - 3 py - 1 rounded - full font - medium ${event.difficulty === "easy" ? "bg-green-100 text-green-700" : event.difficulty === "moderate" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"} `}>{event.difficulty}</span>}
                {event.capacity && <span className="px-3 py-1 bg-white rounded-full border border-slate-200"><Users className="h-3.5 w-3.5 inline mr-1" />Max {event.capacity}</span>}
              </div>
              {event.highlights && event.highlights.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {event.highlights.map((h: string, idx: number) => (
                    <span key={idx} className="inline-flex items-center px-2 py-1 bg-purple-100 rounded-full text-xs text-purple-700"><Star className="h-3 w-3 mr-1" />{h}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TRANSFER SPECIFIC */}
          {event.category === "transfer" && (
            <div className="space-y-3">
              {event.transferCategory && (
                <span className="inline-block px-2 py-1 bg-orange-100 rounded-full text-orange-700 text-xs font-semibold uppercase">{event.transferCategory}</span>
              )}
              {/* Route */}
              {(event.fromLocation || event.toLocation) && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-semibold">{event.fromLocation || "Pickup"}</span>
                  <span className="text-orange-500">→</span>
                  <span className="font-semibold">{event.toLocation || "Drop"}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 text-sm">
                {event.vehicleType && <div className="px-3 py-2 bg-white rounded-lg"><span className="text-slate-500">Vehicle:</span> <strong>{event.vehicleType}</strong></div>}
                {event.carModel && <div className="px-3 py-2 bg-white rounded-lg"><span className="text-slate-500">Model:</span> <strong>{event.carModel}</strong></div>}
                {event.transferType && <div className="px-3 py-2 bg-white rounded-lg"><span className="text-slate-500">Type:</span> <strong className="capitalize">{event.transferType}</strong></div>}
                {event.duration && <div className="px-3 py-2 bg-white rounded-lg"><Clock className="h-3.5 w-3.5 inline mr-1" /><strong>{event.duration}</strong></div>}
                {event.noOfHours && <div className="px-3 py-2 bg-white rounded-lg"><span className="text-slate-500">Hours:</span> <strong>{event.noOfHours}</strong></div>}
                {event.noOfDays && <div className="px-3 py-2 bg-white rounded-lg"><span className="text-slate-500">Days:</span> <strong>{event.noOfDays}</strong></div>}
              </div>
              {showTimings && (event.pickupTime || event.dropTime) && (
                <div className="flex gap-4 text-sm">
                  {event.pickupTime && <span><Clock className="h-3.5 w-3.5 inline mr-1" />Pickup: <strong>{event.pickupTime}</strong></span>}
                  {event.dropTime && <span>Drop: <strong>{event.dropTime}</strong></span>}
                </div>
              )}
              {event.stopsList && event.stopsList.length > 0 && (
                <div className="text-sm"><span className="text-slate-500">Stops:</span> {event.stopsList.join(", ")}</div>
              )}
            </div>
          )}

          {/* MEAL SPECIFIC */}
          {event.category === "meal" && (
            <div className="space-y-3">
              {event.meals && event.meals.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {event.meals.map((m: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-amber-100 rounded-full text-amber-700 text-sm font-medium capitalize">{m}</span>
                  ))}
                </div>
              )}
              {event.location && <div className="flex items-center gap-1 text-sm text-slate-600"><MapPin className="h-4 w-4" />{event.location}</div>}
              {showTimings && event.time && <div className="text-sm"><Clock className="h-3.5 w-3.5 inline mr-1" />{event.time}</div>}
              {event.customMealDescription && <p className="text-sm text-slate-600 italic">{event.customMealDescription}</p>}
            </div>
          )}

          {/* ANCILLARIES SPECIFIC */}
          {event.category === "ancillaries" && (
            <div className="space-y-3">
              {event.subCategory && <span className="inline-block px-2 py-1 bg-indigo-100 rounded-full text-indigo-700 text-xs font-semibold uppercase">{event.subCategory}</span>}
              {/* Visa */}
              {event.subCategory === "visa" && (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {event.country && <div className="px-3 py-2 bg-white rounded-lg"><span className="text-slate-500">Country:</span> <strong>{event.country}</strong></div>}
                  {event.visaType && <div className="px-3 py-2 bg-white rounded-lg"><span className="text-slate-500">Type:</span> <strong>{event.visaType}</strong></div>}
                  {event.visaDuration && <div className="px-3 py-2 bg-white rounded-lg"><span className="text-slate-500">Duration:</span> <strong>{event.visaDuration}</strong></div>}
                  {event.entryMethod && <div className="px-3 py-2 bg-white rounded-lg"><span className="text-slate-500">Entry:</span> <strong>{event.entryMethod}</strong></div>}
                </div>
              )}
              {/* Forex */}
              {event.subCategory === "forex" && (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {event.forexCurrency && <div className="px-3 py-2 bg-white rounded-lg"><span className="text-slate-500">Currency:</span> <strong>{event.forexCurrency}</strong></div>}
                  {event.baseCurrency && <div className="px-3 py-2 bg-white rounded-lg"><span className="text-slate-500">Base:</span> <strong>{event.baseCurrency}</strong></div>}
                  {event.amount && <div className="px-3 py-2 bg-white rounded-lg"><span className="text-slate-500">Amount:</span> <strong>{event.amount}</strong></div>}
                </div>
              )}
              {/* Insurance */}
              {event.subCategory === "travel-insurance" && (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {event.destinations && <div className="px-3 py-2 bg-white rounded-lg col-span-2"><span className="text-slate-500">Destinations:</span> <strong>{event.destinations.join(", ")}</strong></div>}
                  {event.noOfTravellers && <div className="px-3 py-2 bg-white rounded-lg"><span className="text-slate-500">Travellers:</span> <strong>{event.noOfTravellers}</strong></div>}
                  {event.insuranceType && <div className="px-3 py-2 bg-white rounded-lg"><span className="text-slate-500">Type:</span> <strong>{event.insuranceType}</strong></div>}
                  {event.sumInsured && <div className="px-3 py-2 bg-white rounded-lg"><span className="text-slate-500">Sum Insured:</span> <strong>{formatCurrency(event.sumInsured, event.currency)}</strong></div>}
                </div>
              )}
            </div>
          )}

          {/* CRUISE SPECIFIC */}
          {event.category === "cruise" && (
            <div className="space-y-3">
              {event.location && <div className="flex items-center gap-1 text-sm text-slate-600"><MapPin className="h-4 w-4" />{event.location}</div>}
              {showTimings && event.time && <div className="text-sm"><Clock className="h-3.5 w-3.5 inline mr-1" />{event.time}</div>}
              {event.highlights && event.highlights.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {event.highlights.map((h: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-cyan-100 rounded-full text-xs text-cyan-700">{h}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NOTE SPECIFIC */}
          {event.category === "note" && (
            <div className="space-y-2">
              {event.description && (
                <div className="p-4 bg-yellow-100 rounded-xl border-l-4 border-yellow-500 text-yellow-900">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{event.description}</p>
                </div>
              )}
            </div>
          )}

          {/* HEADING SPECIFIC */}
          {event.category === "heading" && (
            <div className="space-y-2">
              {event.description && (
                <p className="text-lg font-semibold text-slate-800">{event.description}</p>
              )}
            </div>
          )}

          {/* PARAGRAPH SPECIFIC */}
          {event.category === "paragraph" && (
            <div className="space-y-2">
              {event.description && (
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
              )}
            </div>
          )}

          {/* LIST SPECIFIC */}
          {event.category === "list" && (
            <div className="space-y-2">
              {event.listItems && event.listItems.length > 0 && (
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                  {event.listItems.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
              {event.description && !event.listItems?.length && (
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
              )}
            </div>
          )}

          {/* OTHER/OTHERS SPECIFIC */}
          {(event.category === "other" || event.category === "others") && (
            <div className="space-y-3">
              {event.subCategory && (
                <span className="inline-block px-3 py-1 bg-slate-200 rounded-full text-slate-700 text-xs font-semibold uppercase">{event.subCategory}</span>
              )}
              {event.location && <div className="flex items-center gap-1 text-sm text-slate-600"><MapPin className="h-4 w-4" />{event.location}</div>}
              {showTimings && event.time && <div className="text-sm"><Clock className="h-3.5 w-3.5 inline mr-1" />{event.time}</div>}
              {event.duration && <div className="text-sm"><Clock className="h-3.5 w-3.5 inline mr-1" />Duration: {event.duration}</div>}
              {event.serviceCharge && showPrices && (
                <div className="text-sm font-semibold">Service Charge: {formatCurrency(event.serviceCharge, event.currency)}</div>
              )}
              {/* Travel Gears */}
              {event.travelGears && event.travelGears.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Travel Gears</p>
                  <div className="grid grid-cols-2 gap-2">
                    {event.travelGears.map((gear: any, idx: number) => (
                      <div key={idx} className="px-3 py-2 bg-white rounded-lg border border-slate-200">
                        <p className="font-medium text-slate-800">{gear.name}</p>
                        {gear.description && <p className="text-xs text-slate-500">{gear.description}</p>}
                        {gear.price && showPrices && <p className="text-sm font-semibold text-emerald-600">{formatCurrency(Number(gear.price), gear.currency || event.currency)}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Common: Description - Only for categories without their own description rendering */}
          {!["note", "heading", "paragraph", "list"].includes(event.category) && event.description && event.description.trim() && (
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">{event.description}</p>
          )}

          {/* Common: Additional Info Sections */}
          {event.additionalInfoSections && event.additionalInfoSections.length > 0 && (
            <div className="mt-3 space-y-2">
              {event.additionalInfoSections.map((section: any, idx: number) => (
                <div key={idx} className="p-3 bg-white rounded-lg border-l-4 border-emerald-400">
                  <h5 className="text-sm font-semibold text-slate-800">{section.heading}</h5>
                  <p className="text-sm text-slate-600 mt-1">{section.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Common: Images */}
          {event.images && event.images.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {event.images.slice(0, 4).map((img: string, idx: number) => (
                <img key={idx} src={img} alt="" className="w-full h-16 object-cover rounded-lg" />
              ))}
            </div>
          )}

          {/* Image Event */}
          {event.category === "image" && event.imageUrl && (
            <div className="mt-3">
              <img src={event.imageUrl} alt={event.imageAlt || ""} className="w-full h-48 object-cover rounded-xl" />
              {event.imageCaption && <p className="text-xs text-slate-500 mt-2 text-center">{event.imageCaption}</p>}
            </div>
          )}

          {/* Photo Event (same as Image) */}
          {event.category === "photo" && event.imageUrl && (
            <div className="mt-3">
              <img src={event.imageUrl} alt={event.imageAlt || ""} className="w-full h-48 object-cover rounded-xl" />
              {event.imageCaption && <p className="text-xs text-slate-500 mt-2 text-center">{event.imageCaption}</p>}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-8 font-sans">
        {/* ========== HEADER: Agency & Guest Details ========== */}
        <section className="rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white shadow-2xl">
          <div className="p-8 md:p-10">
            {/* Agency Row */}
            {agencyDetails && (agencyDetails.name || agencyDetails.logo) && (
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/20 mb-6">
                <div className="flex items-center gap-4">
                  {agencyDetails.logo && (
                    <img src={agencyDetails.logo} alt={agencyDetails.name || "Agency"} className="h-14 w-auto object-contain bg-white rounded-lg p-2" />
                  )}
                  <div>
                    <h2 className="text-xl font-bold">{agencyDetails.name || "Travel Agency"}</h2>
                    {agencyDetails.address && <p className="text-sm text-white/70">{agencyDetails.address}</p>}
                  </div>
                </div>
                <div className="text-right text-sm text-white/80 space-y-0.5">
                  {agencyDetails.phone && <p>📞 {agencyDetails.phone}</p>}
                  {agencyDetails.email && <p>✉️ {agencyDetails.email}</p>}
                  {agencyDetails.gst && <p className="text-xs text-white/60">GST: {agencyDetails.gst}</p>}
                </div>
              </div>
            )}

            {/* Guest Row */}
            {guestDetails && guestDetails.name && (
              <div className="bg-white/10 rounded-2xl p-4 mb-6 backdrop-blur-sm">
                <p className="text-xs text-emerald-300 uppercase tracking-wider font-semibold mb-2">Prepared For</p>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold">{guestDetails.name}</h3>
                    {guestDetails.leadReferenceCode && <p className="text-sm text-white/70">Ref: {guestDetails.leadReferenceCode}</p>}
                  </div>
                  <div className="text-right text-sm text-white/80">
                    {guestDetails.email && <p>✉️ {guestDetails.email}</p>}
                    {guestDetails.mobile && <p>📱 {guestDetails.mobile}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Title & Trip Info */}
            <div className="text-center">
              <p className="text-sm text-emerald-300 uppercase tracking-[0.3em] mb-2">{itinerary.country || "Travel Itinerary"}</p>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">{itinerary.title}</h1>
              {itinerary.description && <p className="text-lg text-white/80 max-w-3xl mx-auto">{itinerary.description}</p>}

              {/* Trip Stats */}
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <Calendar className="h-4 w-4 text-emerald-300" />
                  <span className="font-semibold">{itinerary.days.length} Days • {itinerary.nights || Math.max(0, itinerary.days.length - 1)} Nights</span>
                </div>
                {itinerary.previewConfig && (
                  <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                    <Users className="h-4 w-4 text-emerald-300" />
                    <span>{itinerary.previewConfig.adults} Adults{itinerary.previewConfig.children > 0 ? ` • ${itinerary.previewConfig.children} Children` : ""}</span>
                  </div>
                )}
                {tripStartDate && (
                  <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                    <Calendar className="h-4 w-4 text-emerald-300" />
                    <span>{tripStartDate.toLocaleDateString("en-US", { day: "numeric", month: "short" })} - {tripEndDate?.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                )}
                {showPrices && (
                  <div className="flex items-center gap-2 bg-emerald-500 rounded-full px-5 py-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-bold text-lg">{displayTotalPrice}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hero Image */}
          {heroImage && (
            <div className="relative h-64 md:h-80">
              <img src={heroImage} alt={itinerary.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 to-transparent" />
            </div>
          )}
        </section>

        {/* ========== OVERVIEW SECTION ========== */}
        {(itinerary.description || (overviewEvents && overviewEvents.length > 0)) && (
          <section className="rounded-3xl bg-gradient-to-r from-slate-50 to-emerald-50 border border-emerald-100 p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span className="p-2 bg-emerald-100 rounded-xl text-emerald-600"><Globe className="h-5 w-5" /></span>
              Overview
            </h2>
            <div className="space-y-4">
              {/* Main Itinerary Overview/Description */}
              {itinerary.description && (
                <div className="p-5 bg-white rounded-xl border border-emerald-200">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{itinerary.description}</p>
                </div>
              )}
              {/* Additional Overview Events */}
              {overviewEvents && overviewEvents.length > 0 && overviewEvents.map((event: any, idx: number) => (
                <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200">
                  {event.title && <h4 className="font-semibold text-slate-900 mb-1">{event.title}</h4>}
                  {event.description && <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{event.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========== DAY BY DAY ITINERARY ========== */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <span className="p-2 bg-emerald-100 rounded-xl text-emerald-600"><Calendar className="h-5 w-5" /></span>
            Day-by-Day Itinerary
          </h2>

          {itinerary.days.map((day: any) => {
            const dayDate = getDayDate(day.day)
            return (
              <div key={day.day} className="rounded-3xl bg-white border border-slate-200 shadow-lg overflow-hidden">
                {/* Day Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-black">{day.day}</span>
                    <div>
                      <h3 className="text-xl font-bold">{day.title || `Day ${day.day} `}</h3>
                      {dayDate && (
                        <p className="text-sm text-emerald-100">
                          {dayDate.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      )}
                    </div>
                  </div>
                  {day.nights && (
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">{day.nights} Night{day.nights > 1 ? "s" : ""}</span>
                  )}
                </div>

                {/* Day Content */}
                <div className="p-6 space-y-4">
                  {/* Day Description */}
                  {isDetailedView && day.detailedDescription && (
                    <div className="p-4 bg-emerald-50 rounded-xl border-l-4 border-emerald-400 text-sm text-emerald-900">
                      {day.detailedDescription}
                    </div>
                  )}
                  {!isDetailedView && day.description && (
                    <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-700">
                      {day.description}
                    </div>
                  )}

                  {/* Events */}
                  <div className="space-y-4">
                    {day.events?.map((event: any, eventIndex: number) => renderEventCard(event, eventIndex))}
                  </div>
                </div>
              </div>
            )
          })}
        </section>

        {/* ========== ADDITIONAL SECTIONS ========== */}
        {itinerary.additionalSections && Object.keys(itinerary.additionalSections).length > 0 && (
          <section className="rounded-3xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span className="p-2 bg-slate-200 rounded-xl text-slate-600"><Star className="h-5 w-5" /></span>
              Additional Information
            </h2>
            <div className="space-y-4">
              {Object.entries(itinerary.additionalSections).map(([key, content]) => (
                <div key={key} className="p-4 bg-white rounded-xl border border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-2">{key.replace(/([A-Z])/g, " $1").trim()}</h4>
                  <div className="text-sm text-slate-600 space-y-2">
                    {(content as string).split("\n").map((p, idx) => <p key={idx}>{p}</p>)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========== PRICING BREAKDOWN ========== */}
        {showPrices && (
          <section className="rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-amber-50 border border-emerald-200 p-6 md:p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span className="p-2 bg-emerald-100 rounded-xl text-emerald-600"><DollarSign className="h-5 w-5" /></span>
              Package Cost Breakdown
            </h2>

            {/* Category Totals */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Object.entries(categoryTotals).map(([cat, total]) => {
                const catConfig = categoryConfig[cat] || categoryConfig.note
                return (
                  <div key={cat} className={`p - 4 rounded - xl ${catConfig.bg} border ${catConfig.border} `}>
                    <p className={`text - xs font - semibold uppercase tracking - wider ${catConfig.color} `}>{catConfig.label}s</p>
                    <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrencyWithSymbol(total, targetCurrency)}</p>
                  </div>
                )
              })}
            </div>

            {/* Total */}
            <div className="p-6 bg-emerald-600 rounded-2xl text-white flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-emerald-200 uppercase tracking-wider">Total Package Cost</p>
                <p className="text-xs text-emerald-100 mt-1">Excluding applicable taxes</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black">{displayTotalPrice}</p>
                <p className="text-sm text-emerald-200">
                  for {pricingConfig.adults} adult{pricingConfig.adults > 1 ? "s" : ""}{pricingConfig.children > 0 ? ` + ${pricingConfig.children} child${pricingConfig.children > 1 ? "ren" : ""} ` : ""}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ========== FOOTER ========== */}
        <section className="rounded-3xl bg-slate-900 text-white p-6 md:p-8 text-center">
          {agencyDetails?.logo && (
            <img src={agencyDetails.logo} alt={agencyDetails.name || ""} className="h-12 mx-auto mb-4 object-contain" />
          )}
          {itinerary.branding?.footerText && (
            <p className="text-sm text-white/80 mb-4">{itinerary.branding.footerText}</p>
          )}
          <p className="text-xs text-white/50 uppercase tracking-[0.3em]">
            Generated on {new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <p className="text-xs text-white/40 mt-2">Crafted with ❤️ for unforgettable journeys</p>
        </section>
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

            <Button variant="ghost" onClick={handleEdit} className="hover:bg-gray-100/80">

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
              <label className="text-sm font-medium text-gray-700">Template</label>
              <Select
                value={selectedTemplate.toString()}
                onValueChange={(val) => setSelectedTemplate(parseInt(val))}
              >
                <SelectTrigger className="w-[100px] h-8 bg-white">
                  <SelectValue placeholder="Template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Classic</SelectItem>
                  <SelectItem value="2">Modern</SelectItem>
                  <SelectItem value="3">Minimal</SelectItem>
                  <SelectItem value="4">Premium</SelectItem>
                </SelectContent>
              </Select>
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

        {(() => {
          if (!itinerary) return null
          const { rates: exchangeRates, baseCurrency } = getExchangeRates()
          const targetCurrency = baseCurrency || "INR"
          const pricingConfig: PricingConfig = {
            adults: itinerary.previewConfig?.adults || 2,
            children: itinerary.previewConfig?.children || 0,
            targetCurrency: targetCurrency,
            exchangeRates: exchangeRates,
            baseCurrency: baseCurrency,
          }

          if (selectedTemplate === 4) {
            return (
              <ItineraryTemplate4
                itinerary={itinerary}
                isDetailedView={isDetailedView}
                showPrices={showPrices}
                showTimings={showTimings}
                pricingConfig={pricingConfig}
              />
            )
          } else if (selectedTemplate === 3) {
            return renderTemplateThree()
          } else if (selectedTemplate === 2) {
            return renderTemplateTwo()
          } else {
            return (
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

                          {itinerary.days.length} {itinerary.days.length === 1 ? "Day" : "Days"} {itinerary.nights > 0 ? `${itinerary.nights} ${itinerary.nights === 1 ? "Night" : "Nights"} ` : `${Math.max(0, itinerary.days.length - 1)} ${Math.max(0, itinerary.days.length - 1) === 1 ? "Night" : "Nights"} `}

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
            )
          }
        })()}

      </div>

    </div >

  )

}









