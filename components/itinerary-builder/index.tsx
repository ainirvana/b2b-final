import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Plus,
  Save,
  Eye,
  Sun,
  Calendar,
  GripVertical,
  Plane,
  Library,
  UtensilsCrossed,
  Car,
  MapPin,
  Camera,
  FileText,
  Shield,
  Train,
  Ship,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { EventCard } from "../event-card"
import { AdditionalSections } from "../additional-sections"
import { DayTitle } from "./day-title"
import { EditEventModal } from "./edit-event-modal"
import { LibrarySidebar } from "./library-sidebar"
import { LibraryIntegrationPanel } from "./library-integration-panel"
import { LibraryUsageStats } from "./library-usage-stats"
import { ComponentSourceModal } from "./component-source-modal"
import { BrandingSettings } from "./branding-settings"
import { GalleryUpload } from "./gallery-upload"
import type { IItineraryDay, IItineraryEvent, IGalleryItem } from "@/models/Itinerary"
import { LibraryToItineraryConverter } from "@/lib/library-converter"
import { useLibrary } from "@/hooks/use-library"
import { useItineraries } from "@/hooks/use-itineraries"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

// Add a list of countries (for demo, a few; in production, use a full list or a country picker library)
const COUNTRY_OPTIONS = [
  "India", "Thailand", "France", "USA", "Australia", "Japan", "Italy", "Spain", "UK", "Germany"
]

interface ItineraryBuilderProps {
  itineraryId?: string
  onBack: () => void
}

const EMPTY_DAY: IItineraryDay = {
  day: 1,
  date: new Date().toISOString().split("T")[0],
  title: "Day 1",
  description: "",
  detailedDescription: "",
  events: [],
  nights: 0,
  meals: {
    breakfast: false,
    lunch: false,
    dinner: false,
  },
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
    icon: Sun,
    color: "bg-blue-50 border-blue-200",
  },
  {
    category: "activity",
    title: "Activity",
    icon: Camera,
    color: "bg-green-50 border-green-200",
  },
  {
    category: "meal",
    title: "Meals",
    icon: UtensilsCrossed,
    color: "bg-yellow-50 border-yellow-200",
  },
  {
    category: "heading",
    title: "Heading",
    icon: FileText,
    color: "bg-gray-50 border-gray-200",
  },
  {
    category: "paragraph",
    title: "Paragraph",
    icon: FileText,
    color: "bg-gray-50 border-gray-200",
  },
  {
    category: "list",
    title: "List",
    icon: FileText,
    color: "bg-gray-50 border-gray-200",
  },
  {
    category: "transport",
    title: "Transport",
    icon: Train,
    color: "bg-indigo-50 border-indigo-200",
  },
  {
    category: "cruise",
    title: "Cruise",
    icon: Ship,
    color: "bg-cyan-50 border-cyan-200",
  },
  {
    category: "visa",
    title: "Visa Service",
    icon: FileText,
    color: "bg-red-50 border-red-200",
  },
  {
    category: "insurance",
    title: "Insurance",
    icon: Shield,
    color: "bg-emerald-50 border-emerald-200",
  },
  {
    category: "guide",
    title: "Tour Guide",
    icon: MapPin,
    color: "bg-pink-50 border-pink-200",
  },
  {
    category: "rental",
    title: "Car Rental",
    icon: Car,
    color: "bg-violet-50 border-violet-200",
  },
  {
    category: "meeting",
    title: "Meeting Room",
    icon: Calendar,
    color: "bg-slate-50 border-slate-200",
  },
  {
    category: "image",
    title: "Image",
    icon: Camera,
    color: "bg-pink-50 border-pink-200",
  },
]

export function ItineraryBuilder({ itineraryId, onBack }: ItineraryBuilderProps) {
  const { items: libraryItems } = useLibrary()
  const { createItinerary, updateItinerary } = useItineraries()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const isNewMode = searchParams.get('mode') === 'new'

  // All state declarations in one place
  const [days, setDays] = useState<IItineraryDay[]>([{ ...EMPTY_DAY, events: [] }])
  const [title, setTitle] = useState("New Itinerary")
  const [description, setDescription] = useState("")
  const [isDetailedView, setIsDetailedView] = useState(true)
  const [additionalSections, setAdditionalSections] = useState<Record<string, string>>({})
  const [editingEvent, setEditingEvent] = useState<{
    event: IItineraryEvent
    dayIndex: number
    eventIndex: number
  } | null>(null)
  const [productId, setProductId] = useState(`ITN-${Date.now().toString(36).toUpperCase()}`)
  const [branding, setBranding] = useState<{
    headerLogo?: string
    headerText?: string
    footerLogo?: string
    footerText?: string
    primaryColor?: string
    secondaryColor?: string
  }>({
    headerLogo: "",
    headerText: "",
    footerLogo: "",
    footerText: "",
    primaryColor: "#3B82F6",
    secondaryColor: "#10B981",
  })
  const [countries, setCountries] = useState<string[]>([])
  const [countryError, setCountryError] = useState<string>("")
  const [gallery, setGallery] = useState<IGalleryItem[]>([])
  const [collapsedDays, setCollapsedDays] = useState<Set<number>>(new Set())

  // Initialize with setup data from URL parameters
  useEffect(() => {
    if (!itineraryId && isNewMode) {
      const numDays = parseInt(searchParams.get('days') || '1')
      const itineraryName = searchParams.get('name') || 'New Itinerary'
      const newProductId = searchParams.get('productId') || productId

      const initialDays = Array.from({ length: numDays }, (_, index) => ({
        ...EMPTY_DAY,
        day: index + 1,
        title: `Day ${index + 1}`,
        date: new Date(new Date().setDate(new Date().getDate() + index)).toISOString().split("T")[0],
        events: [],
      }))

      setDays(initialDays)
      setTitle(itineraryName)
      setProductId(newProductId)

      // Remove the query parameters
      router.replace('/itinerary/builder')
    }
  }, [itineraryId, isNewMode, router, productId])

  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [activeSidebar, setActiveSidebar] = useState<"components" | "library">("components")
  const [draggedItem, setDraggedItem] = useState<{
    type: "component" | "event" | "library-item"
    item: any
    sourceDay?: number
    sourceIndex?: number
  } | null>(null)
  const [dropTarget, setDropTarget] = useState<{ dayIndex: number; position: number } | null>(null)
  const [componentSourceModal, setComponentSourceModal] = useState<{
    isOpen: boolean
    component: any
    dropTarget: { dayIndex: number; position: number } | null
  }>({
    isOpen: false,
    component: null,
    dropTarget: null,
  })

  const totalEvents = days.reduce((sum, day) => sum + day.events.length, 0)
  const libraryBasedEvents = days.reduce(
    (sum, day) => sum + day.events.filter((event) => event.libraryItemId).length,
    0,
  )
  const usedLibraryItems = new Set(
    days.flatMap((day) => day.events.filter((event) => event.libraryItemId).map((event) => event.libraryItemId)),
  ).size

  const handleDragStart = (
    type: "component" | "event" | "library-item",
    item: any,
    dayIndex?: number,
    eventIndex?: number,
  ) => {
    setDraggedItem({ type, item, sourceDay: dayIndex, sourceIndex: eventIndex })
  }

  const handleDragOver = (dayIndex: number, position: number) => {
    setDropTarget({ dayIndex, position })
  }

  const handleLibraryDragStart = (item: any, type: string) => {
    handleDragStart("library-item", item)
  }

  const convertLibraryItemToEvent = (libraryItem: any): IItineraryEvent => {
    const convertedEvent = LibraryToItineraryConverter.convertToItineraryEvent(libraryItem)
    return {
      ...convertedEvent,
      libraryItemId: libraryItem.id,
      componentSource: "my-library",
      originalLibraryId: libraryItem.id,
      versionHistory: [
        {
          timestamp: new Date(),
          action: "imported",
          source: "my-library",
        },
      ],
      highlights: convertedEvent.highlights ? [...convertedEvent.highlights] : [],
      listItems: convertedEvent.listItems ? [...convertedEvent.listItems] : [],
    }
  }

  const handleDrop = (dayIndex: number, position: number) => {
    if (!draggedItem) return

    if (draggedItem.type === "component") {
      setComponentSourceModal({
        isOpen: true,
        component: draggedItem.item,
        dropTarget: { dayIndex, position },
      })
      return
    }

    const newDays = [...days]

    if (draggedItem.type === "library-item") {
      const newEvent = convertLibraryItemToEvent(draggedItem.item)
      newDays[dayIndex].events.splice(position, 0, newEvent)
    } else if (
      draggedItem.type === "event" &&
      draggedItem.sourceDay !== undefined &&
      draggedItem.sourceIndex !== undefined
    ) {
      const [movedEvent] = newDays[draggedItem.sourceDay].events.splice(draggedItem.sourceIndex, 1)
      newDays[dayIndex].events.splice(position, 0, movedEvent)
    }

    setDays(newDays)
    setDraggedItem(null)
    setDropTarget(null)
  }

  const updateDayTitle = (dayIndex: number, newTitle: string) => {
    const newDays = [...days]
    newDays[dayIndex].title = newTitle
    setDays(newDays)
  }

  const updateDayDescription = (dayIndex: number, newDescription: string, isDetailed = false) => {
    const newDays = [...days]
    if (isDetailed) {
      newDays[dayIndex].detailedDescription = newDescription
    } else {
      newDays[dayIndex].description = newDescription
    }
    setDays(newDays)
  }

  const updateDayNights = (dayIndex: number, nights: string) => {
    const newDays = [...days]
    newDays[dayIndex].nights = Number.parseInt(nights) || 0
    setDays(newDays)
  }

  const updateDayMeals = (dayIndex: number, meal: "breakfast" | "lunch" | "dinner", value: boolean) => {
    const newDays = [...days]
    newDays[dayIndex].meals[meal] = value
    setDays(newDays)
  }

  const toggleDayCollapse = (dayIndex: number) => {
    const newCollapsedDays = new Set(collapsedDays)
    if (newCollapsedDays.has(dayIndex)) {
      newCollapsedDays.delete(dayIndex)
    } else {
      newCollapsedDays.add(dayIndex)
    }
    setCollapsedDays(newCollapsedDays)
  }

  const handleEditEvent = (dayIndex: number, eventIndex: number) => {
    setEditingEvent({
      event: days[dayIndex].events[eventIndex],
      dayIndex,
      eventIndex,
    })
  }

  const handleDeleteEvent = (dayIndex: number, eventIndex: number) => {
    const newDays = [...days]
    newDays[dayIndex].events.splice(eventIndex, 1)
    setDays(newDays)
  }

  const handleSaveEvent = (updatedEvent: IItineraryEvent) => {
    if (!editingEvent) return

    const newDays = days.map((day, dayIdx) => {
      if (dayIdx === editingEvent.dayIndex) {
        return {
          ...day,
          events: day.events.map((event, eventIdx) => {
            if (eventIdx === editingEvent.eventIndex) {
              return {
                ...updatedEvent,
                highlights: updatedEvent.highlights ? [...updatedEvent.highlights] : [],
                listItems: updatedEvent.listItems ? [...updatedEvent.listItems] : [],
              }
            }
            return event
          }),
        }
      }
      return day
    })

    setDays(newDays)
    setEditingEvent(null)
  }

  const addDay = () => {
    const newDay: IItineraryDay = {
      day: days.length + 1,
      title: `Day ${days.length + 1}`,
      date: new Date(Date.now() + days.length * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      description: "",
      detailedDescription: "",
      events: [],
      nights: 0,
      meals: {
        breakfast: false,
        lunch: false,
        dinner: false,
      },
    }
    setDays([...days, newDay])
  }

  const handleSelectManualComponent = () => {
    if (!componentSourceModal.dropTarget || !componentSourceModal.component) return

    const { dayIndex, position } = componentSourceModal.dropTarget
    const component = componentSourceModal.component
    const newDays = [...days]

    const newEvent: IItineraryEvent = {
      id: `event-${Date.now()}`,
      category: component.category,
      title: `New ${component.title}`,
      description: "",
      time: "09:00",
      location: "",
      highlights: [],
      listItems: [],
      price: 0,
      componentSource: "manual",
      versionHistory: [
        {
          timestamp: new Date(),
          action: "created",
          source: "manual",
        },
      ],
      ...(component.category === "flight" && {
        fromCity: "Enter origin",
        toCity: "Enter destination",
        mainPoint: "Enter flight details",
      }),
      ...(component.category === "hotel" && {
        checkIn: "14:00",
        checkOut: "12:00",
        amenities: [],
      }),
      ...(component.category === "transfer" && {
        fromLocation: "Pick-up location",
        toLocation: "Drop-off location",
        vehicleType: "Private Car",
        capacity: 4,
      }),
      ...(component.category === "activity" && {
        duration: "2 hours",
        difficulty: "Easy",
        capacity: 20,
        highlights: [],
      }),
      ...(component.category === "meal" && {
      }),
      ...(component.category === "heading" && {
        title: "Enter heading text",
        description: "Optional subtitle",
      }),
      ...(component.category === "paragraph" && {
        title: "Paragraph",
        description: "Enter your paragraph text here...",
      }),
      ...(component.category === "list" && {
        title: "List Title",
        listItems: ["Item 1", "Item 2", "Item 3"],
      }),
      ...(component.category === "image" && {
        title: "New Image",
        description: "Add image description...",
        imageUrl: "",
        imageCaption: "",
        imageAlt: "",
      }),
    }

    newDays[dayIndex].events.splice(position, 0, newEvent)
    setDays(newDays)
    setDraggedItem(null)
    setDropTarget(null)
    setComponentSourceModal({ isOpen: false, component: null, dropTarget: null })
  }

  const handleSelectLibraryComponent = (libraryItem: any) => {
    if (!componentSourceModal.dropTarget) return

    const { dayIndex, position } = componentSourceModal.dropTarget
    const newDays = [...days]
    const newEvent = convertLibraryItemToEvent(libraryItem)

    newDays[dayIndex].events.splice(position, 0, newEvent)
    setDays(newDays)
    setDraggedItem(null)
    setDropTarget(null)
    setComponentSourceModal({ isOpen: false, component: null, dropTarget: null })
  }

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0")
    const month = date.toLocaleDateString("en", { month: "short" })
    const year = date.getFullYear().toString().slice(-2)
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    return `${day} ${month}' ${year} ${hours}:${minutes}`
  }

  const handlePreview = async () => {
    setIsGeneratingPreview(true)
    try {
      const totalPrice = days.reduce(
        (sum, day) => sum + day.events.reduce((daySum, event) => daySum + (event.price || 0), 0),
        0,
      )

      const previewData = {
        title,
        description,
        productId,
        days,
        branding,
        totalPrice,
        generatedAt: formatDate(new Date()),
        additionalSections,
        gallery, // Include gallery in preview data
      }

      localStorage.setItem("itinerary-preview", JSON.stringify(previewData))

      window.open("/itinerary/preview", "_blank")

      toast({
        title: "Preview Generated",
        description: "Opening preview in new tab...",
      })
    } catch (error) {
      console.error("Failed to generate preview:", error)
      toast({
        title: "Preview Failed",
        description: "Failed to generate preview. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setCountryError("")
    try {
      if (countries.length === 0) {
        setCountryError("Please select at least one country.")
        setIsSaving(false)
        return
      }

      if (!title.trim()) {
        throw new Error("Title is required")
      }

      if (!description.trim()) {
        throw new Error("Description is required")
      }

      // Removed clientDetails.clientName, clientEmail, startDate, endDate, and groupSize as required fields

      const totalPrice = days.reduce(
        (sum, day) => sum + day.events.reduce((daySum, event) => daySum + (event.price || 0), 0),
        0,
      )

      const itineraryData = {
        productId: productId.trim() || `ITN-${Date.now().toString(36).toUpperCase()}`,
        title: title.trim(),
        description: description.trim(),
        destination: extractDestination() || "Multiple Destinations",
        duration: `${days.length} ${days.length === 1 ? "day" : "days"}`,
        totalPrice,
        currency: "USD",
        status: "draft" as const,
        createdBy: "agent-user",
        countries,
        days: days.map((day) => ({
          ...day,
          events: day.events.map((event) => ({
            ...event,
            title: event.title || `New ${event.category}`,
            description: event.description || "No description provided",
            highlights: event.highlights || [],
            listItems: event.listItems || [],
            price: event.price || 0,
            versionHistory: event.versionHistory || [
              {
                timestamp: new Date(),
                action: "created" as const,
                source: event.componentSource || "manual",
              },
            ],
          })),
        })),
        highlights: extractHighlights(),
        images: extractImages(),
        gallery, // Include gallery in save data
        branding,
      }

      console.log("[v0] Saving itinerary data:", itineraryData)

      let result
      if (itineraryId) {
        result = await updateItinerary(itineraryId, itineraryData)
      } else {
        result = await createItinerary(itineraryData)
      }

      if (result) {
        toast({
          title: "Itinerary Saved Successfully",
          description: `"${title}" saved with Product ID: ${productId}`,
        })

        if (!itineraryId && result._id) {
          window.history.replaceState(null, "", `/itinerary?mode=edit&id=${result._id}`)
        }
      }
    } catch (error) {
      console.error("[v0] Save error:", error)
      toast({
        title: "Save Failed",
        description:
          error instanceof Error ? error.message : "Failed to save itinerary. Please check all required fields.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateCopy = async () => {
    try {
      if (!title.trim()) {
        toast({
          title: "Copy Failed",
          description: "Please add a title before creating a copy.",
          variant: "destructive",
        })
        return
      }

      const newProductId = `ITN-${Date.now().toString(36).toUpperCase()}`
      const newTitle = `${title} (Copy)`

      const copiedDays = days.map((day) => ({
        ...day,
        events: day.events.map((event) => ({
          ...event,
          id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          highlights: event.highlights ? [...event.highlights] : [],
          listItems: event.listItems ? [...event.listItems] : [],
          componentSource: event.componentSource === "my-library" ? "my-library-edited" : event.componentSource,
          versionHistory: [
            ...(event.versionHistory || []),
            {
              timestamp: new Date(),
              action: "created" as const,
              source: "manual",
            },
          ],
        })),
      }))

      const totalPrice = copiedDays.reduce(
        (sum, day) => sum + day.events.reduce((daySum, event) => daySum + (event.price || 0), 0),
        0,
      )

      const copyData = {
        productId: newProductId,
        title: newTitle,
        description: description ? `${description} (Copy)` : "Copy of itinerary",
        destination: extractDestination() || "Multiple Destinations",
        duration: `${copiedDays.length} ${copiedDays.length === 1 ? "day" : "days"}`,
        totalPrice,
        currency: "USD",
        status: "draft" as const,
        createdBy: "agent-user",
        days: copiedDays,
        highlights: extractHighlights(),
        images: extractImages(),
        gallery: [...gallery], // Include gallery in copy
        branding: { ...branding },
      }

      console.log("[v0] Creating copy with data:", copyData)

      const result = await createItinerary(copyData)

      if (result) {
        setProductId(newProductId)
        setTitle(newTitle)
        setDescription(description ? `${description} (Copy)` : "Copy of itinerary")
        setDays(copiedDays)

        toast({
          title: "Copy Created Successfully",
          description: `Created "${newTitle}" with Product ID: ${newProductId}`,
        })

        if (result._id) {
          window.history.replaceState(null, "", `/itinerary?mode=edit&id=${result._id}`)
        }
      } else {
        throw new Error("Failed to create copy - no result returned")
      }
    } catch (error) {
      console.error("[v0] Failed to create copy:", error)
      toast({
        title: "Copy Failed",
        description: error instanceof Error ? error.message : "Failed to create copy. Please try again.",
        variant: "destructive",
      })
    }
  }

  const extractDestination = (): string => {
    const flightEvents = days.flatMap((day) => day.events.filter((event) => event.category === "flight"))
    if (flightEvents.length > 0) {
      const destinations = flightEvents
        .map((event) => event.toCity)
        .filter((city) => city && city !== "Enter destination")
      if (destinations.length > 0) {
        return destinations.join(", ")
      }
    }
    const hotelEvents = days.flatMap((day) => day.events.filter((event) => event.category === "hotel"))
    if (hotelEvents.length > 0) {
      const locations = hotelEvents.map((event) => event.location).filter((location) => location && location.trim())
      if (locations.length > 0) {
        return locations[0] || "Multiple Destinations"
      }
    }
    return "Multiple Destinations"
  }

  const extractHighlights = (): string[] => {
    const allHighlights = days.flatMap((day) => day.events.flatMap((event) => event.highlights || []))

    return [...new Set(allHighlights.filter((highlight) => highlight.trim()))]
  }

  const extractImages = (): string[] => {
    const allImages = days.flatMap((day) =>
      day.events.filter((event) => event.imageUrl).map((event) => event.imageUrl!),
    )

    return [...new Set(allImages)]
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 p-6 overflow-y-auto h-full">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm border mb-8 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500 font-medium" htmlFor="itinerary-title">Itinerary Name</label>
              <Input
                id="itinerary-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold border-none p-0 h-auto bg-transparent focus:ring-0 focus:border-transparent"
                placeholder="Enter Itinerary Title"
                autoComplete="off"
              />
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mt-2">
                <div className="flex items-center gap-2 mb-2 sm:mb-0">
                  <label className="text-xs text-gray-400 font-medium" htmlFor="product-id">Product ID:</label>
                  <Input
                    id="product-id"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="text-xs border-none p-0 h-auto bg-transparent font-mono text-gray-500 w-36 focus:ring-0 focus:border-transparent"
                    placeholder="Product ID"
                    readOnly
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 font-medium" htmlFor="itinerary-description">Itinerary Description</label>
                  <Textarea
                    id="itinerary-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter itinerary description..."
                    className="resize-none"
                    rows={2}
                  />
                </div>
              </div>
              {/* Country Checkbox List */}
              <div className="flex flex-col gap-1 mt-4">
                <label className="text-xs text-gray-500 font-medium">Country(s): <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-3 max-w-full max-h-24 overflow-y-auto border border-gray-200 rounded p-2">
                  {COUNTRY_OPTIONS.map((country) => (
                    <label key={country} className="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={countries.includes(country)}
                        onChange={e => {
                          if (e.target.checked) {
                            setCountries([...countries, country])
                          } else {
                            setCountries(countries.filter(c => c !== country))
                          }
                        }}
                        className="accent-blue-600"
                      />
                      {country}
                    </label>
                  ))}
                </div>
                {countryError && <span className="text-xs text-red-500 mt-1">{countryError}</span>}
              </div>
            </div>
            {/* Detailed View Toggle */}
            <div className="flex items-center gap-2 mt-4">
              <Switch checked={isDetailedView} onCheckedChange={setIsDetailedView} />
              <span className="text-sm font-medium text-gray-700">{isDetailedView ? "Detailed View" : "Summary View"}</span>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex flex-wrap justify-between items-center mt-4 mb-6 gap-2">
            {/* Left Buttons */}
            <div className="flex space-x-2 flex-wrap">
              <Button variant="default" className="font-semibold whitespace-nowrap">
                Itinerary
              </Button>
              <Button variant="outline" className="flex items-center space-x-1 whitespace-nowrap">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                <span>City Level View</span>
              </Button>
              <Button variant="outline" className="font-semibold whitespace-nowrap">
                All Inclusions
              </Button>
            </div>
            {/* Right Buttons */}
            <div className="flex space-x-2 flex-wrap">
              <Button variant="outline" onClick={handleCreateCopy} disabled={isSaving} className="whitespace-nowrap">
                Create Copy
              </Button>
              <Button variant="outline" onClick={handlePreview} disabled={isGeneratingPreview} className="whitespace-nowrap">
                {isGeneratingPreview ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="mr-2 h-4 w-4" />
                )}
                Preview
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="whitespace-nowrap">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save
              </Button>
              <Button variant="outline" className="flex items-center space-x-1 whitespace-nowrap">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Modify</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-1 whitespace-nowrap">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12h.01M12 12h.01M9 12h.01M12 16v-4m0 0l-3 3m3-3l3 3"
                  />
                </svg>
                <span>Share</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-1 whitespace-nowrap">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v6m0 0l-3-3m3 3l3-3"
                  />
                </svg>
                <span>Download</span>
              </Button>
            </div>
          </div>
        </div>

        <BrandingSettings branding={branding} onUpdate={branding => setBranding(branding)} />

        {/* Gallery Upload Section */}
        <div className="mb-6">
          <GalleryUpload gallery={gallery} onGalleryUpdate={setGallery} />
        </div>

        <div className="space-y-6">
          {days.map((day, dayIndex) => (
            <Card
              key={`day-${dayIndex}-${day.day}`}
              className={`relative border-2 ${dropTarget?.dayIndex === dayIndex ? "border-blue-400" : "border-gray-200"}`}
              onDragOver={(e) => {
                e.preventDefault()
                handleDragOver(dayIndex, day.events.length)
              }}
              onDrop={() => handleDrop(dayIndex, day.events.length)}
            >
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <DayTitle
                    day={day.day}
                    title={day.title}
                    nights={day.nights}
                    onTitleChange={(newTitle) => updateDayTitle(dayIndex, newTitle)}
                    onNightsChange={(newNights) => updateDayNights(dayIndex, newNights)}
                  />
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => toggleDayCollapse(dayIndex)}>
                      {collapsedDays.has(dayIndex) ? (
                        <ChevronDown className="h-4 w-4 mr-1" />
                      ) : (
                        <ChevronUp className="h-4 w-4 mr-1" />
                      )}
                      {collapsedDays.has(dayIndex) ? "Expand" : "Collapse"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setIsDetailedView(!isDetailedView)}>
                      <Eye className="h-4 w-4 mr-1" />
                      {isDetailedView ? "Hide Details" : "Show Details"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {!collapsedDays.has(dayIndex) && (
                <CardContent>
                  {isDetailedView ? (
                    <div className="space-y-4 mt-4">
                      <Textarea
                        value={day.detailedDescription || ""}
                        onChange={(e) => updateDayDescription(dayIndex, e.target.value, true)}
                        placeholder="Enter detailed description for this day..."
                        className="resize-none"
                        rows={3}
                      />
                    </div>
                  ) : (
                    <div className="mt-2">
                      <Input
                        value={day.description || ""}
                        onChange={(e) => updateDayDescription(dayIndex, e.target.value)}
                        placeholder="Enter brief description..."
                        className="border-none p-0 bg-transparent"
                      />
                    </div>
                  )}

                  <div className="mt-4 space-y-4">
                    {day.events.map((event, eventIndex) => (
                      <EventCard
                        key={`${event.id}-${dayIndex}-${eventIndex}`}
                        event={event}
                        isDetailedView={isDetailedView}
                        onDragStart={() => handleDragStart("event", event, dayIndex, eventIndex)}
                        onEdit={() => handleEditEvent(dayIndex, eventIndex)}
                        onDelete={() => handleDeleteEvent(dayIndex, eventIndex)}
                        onMealChange={(meal, value) => {
                          // meals property is not part of IItineraryEvent, so this is removed
                        }}
                        onUpdate={(updatedEvent) => {
                          const newDays = [...days]
                          newDays[dayIndex].events[eventIndex] = {
                            ...updatedEvent,
                            highlights: updatedEvent.highlights ? [...updatedEvent.highlights] : [],
                            listItems: updatedEvent.listItems ? [...updatedEvent.listItems] : [],
                          }
                          setDays(newDays)
                        }}
                      />
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Button onClick={addDay} variant="outline" className="border-dashed border-2 bg-transparent">
            <Plus className="mr-2 h-4 w-4" />
            Add Day
          </Button>
        </div>

        <div className="mt-8">
          <AdditionalSections sections={additionalSections} onUpdate={setAdditionalSections} />
        </div>

        <div className="mt-8">
          <LibraryIntegrationPanel
            itinerary={{ days, title, description }}
            onRemoveLibraryItem={(eventId) => {
              const newDays = [...days]
              newDays.forEach((day, dayIndex) => {
                const eventIndex = day.events.findIndex((event) => event.id === eventId)
                if (eventIndex !== -1) {
                  newDays[dayIndex].events.splice(eventIndex, 1)
                }
              })
              setDays(newDays)
            }}
            onViewLibraryItem={(itemId) => {
              console.log("View library item:", itemId)
            }}
          />
        </div>
      </div>

      <div className="w-80 border-l bg-white flex flex-col h-screen">
        <div className="border-b bg-gray-50 p-4 flex-shrink-0">
          <div className="flex space-x-1">
            <Button
              onClick={() => setActiveSidebar("components")}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeSidebar === "components"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              Components
            </Button>
            <Button
              onClick={() => setActiveSidebar("library")}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeSidebar === "library"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              <Library className="h-4 w-4 mr-1" />
              Library
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {activeSidebar === "components" ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="p-4 border-b flex-shrink-0">
                <h3 className="font-semibold text-lg">Components</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 min-h-0">
                <div className="space-y-3">
                  {COMPONENT_TEMPLATES.map((component) => {
                    const Icon = component.icon
                    return (
                      <Card
                        key={component.category}
                        className={`${component.color} cursor-move hover:shadow-md transition-shadow`}
                        draggable
                        onDragStart={() => handleDragStart("component", component)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-2">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                            <Icon className="h-4 w-4" />
                            <span className="font-medium">{component.title}</span>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="p-4 border-b flex-shrink-0">
                <h3 className="font-semibold text-lg">Library Items</h3>
                <div className="mt-2">
                  <LibraryUsageStats
                    totalLibraryItems={libraryItems.length}
                    usedLibraryItems={usedLibraryItems}
                    itineraryEventCount={totalEvents}
                    libraryBasedEventCount={libraryBasedEvents}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 min-h-0">
                <LibrarySidebar onDragStart={handleLibraryDragStart} />
              </div>
            </div>
          )}
        </div>
      </div>

      <ComponentSourceModal
        isOpen={componentSourceModal.isOpen}
        onClose={() => setComponentSourceModal({ isOpen: false, component: null, dropTarget: null })}
        componentType={componentSourceModal.component?.category || ""}
        componentTitle={componentSourceModal.component?.title || ""}
        onSelectManual={handleSelectManualComponent}
        onSelectLibrary={handleSelectLibraryComponent}
      />

      <EditEventModal
        event={editingEvent?.event || null}
        isOpen={!!editingEvent}
        onClose={() => setEditingEvent(null)}
        onSave={handleSaveEvent}
      />
    </div>
  )
}
