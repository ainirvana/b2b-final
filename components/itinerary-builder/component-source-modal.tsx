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
import { Search, Plus, Library, Star, Clock, Filter, Copy, Heart, StickyNote } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLibrary } from "@/hooks/use-library"
import { LibraryToItineraryConverter } from "@/lib/library-converter"
import { TransferForms } from "./transfer-forms"
import { AncillariesForms } from "./ancillaries-forms"

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

  // Subcategory selection state for Transfer and Ancillaries
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("")

  // Subcategory options for Transfer (2-level hierarchy)
  const transferSubCategories = [
    { id: "airport-transfer", label: "Airport Transfer", icon: "✈️" },
    { id: "car-hire-hourly", label: "Car Hire - Hourly", icon: "🚗" },
    { id: "car-hire-outstation", label: "Car Hire - Outstation (One Way)", icon: "🚗" },
    { id: "car-hire-roundtrip", label: "Car Hire - Round Trip", icon: "🚗" },
    { id: "car-hire-selfdrive", label: "Car Hire - Self Drive", icon: "🚗" },
    { id: "bus", label: "Bus", icon: "🚌" },
    { id: "train", label: "Train", icon: "🚆" },
  ]

  // Subcategory options for Ancillaries
  const ancillariesSubCategories = [
    { id: "visa", label: "Visa", icon: "📋" },
    { id: "forex", label: "Forex", icon: "💱" },
    { id: "travel-insurance", label: "Travel Insurance", icon: "🛡️" },
  ]

  useEffect(() => {
    if (!isOpen) {
      setSelectedSource(null)
      setSearchQuery("")
      setSelectedSubCategory("") // Reset subcategory when modal closes
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
  const [manualCurrency, setManualCurrency] = useState("INR") // Default currency
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
  const [manualMeals, setManualMeals] = useState<string[]>([])
  const [manualCustomMealDescription, setManualCustomMealDescription] = useState("")
  // Flight specific fields
  const [manualBaggage, setManualBaggage] = useState("")
  const [manualStops, setManualStops] = useState("")
  const [manualPnr, setManualPnr] = useState("")
  const [manualRefundable, setManualRefundable] = useState("")
  const [manualFlightNumber, setManualFlightNumber] = useState("")
  const [manualAirline, setManualAirline] = useState("")
  const [manualClass, setManualClass] = useState("")
  const [manualEndTime, setManualEndTime] = useState("")
  // Note specific fields
  const [manualNoteContent, setManualNoteContent] = useState("")
  // Hotel specific fields
  const [manualAdults, setManualAdults] = useState<number | "">("")
  const [manualChildren, setManualChildren] = useState<number | "">("")
  const [manualPropertyType, setManualPropertyType] = useState("")
  const [manualAddress, setManualAddress] = useState("")
  const [manualHotelLink, setManualHotelLink] = useState("")
  const [manualConfirmationNumber, setManualConfirmationNumber] = useState("")

  // Transfer specific fields
  // Airport Transfer & On Demand Transfer
  const [manualPickupDrop, setManualPickupDrop] = useState<"pickup" | "drop">("pickup") // Toggle
  const [manualAirportName, setManualAirportName] = useState("")
  const [manualTransferType, setManualTransferType] = useState<"private" | "shared">("private")
  const [manualVehicleCapacity, setManualVehicleCapacity] = useState<number | "">(3) // Default 3
  const [manualPricePerPax, setManualPricePerPax] = useState<number | "">("")  // Calculated
  const [manualStopsList, setManualStopsList] = useState<string[]>([]) // Optional stops
  const [manualAdditionalVehicles, setManualAdditionalVehicles] = useState<Array<{ vehicleType: string, capacity: number, price: number }>>([])

  // Car Hire specific
  const [manualPickupTime, setManualPickupTime] = useState("")
  const [manualDropTime, setManualDropTime] = useState("")
  const [manualNoOfHours, setManualNoOfHours] = useState<number | "">("")
  const [manualNoOfDays, setManualNoOfDays] = useState<number | "">("")
  const [manualCarType, setManualCarType] = useState("")
  const [manualFuelType, setManualFuelType] = useState("") // Optional
  const [manualCarModel, setManualCarModel] = useState("") // Optional
  const [manualTransmission, setManualTransmission] = useState<"automatic" | "manual" | "">("")  // Optional

  // Bus & Train specific
  const [manualTravelDuration, setManualTravelDuration] = useState("")
  const [manualDepartureTime, setManualDepartureTime] = useState("")
  const [manualArrivalTime, setManualArrivalTime] = useState("")
  const [manualBusNumber, setManualBusNumber] = useState("") // Optional
  const [manualTrainNumber, setManualTrainNumber] = useState("") // Optional
  const [manualLink, setManualLink] = useState("") // Optional
  const [manualPhotos, setManualPhotos] = useState<string[]>([]) // Optional, up to 3

  // Ancillaries specific fields
  // Visa
  const [manualCountry, setManualCountry] = useState("")
  const [manualVisaType, setManualVisaType] = useState("")
  const [manualVisaDuration, setManualVisaDuration] = useState("")
  const [manualServiceFee, setManualServiceFee] = useState<number | "">("")
  const [manualTotalFee, setManualTotalFee] = useState<number | "">("")  // Auto calculated
  const [manualLengthOfStay, setManualLengthOfStay] = useState("") // Optional
  const [manualEntryMethod, setManualEntryMethod] = useState("") // Optional
  const [manualDepartureDate, setManualDepartureDate] = useState("") // Optional
  const [manualReturnDate, setManualReturnDate] = useState("") // Optional

  // Forex
  const [manualForexCurrency, setManualForexCurrency] = useState("")
  const [manualBaseCurrency, setManualBaseCurrency] = useState("INR")
  const [manualAmount, setManualAmount] = useState<number | "">("")

  // Travel Insurance
  const [manualDestinations, setManualDestinations] = useState<string[]>([""]) // Multiple
  const [manualStartDate, setManualStartDate] = useState("")
  const [manualEndDate, setManualEndDate] = useState("")
  const [manualNoOfTravellers, setManualNoOfTravellers] = useState<number | "">("")
  const [manualInsuranceType, setManualInsuranceType] = useState("")
  const [manualNotes, setManualNotes] = useState("") // Optional
  const [manualSumInsured, setManualSumInsured] = useState<number | "">("")  // Optional


  const mealOptions = [
    { id: "breakfast", label: "Breakfast" },
    { id: "lunch", label: "Lunch" },
    { id: "dinner", label: "Dinner" },
    { id: "highTea", label: "High Tea" },
    { id: "halfBoard", label: "Half Board (Breakfast + Lunch or Dinner)" },
    { id: "fullBoard", label: "Full Board (Breakfast + Lunch + Dinner)" },
    { id: "allInclusive", label: "All inclusive (All meals + snacks and drinks*)" },
    { id: "others", label: "Others" },
  ]

  const handleMealToggle = (mealId: string) => {
    const isSelected = manualMeals.includes(mealId)
    if (isSelected) {
      setManualMeals(manualMeals.filter((m) => m !== mealId))
      if (mealId === "others") {
        setManualCustomMealDescription("")
      }
    } else {
      setManualMeals([...manualMeals, mealId])
    }
  }

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

  // Auto-calculate Price Per Pax for Transfer
  useEffect(() => {
    if (manualPrice && manualVehicleCapacity && manualTransferType === "shared") {
      const priceNum = typeof manualPrice === "number" ? manualPrice : 0
      const capacityNum = typeof manualVehicleCapacity === "number" ? manualVehicleCapacity : 1
      setManualPricePerPax(Math.round((priceNum / capacityNum) * 100) / 100)
    } else {
      setManualPricePerPax("")
    }
  }, [manualPrice, manualVehicleCapacity, manualTransferType])

  // Auto-calculate Total Fee for Visa
  useEffect(() => {
    if (manualPrice && manualServiceFee) {
      const priceNum = typeof manualPrice === "number" ? manualPrice : 0
      const feeNum = typeof manualServiceFee === "number" ? manualServiceFee : 0
      setManualTotalFee(priceNum + feeNum)
    } else {
      setManualTotalFee("")
    }
  }, [manualPrice, manualServiceFee])

  // Helper functions for Transfer
  const handleAddStop = () => setManualStopsList([...manualStopsList, ""])
  const handleRemoveStop = (index: number) => {
    setManualStopsList(manualStopsList.filter((_, i) => i !== index))
  }
  const handleStopChange = (index: number, value: string) => {
    const copy = [...manualStopsList]
    copy[index] = value
    setManualStopsList(copy)
  }

  const handleAddVehicle = () => {
    setManualAdditionalVehicles([...manualAdditionalVehicles, { vehicleType: "", capacity: 3, price: 0 }])
  }
  const handleRemoveVehicle = (index: number) => {
    setManualAdditionalVehicles(manualAdditionalVehicles.filter((_, i) => i !== index))
  }
  const handleVehicleChange = (index: number, field: string, value: any) => {
    const copy = [...manualAdditionalVehicles]
    copy[index] = { ...copy[index], [field]: value }
    setManualAdditionalVehicles(copy)
  }

  // Helper functions for Travel Insurance destinations
  const handleAddDestination = () => setManualDestinations([...manualDestinations, ""])
  const handleRemoveDestination = (index: number) => {
    const copy = manualDestinations.filter((_, i) => i !== index)
    setManualDestinations(copy.length ? copy : [""])
  }
  const handleDestinationChange = (index: number, value: string) => {
    const copy = [...manualDestinations]
    copy[index] = value
    setManualDestinations(copy)
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
    if (manualPrice) {
      payload.price = Number(manualPrice)
      payload.currency = manualCurrency
    }
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
    if (manualMeals.length) payload.meals = manualMeals
    if (manualCustomMealDescription) payload.customMealDescription = manualCustomMealDescription
    // Note specific payload
    if (componentType === "note") {
      payload.description = manualNoteContent
    }
    // Flight specific payload
    if (manualBaggage) payload.baggage = manualBaggage
    if (manualStops) payload.stops = manualStops
    if (manualPnr) payload.pnr = manualPnr
    if (manualRefundable) payload.refundable = manualRefundable
    if (manualFlightNumber) payload.flightNumber = manualFlightNumber
    if (manualAirline) payload.airlines = manualAirline
    if (manualClass) payload.flightClass = manualClass
    if (manualClass) payload.flightClass = manualClass
    if (manualEndTime) payload.endTime = manualEndTime
    // Hotel specific payload
    if (manualAdults) payload.adults = Number(manualAdults)
    if (manualChildren) payload.children = Number(manualChildren)
    if (manualPropertyType) payload.propertyType = manualPropertyType
    if (manualAddress) payload.address = manualAddress
    if (manualHotelLink) payload.hotelLink = manualHotelLink
    if (manualConfirmationNumber) payload.confirmationNumber = manualConfirmationNumber

    // Add subcategory for Transfer and Ancillaries
    if (selectedSubCategory) payload.subCategory = selectedSubCategory

    onSelectManual(payload)
    onClose()
    setSelectedSource(null)
    setSelectedSubCategory("") // Reset subcategory
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
    setManualCurrency("INR")
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
    setManualMeals([])
    setManualCustomMealDescription("")
    setManualBaggage("")
    setManualStops("")
    setManualPnr("")
    setManualRefundable("")
    setManualFlightNumber("")
    setManualAirline("")
    setManualClass("")
    setManualEndTime("")
    setManualAdults("")
    setManualChildren("")
    setManualPropertyType("")
    setManualAddress("")
    setManualHotelLink("")
    setManualConfirmationNumber("")
    setManualNoteContent("") // Reset note content
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
              {/* Transfer Component - Show Subcategory Selection */}
              {componentType.toLowerCase() === "transfer" ? (
                <div className="space-y-4">
                  {/* Subcategory Selection */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Sub-Category</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {transferSubCategories.map((subCat) => (
                        <button
                          key={subCat.id}
                          onClick={() => setSelectedSubCategory(subCat.id)}
                          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${selectedSubCategory === subCat.id
                            ? "bg-black text-white border-black"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                            }`}
                        >
                          <span className="text-2xl mb-2">{subCat.icon}</span>
                          <span className="text-xs text-center font-medium">{subCat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Show form fields only if subcategory is selected */}
                  {selectedSubCategory && (
                    <div className="space-y-4">
                      {/* AIRPORT TRANSFER FIELDS */}
                      {selectedSubCategory === "airport-transfer" && (
                        <>
                          {/* Mandatory Fields */}
                          <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                              Mandatory Fields
                            </h4>
                            <div className="space-y-4 pl-4 border-l-2 border-red-200">
                              {/* Pickup/Drop Toggle */}
                              <div>
                                <label className="text-sm font-medium mb-2 block">Pickup/Drop</label>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setManualPickupDrop("pickup")}
                                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all text-sm ${manualPickupDrop === "pickup"
                                      ? "bg-black text-white border-black"
                                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                                      }`}
                                  >
                                    Pickup
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setManualPickupDrop("drop")}
                                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all text-sm ${manualPickupDrop === "drop"
                                      ? "bg-black text-white border-black"
                                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                                      }`}
                                  >
                                    Drop
                                  </button>
                                </div>
                              </div>

                              {/* Airport Name */}
                              <div>
                                <label className="text-sm font-medium">Airport Name</label>
                                <Input
                                  value={manualAirportName}
                                  onChange={(e) => setManualAirportName(e.target.value)}
                                  placeholder="e.g., Indira Gandhi International Airport"
                                />
                              </div>

                              {/* From */}
                              <div>
                                <label className="text-sm font-medium">From</label>
                                <Input
                                  value={manualFromCity}
                                  onChange={(e) => setManualFromCity(e.target.value)}
                                  placeholder={manualPickupDrop === "pickup" ? manualAirportName || "Airport" : "Location"}
                                />
                              </div>

                              {/* To */}
                              <div>
                                <label className="text-sm font-medium">To</label>
                                <Input
                                  value={manualToCity}
                                  onChange={(e) => setManualToCity(e.target.value)}
                                  placeholder={manualPickupDrop === "drop" ? manualAirportName || "Airport" : "Destination"}
                                />
                              </div>

                              {/* Title */}
                              <div>
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                  value={manualTitle}
                                  onChange={(e) => setManualTitle(e.target.value)}
                                  placeholder="Transfer title"
                                />
                              </div>

                              {/* Type of Transfer */}
                              <div>
                                <label className="text-sm font-medium mb-2 block">Type of Transfer</label>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setManualTransferType("private")}
                                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all text-sm ${manualTransferType === "private"
                                      ? "bg-black text-white border-black"
                                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                                      }`}
                                  >
                                    Private
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setManualTransferType("shared")}
                                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all text-sm ${manualTransferType === "shared"
                                      ? "bg-black text-white border-black"
                                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                                      }`}
                                  >
                                    Shared
                                  </button>
                                </div>
                              </div>

                              {/* Type of Vehicle */}
                              <div>
                                <label className="text-sm font-medium">Type of Vehicle</label>
                                <Input
                                  value={manualVehicleType}
                                  onChange={(e) => setManualVehicleType(e.target.value)}
                                  placeholder="e.g., Sedan, SUV, Van"
                                />
                              </div>

                              {/* Vehicle Capacity */}
                              <div>
                                <label className="text-sm font-medium">Vehicle Capacity</label>
                                <Input
                                  type="number"
                                  value={manualVehicleCapacity}
                                  onChange={(e) => setManualVehicleCapacity(Number(e.target.value) || "")}
                                  placeholder="Default: 3"
                                />
                              </div>

                              {/* Price */}
                              <div>
                                <label className="text-sm font-medium">Price</label>
                                <div className="flex gap-2">
                                  <Select value={manualCurrency} onValueChange={setManualCurrency}>
                                    <SelectTrigger className="w-[100px]">
                                      <SelectValue placeholder="Currency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="INR">INR (₹)</SelectItem>
                                      <SelectItem value="USD">USD ($)</SelectItem>
                                      <SelectItem value="EUR">EUR (€)</SelectItem>
                                      <SelectItem value="GBP">GBP (£)</SelectItem>
                                      <SelectItem value="AED">AED (د.إ)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    type="number"
                                    value={manualPrice}
                                    onChange={(e) => setManualPrice(Number(e.target.value) || "")}
                                    placeholder="0.00"
                                    className="flex-1"
                                  />
                                </div>
                              </div>

                              {/* Price Per Pax (Auto-calculated for Shared) */}
                              {manualTransferType === "shared" && manualPricePerPax && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <label className="text-sm font-medium text-blue-900">Price Per Pax (Calculated)</label>
                                  <p className="text-lg font-semibold text-blue-900 mt-1">
                                    {manualCurrency === "INR" ? "₹" : manualCurrency === "USD" ? "$" : manualCurrency === "EUR" ? "€" : manualCurrency === "GBP" ? "£" : ""}
                                    {manualPricePerPax}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Optional Fields */}
                          <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                              <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                              Optional Fields
                            </h4>
                            <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                              {/* Add Stops */}
                              <div>
                                <label className="text-sm font-medium mb-2 block">Add Stops (if any)</label>
                                <div className="space-y-2">
                                  {manualStopsList.map((stop, idx) => (
                                    <div key={idx} className="flex gap-2">
                                      <Input
                                        value={stop}
                                        onChange={(e) => handleStopChange(idx, e.target.value)}
                                        placeholder={`Stop ${idx + 1}`}
                                        className="flex-1"
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveStop(idx)}
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  ))}
                                  <Button type="button" variant="outline" size="sm" onClick={handleAddStop}>
                                    + Add Stop
                                  </Button>
                                </div>
                              </div>

                              {/* Add Vehicles Manually */}
                              <div>
                                <label className="text-sm font-medium mb-2 block">Add Vehicles Manually</label>
                                <div className="space-y-3">
                                  {manualAdditionalVehicles.map((vehicle, idx) => (
                                    <div key={idx} className="p-3 bg-gray-50 rounded-lg space-y-2">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-medium text-gray-600">Vehicle {idx + 1}</span>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleRemoveVehicle(idx)}
                                        >
                                          Remove
                                        </Button>
                                      </div>
                                      <Input
                                        value={vehicle.vehicleType}
                                        onChange={(e) => handleVehicleChange(idx, "vehicleType", e.target.value)}
                                        placeholder="Type of Vehicle"
                                      />
                                      <Input
                                        type="number"
                                        value={vehicle.capacity}
                                        onChange={(e) => handleVehicleChange(idx, "capacity", Number(e.target.value) || 0)}
                                        placeholder="Capacity"
                                      />
                                      <Input
                                        type="number"
                                        value={vehicle.price}
                                        onChange={(e) => handleVehicleChange(idx, "price", Number(e.target.value) || 0)}
                                        placeholder="Price"
                                      />
                                    </div>
                                  ))}
                                  <Button type="button" variant="outline" size="sm" onClick={handleAddVehicle}>
                                    + Add Vehicle
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* TRANSFER FORMS - Car Hire, Bus, Train */}
                      <TransferForms
                        selectedSubCategory={selectedSubCategory}
                        manualTitle={manualTitle}
                        setManualTitle={setManualTitle}
                        manualFromCity={manualFromCity}
                        setManualFromCity={setManualFromCity}
                        manualToCity={manualToCity}
                        setManualToCity={setManualToCity}
                        manualPrice={manualPrice}
                        setManualPrice={setManualPrice}
                        manualCurrency={manualCurrency}
                        setManualCurrency={setManualCurrency}
                        manualDescription={manualDescription}
                        setManualDescription={setManualDescription}
                        manualPickupDrop={manualPickupDrop}
                        setManualPickupDrop={setManualPickupDrop}
                        manualAirportName={manualAirportName}
                        setManualAirportName={setManualAirportName}
                        manualTransferType={manualTransferType}
                        setManualTransferType={setManualTransferType}
                        manualVehicleType={manualVehicleType}
                        setManualVehicleType={setManualVehicleType}
                        manualVehicleCapacity={manualVehicleCapacity}
                        setManualVehicleCapacity={setManualVehicleCapacity}
                        manualPricePerPax={manualPricePerPax}
                        manualStopsList={manualStopsList}
                        handleAddStop={handleAddStop}
                        handleRemoveStop={handleRemoveStop}
                        handleStopChange={handleStopChange}
                        manualAdditionalVehicles={manualAdditionalVehicles}
                        handleAddVehicle={handleAddVehicle}
                        handleRemoveVehicle={handleRemoveVehicle}
                        handleVehicleChange={handleVehicleChange}
                        manualPickupTime={manualPickupTime}
                        setManualPickupTime={setManualPickupTime}
                        manualDropTime={manualDropTime}
                        setManualDropTime={setManualDropTime}
                        manualNoOfHours={manualNoOfHours}
                        setManualNoOfHours={setManualNoOfHours}
                        manualNoOfDays={manualNoOfDays}
                        setManualNoOfDays={setManualNoOfDays}
                        manualCarType={manualCarType}
                        setManualCarType={setManualCarType}
                        manualFuelType={manualFuelType}
                        setManualFuelType={setManualFuelType}
                        manualCarModel={manualCarModel}
                        setManualCarModel={setManualCarModel}
                        manualTransmission={manualTransmission}
                        setManualTransmission={setManualTransmission}
                        manualTravelDuration={manualTravelDuration}
                        setManualTravelDuration={setManualTravelDuration}
                        manualDepartureTime={manualDepartureTime}
                        setManualDepartureTime={setManualDepartureTime}
                        manualArrivalTime={manualArrivalTime}
                        setManualArrivalTime={setManualArrivalTime}
                        manualClass={manualClass}
                        setManualClass={setManualClass}
                        manualBusNumber={manualBusNumber}
                        setManualBusNumber={setManualBusNumber}
                        manualTrainNumber={manualTrainNumber}
                        setManualTrainNumber={setManualTrainNumber}
                        manualPnr={manualPnr}
                        setManualPnr={setManualPnr}
                        manualRefundable={manualRefundable}
                        setManualRefundable={setManualRefundable}
                        manualLink={manualLink}
                        setManualLink={setManualLink}
                        manualAmenities={manualAmenities}
                        setManualAmenities={setManualAmenities}
                      />
                    </div>
                  )}
                </div>
              ) : componentType.toLowerCase() === "ancillaries" ? (
                /* Ancillaries Component - Show Subcategory Selection */
                <div className="space-y-4">
                  {/* Subcategory Selection */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Sub-Category</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {ancillariesSubCategories.map((subCat) => (
                        <button
                          key={subCat.id}
                          onClick={() => setSelectedSubCategory(subCat.id)}
                          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${selectedSubCategory === subCat.id
                            ? "bg-black text-white border-black"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                            }`}
                        >
                          <span className="text-2xl mb-2">{subCat.icon}</span>
                          <span className="text-xs text-center font-medium">{subCat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Show form fields only if subcategory is selected */}
                  {selectedSubCategory && (
                    <div className="space-y-4">
                      {/* ANCILLARIES FORMS - Visa, Forex, Travel Insurance */}
                      <AncillariesForms
                        selectedSubCategory={selectedSubCategory}
                        manualTitle={manualTitle}
                        setManualTitle={setManualTitle}
                        manualPrice={manualPrice}
                        setManualPrice={setManualPrice}
                        manualCurrency={manualCurrency}
                        setManualCurrency={setManualCurrency}
                        manualCountry={manualCountry}
                        setManualCountry={setManualCountry}
                        manualVisaType={manualVisaType}
                        setManualVisaType={setManualVisaType}
                        manualVisaDuration={manualVisaDuration}
                        setManualVisaDuration={setManualVisaDuration}
                        manualServiceFee={manualServiceFee}
                        setManualServiceFee={setManualServiceFee}
                        manualTotalFee={manualTotalFee}
                        manualLengthOfStay={manualLengthOfStay}
                        setManualLengthOfStay={setManualLengthOfStay}
                        manualEntryMethod={manualEntryMethod}
                        setManualEntryMethod={setManualEntryMethod}
                        manualDepartureDate={manualDepartureDate}
                        setManualDepartureDate={setManualDepartureDate}
                        manualReturnDate={manualReturnDate}
                        setManualReturnDate={setManualReturnDate}
                        manualForexCurrency={manualForexCurrency}
                        setManualForexCurrency={setManualForexCurrency}
                        manualBaseCurrency={manualBaseCurrency}
                        setManualBaseCurrency={setManualBaseCurrency}
                        manualAmount={manualAmount}
                        setManualAmount={setManualAmount}
                        manualDestinations={manualDestinations}
                        handleAddDestination={handleAddDestination}
                        handleRemoveDestination={handleRemoveDestination}
                        handleDestinationChange={handleDestinationChange}
                        manualStartDate={manualStartDate}
                        setManualStartDate={setManualStartDate}
                        manualEndDate={manualEndDate}
                        setManualEndDate={setManualEndDate}
                        manualNoOfTravellers={manualNoOfTravellers}
                        setManualNoOfTravellers={setManualNoOfTravellers}
                        manualInsuranceType={manualInsuranceType}
                        setManualInsuranceType={setManualInsuranceType}
                        manualNotes={manualNotes}
                        setManualNotes={setManualNotes}
                        manualSumInsured={manualSumInsured}
                        setManualSumInsured={setManualSumInsured}
                      />
                    </div>
                  )}
                </div>
              ) : (componentType.toLowerCase() === "additionalinformation" || componentType.toLowerCase().includes("ancill")) ? (
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
              ) : componentType.toLowerCase() === "note" ? (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Note Content</label>
                    <Textarea
                      value={manualNoteContent}
                      onChange={(e) => setManualNoteContent(e.target.value)}
                      placeholder="Enter your note here..."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              ) : componentType.toLowerCase() === "meal" ? (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Select Meal Options (Multi-select)</label>
                    <div className="space-y-2">
                      {mealOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={option.id}
                            checked={manualMeals.includes(option.id)}
                            onChange={() => handleMealToggle(option.id)}
                            className="rounded"
                          />
                          <label htmlFor={option.id} className="text-sm cursor-pointer">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  {manualMeals.includes("others") && (
                    <div className="grid gap-2">
                      <label htmlFor="customMealDescription" className="text-sm font-medium">
                        Please specify
                      </label>
                      <Input
                        id="customMealDescription"
                        value={manualCustomMealDescription}
                        onChange={(e) => setManualCustomMealDescription(e.target.value)}
                        placeholder="Enter custom meal description..."
                        className="input-field"
                      />
                    </div>
                  )}
                  <div className="grid gap-2">
                    <label htmlFor="manualPrice" className="text-sm font-medium">
                      Price
                    </label>
                    <div className="flex gap-2">
                      <Select value={manualCurrency} onValueChange={setManualCurrency}>
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="AED">AED (د.إ)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        id="manualPrice"
                        type="number"
                        value={manualPrice}
                        onChange={(e) => setManualPrice(Number(e.target.value) || "")}
                        placeholder="0.00"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              ) : componentType.toLowerCase() === "flight" ? (
                <div className="space-y-4">
                  {/* Mandatory Fields */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Mandatory Fields
                    </h4>
                    <div className="space-y-4 pl-4 border-l-2 border-red-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">From</label>
                          <Input value={manualFromCity} onChange={(e) => setManualFromCity(e.target.value)} placeholder="Origin" />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">To</label>
                          <Input value={manualToCity} onChange={(e) => setManualToCity(e.target.value)} placeholder="Destination" />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Flight Duration</label>
                        <Input value={manualDuration} onChange={(e) => setManualDuration(e.target.value)} placeholder="e.g. 2h 30m" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Airline Name</label>
                        <Input value={manualAirline} onChange={(e) => setManualAirline(e.target.value)} placeholder="e.g. Emirates" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Class</label>
                        <Input value={manualClass} onChange={(e) => setManualClass(e.target.value)} placeholder="e.g. Economy" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Price</label>
                        <div className="flex gap-2">
                          <Select value={manualCurrency} onValueChange={setManualCurrency}>
                            <SelectTrigger className="w-[100px]">
                              <SelectValue placeholder="Currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="INR">INR (₹)</SelectItem>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="EUR">EUR (€)</SelectItem>
                              <SelectItem value="GBP">GBP (£)</SelectItem>
                              <SelectItem value="AED">AED (د.إ)</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input type="number" value={manualPrice} onChange={(e) => setManualPrice(Number(e.target.value) || "")} placeholder="0.00" className="flex-1" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">Departure Time</label>
                          <Input type="time" value={manualTime} onChange={(e) => setManualTime(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">Arrival Time</label>
                          <Input type="time" value={manualEndTime} onChange={(e) => setManualEndTime(e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Optional Fields */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                      Optional Fields
                    </h4>
                    <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Check in, cabin luggage</label>
                        <Input value={manualBaggage} onChange={(e) => setManualBaggage(e.target.value)} placeholder="e.g. 20kg check-in, 7kg cabin" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Flight Title</label>
                        <Input value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} placeholder="e.g. Flight to Paris" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Stops</label>
                        <Input value={manualStops} onChange={(e) => setManualStops(e.target.value)} placeholder="e.g. Non-stop" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Flight No.</label>
                        <Input value={manualFlightNumber} onChange={(e) => setManualFlightNumber(e.target.value)} placeholder="e.g. EK123" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">PNR Number</label>
                        <Input value={manualPnr} onChange={(e) => setManualPnr(e.target.value)} placeholder="Enter PNR" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Amenities</label>
                        <div className="space-y-2">
                          {manualAmenities.map((a, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Input value={a} onChange={(e) => handleManualAmenitiesChange(idx, e.target.value)} placeholder="Add amenity" />
                              <Button variant="ghost" size="sm" onClick={() => handleRemoveManualAmenity(idx)}>Remove</Button>
                            </div>
                          ))}
                          <Button size="sm" onClick={handleAddManualAmenity} variant="outline">Add Amenity</Button>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Refundable / Non refundable</label>
                        <Input value={manualRefundable} onChange={(e) => setManualRefundable(e.target.value)} placeholder="e.g. Refundable" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Description</label>
                        <Input value={manualDescription} onChange={(e) => setManualDescription(e.target.value)} placeholder="Add description" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : componentType.toLowerCase() === "hotel" ? (
                <div className="space-y-4">
                  {/* Mandatory Fields */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Mandatory Fields
                    </h4>
                    <div className="space-y-4 pl-4 border-l-2 border-red-200">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Hotel Title</label>
                        <Input value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} placeholder="Title for Hotel" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Room Type</label>
                        <Input value={manualRoomCategory} onChange={(e) => setManualRoomCategory(e.target.value)} placeholder="e.g. Deluxe" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Location</label>
                        <Input value={manualLocation} onChange={(e) => setManualLocation(e.target.value)} placeholder="City / Area" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Hotel rating(stars)</label>
                        <Input type="number" value={manualHotelRating as any} onChange={(e) => setManualHotelRating(Number(e.target.value) || "")} placeholder="e.g. 5" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Price</label>
                        <div className="flex gap-2">
                          <Select value={manualCurrency} onValueChange={setManualCurrency}>
                            <SelectTrigger className="w-[100px]">
                              <SelectValue placeholder="Currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="INR">INR (₹)</SelectItem>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="EUR">EUR (€)</SelectItem>
                              <SelectItem value="GBP">GBP (£)</SelectItem>
                              <SelectItem value="AED">AED (د.إ)</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input type="number" value={manualPrice as any} onChange={(e) => setManualPrice(Number(e.target.value) || "")} placeholder="0.00" className="flex-1" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">No. of Adult</label>
                          <Input type="number" value={manualAdults as any} onChange={(e) => setManualAdults(Number(e.target.value) || "")} placeholder="Adults" />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">No. of Child</label>
                          <Input type="number" value={manualChildren as any} onChange={(e) => setManualChildren(Number(e.target.value) || "")} placeholder="Children" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Optional Fields */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                      Optional Fields
                    </h4>
                    <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">No. of Nights</label>
                        <Input type="number" value={manualNights as any} onChange={(e) => setManualNights(Number(e.target.value) || "")} placeholder="No. of nights" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">Checkin date</label>
                          <Input type="date" value={manualCheckIn} onChange={(e) => setManualCheckIn(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">Check out date</label>
                          <Input type="date" value={manualCheckOut} onChange={(e) => setManualCheckOut(e.target.value)} />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Property Type</label>
                        <Input value={manualPropertyType} onChange={(e) => setManualPropertyType(e.target.value)} placeholder="e.g. Resort, Villa" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Amenities</label>
                        <div className="space-y-2">
                          {manualAmenities.map((a, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Input value={a} onChange={(e) => handleManualAmenitiesChange(idx, e.target.value)} placeholder="Add amenity" />
                              <Button variant="ghost" size="sm" onClick={() => handleRemoveManualAmenity(idx)}>Remove</Button>
                            </div>
                          ))}
                          <Button size="sm" onClick={handleAddManualAmenity} variant="outline">Add Amenity</Button>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Tags</label>
                        <div className="space-y-2">
                          {manualHighlights.map((h, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Input value={h} onChange={(e) => handleManualHighlightsChange(idx, e.target.value)} placeholder="Add tag" />
                              <Button variant="ghost" size="sm" onClick={() => handleRemoveManualHighlight(idx)}>Remove</Button>
                            </div>
                          ))}
                          <Button size="sm" onClick={handleAddManualHighlight} variant="outline">Add Tag</Button>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Image (Media Add)</label>
                        <Input value={manualImageUrl} onChange={(e) => setManualImageUrl(e.target.value)} placeholder="Image URL" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Refundable Non refundable</label>
                        <Input value={manualRefundable} onChange={(e) => setManualRefundable(e.target.value)} placeholder="e.g. Refundable" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Address</label>
                        <Input value={manualAddress} onChange={(e) => setManualAddress(e.target.value)} placeholder="Full address" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Hotel Link</label>
                        <Input value={manualHotelLink} onChange={(e) => setManualHotelLink(e.target.value)} placeholder="https://..." />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Description</label>
                        <Input value={manualDescription} onChange={(e) => setManualDescription(e.target.value)} placeholder="Description (optional)" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Confirmation No.</label>
                        <Input value={manualConfirmationNumber} onChange={(e) => setManualConfirmationNumber(e.target.value)} placeholder="Confirmation Number" />
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
                            <div className="flex gap-2">
                              <Select value={manualCurrency} onValueChange={setManualCurrency}>
                                <SelectTrigger className="w-[100px]">
                                  <SelectValue placeholder="Currency" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="INR">INR (₹)</SelectItem>
                                  <SelectItem value="USD">USD ($)</SelectItem>
                                  <SelectItem value="EUR">EUR (€)</SelectItem>
                                  <SelectItem value="GBP">GBP (£)</SelectItem>
                                  <SelectItem value="AED">AED (د.إ)</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input type="number" value={manualPrice as any} onChange={(e) => setManualPrice(Number(e.target.value) || "")} placeholder="Per person" className="flex-1" />
                            </div>
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
                            <div className="flex gap-2">
                              <Select value={manualCurrency} onValueChange={setManualCurrency}>
                                <SelectTrigger className="w-[100px]">
                                  <SelectValue placeholder="Currency" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="INR">INR (₹)</SelectItem>
                                  <SelectItem value="USD">USD ($)</SelectItem>
                                  <SelectItem value="EUR">EUR (€)</SelectItem>
                                  <SelectItem value="GBP">GBP (£)</SelectItem>
                                  <SelectItem value="AED">AED (د.إ)</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input type="number" value={manualPrice as any} onChange={(e) => setManualPrice(Number(e.target.value) || "")} placeholder="Total price" className="flex-1" />
                            </div>
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
                setManualMeals([])
                setManualCustomMealDescription("")
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
    </Dialog >
  )
}
