"use client"

import type React from "react"
import { useState, useEffect, type KeyboardEvent } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { IItineraryEvent } from "@/models/Itinerary"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, Plus, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TransferForms } from "./transfer-forms"
import { OthersForms } from "./others-forms"
import { AncillariesForms } from "./ancillaries-forms"

interface EditEventModalProps {
  event: IItineraryEvent | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedEvent: IItineraryEvent) => void
}

interface ValidationErrors {
  [key: string]: string
}

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

// Helper function to calculate flight duration
const calculateFlightDuration = (startTime: string, endTime: string): string => {
  if (!startTime || !endTime) return ""

  try {
    // Parse times (format: "HH:MM")
    const [startHour, startMin] = startTime.split(":").map(Number)
    const [endHour, endMin] = endTime.split(":").map(Number)

    // Convert to minutes since midnight
    let startMinutes = startHour * 60 + startMin
    let endMinutes = endHour * 60 + endMin

    // If end time is earlier than start time, assume next day
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60
    }

    // Calculate duration in minutes
    const durationMinutes = endMinutes - startMinutes
    const hours = Math.floor(durationMinutes / 60)
    const minutes = durationMinutes % 60

    // Format output
    if (hours === 0) {
      return `${minutes}m`
    } else if (minutes === 0) {
      return `${hours}h`
    } else {
      return `${hours}h ${minutes}m`
    }
  } catch (error) {
    return ""
  }
}

export function EditEventModal({ event, isOpen, onClose, onSave }: EditEventModalProps) {
  const [editedEvent, setEditedEvent] = useState<IItineraryEvent>(() => {
    if (!event) return {} as IItineraryEvent
    return {
      ...event,
      title: event?.title || "",
      description: event?.description || "",
      location: event?.location || "",
      time: event?.time || "",
      fromCity: event?.fromCity || "",
      toCity: event?.toCity || "",
      mainPoint: event?.mainPoint || "",
      checkIn: event?.checkIn || "",
      checkOut: event?.checkOut || "",
      duration: event?.duration || "",
      difficulty: event?.difficulty || "Easy",
      imageUrl: event?.imageUrl || "",
      imageCaption: event?.imageCaption || "",
      imageAlt: event?.imageAlt || "",
      price: event?.price ? Number(event.price) : 0,
      capacity: event?.capacity ? Number(event.capacity) : 0,
      nights: event?.nights ? Number(event.nights) : 0,
      highlights: event?.highlights ? [...event.highlights] : [],
      listItems: event?.listItems ? [...event.listItems] : [],
      meals: event?.meals ? [...event.meals] : [],
      customMealDescription: event?.customMealDescription || "",
      hotelName: event?.hotelName || "",
      roomCategory: event?.roomCategory || "",
      hotelRating: event?.hotelRating || 0,
      mealPlan: event?.mealPlan || "",
      hotelNotes: event?.hotelNotes || "",
      additionalInfoSections: event?.additionalInfoSections ? [...event.additionalInfoSections] : [],
      amenities: event?.amenities ? [...event.amenities] : [],
      subCategory: event?.subCategory || "",
    };
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isValidating, setIsValidating] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [newAmenity, setNewAmenity] = useState("")

  useEffect(() => {
    if (event) {
      setEditedEvent({
        ...event,
        title: event?.title || "",
        description: event?.description || "",
        location: event?.location || "",
        time: event?.time || "",
        fromCity: event?.fromCity || "",
        toCity: event?.toCity || "",
        mainPoint: event?.mainPoint || "",
        checkIn: event?.checkIn || "",
        checkOut: event?.checkOut || "",
        duration: event?.duration || "",
        difficulty: event?.difficulty || "Easy",
        imageUrl: event?.imageUrl || "",
        imageCaption: event?.imageCaption || "",
        imageAlt: event?.imageAlt || "",
        price: event?.price ? Number(event.price) : 0,
        currency: event?.currency || "INR", // Default to INR if missing
        capacity: event?.capacity ? Number(event.capacity) : 0,
        nights: event?.nights ? Number(event.nights) : 0,
        highlights: event?.highlights ? [...event.highlights] : [],
        listItems: event?.listItems ? [...event.listItems] : [],
        meals: event?.meals ? [...event.meals] : [],
        customMealDescription: event?.customMealDescription || "",
        hotelName: event?.hotelName || "",
        roomCategory: event?.roomCategory || "",
        hotelRating: event?.hotelRating || 0,
        mealPlan: event?.mealPlan || "",
        hotelNotes: event?.hotelNotes || "",
        additionalInfoSections: event?.additionalInfoSections ? [...event.additionalInfoSections] : [],
        amenities: event?.amenities ? [...event.amenities] : [],
        subCategory: event?.subCategory || "",
        // Flight specific
        baggage: event?.baggage || "", // Legacy field
        stops: event?.stops || "", // Legacy field
        pnr: event?.pnr || "",
        refundable: event?.refundable || "",
        flightNumber: event?.flightNumber || "",
        airlines: event?.airlines || "",
        flightClass: event?.flightClass || "",
        endTime: event?.endTime || "",
        startTime: event?.startTime || event?.time || "",
        // Flight luggage - granular fields
        checkinBags: event?.checkinBags || 0,
        checkinBagWeight: event?.checkinBagWeight || "",
        cabinBags: event?.cabinBags || 0,
        cabinBagWeight: event?.cabinBagWeight || "",
        // Flight stops - structured data
        numberOfStops: event?.numberOfStops || 0,
        stopLocations: event?.stopLocations ? [...event.stopLocations] : [],
        // Hotel specific
        adults: event?.adults ? Number(event.adults) : 0,
        children: event?.children ? Number(event.children) : 0,
        propertyType: event?.propertyType || "",
        address: event?.address || "",
        hotelLink: event?.hotelLink || "",
        confirmationNumber: event?.confirmationNumber || "",
        // Transfer specific
        fromLocation: event?.fromLocation || "",
        toLocation: event?.toLocation || "",
        vehicleType: event?.vehicleType || "",
        transferType: event?.transferType || "private",
        transferCategory: event?.transferCategory || "",
        airportName: event?.airportName || "",
        pickupDrop: event?.pickupDrop || "pickup",
        pickupTime: event?.pickupTime || "",
        dropTime: event?.dropTime || "",
        noOfHours: event?.noOfHours || 0,
        noOfDays: event?.noOfDays || 0,
        fuelType: event?.fuelType || "",
        carModel: event?.carModel || "",
        transmission: event?.transmission || "",
        busNumber: event?.busNumber || "",
        trainNumber: event?.trainNumber || "",
        transferClass: event?.transferClass || "",
        transferLink: event?.transferLink || "",
        stopsList: event?.stopsList ? [...event.stopsList] : [],
        additionalVehicles: event?.additionalVehicles ? [...event.additionalVehicles] : [],
      })
      setValidationErrors({})
    }
  }, [event])

  if (!event) return null

  const isManualSource = !event.componentSource || event.componentSource === "manual"

  const validateField = (fieldName: string, value: any): string => {
    if (isManualSource && fieldName !== "title") {
      return ""
    }

    switch (fieldName) {
      case "title":
        if (!value || value.trim().length === 0) return "Title is required"
        if (value.trim().length < 2) return "Title must be at least 2 characters"
        if (value.trim().length > 100) return "Title must be less than 100 characters"
        return ""

      case "description":
        if (!["activity", "transfer", "image"].includes(event.category) || isManualSource) {
          return ""
        }
        if (!value || value.trim().length === 0) return "Description is required"
        if (value.trim().length < 5) return "Description must be at least 5 characters"
        if (value.trim().length > 500) return "Description must be less than 500 characters"
        return ""

      case "fromCity":
        if (value && value.trim().length > 0 && value.trim().length < 2)
          return "City name must be at least 2 characters"
        return ""

      case "toCity":
        if (value && value.trim().length > 0 && value.trim().length < 2)
          return "City name must be at least 2 characters"
        return ""

      case "location":
        if (["activity", "hotel"].includes(event.category) && (!value || value.trim().length === 0))
          return "Location is required"
        return ""

      case "duration":
        if (event.category === "activity" && (!value || value.trim().length === 0)) return "Duration is required"
        return ""

      case "capacity":
        if (event.category === "activity") {
          if (!value || value <= 0) return "Capacity must be greater than 0"
          if (value > 1000) return "Capacity cannot exceed 1000"
        }
        return ""

      case "nights":
        if (event.category === "hotel") {
          if (!value || value <= 0) return "Number of nights must be greater than 0"
          if (value > 365) return "Number of nights cannot exceed 365"
        }
        return ""

      case "price":
        if (value < 0) return "Price cannot be negative"
        if (value > 1000000) return "Price cannot exceed $1,000,000"
        return ""

      case "imageUrl":
        if (event.category === "image" && (!value || value.trim().length === 0)) return "Image URL is required"
        if (value && value.trim().length > 0) {
          try {
            new URL(value)
          } catch {
            // Check if it's a data URL (base64)
            if (!value.startsWith("data:image/")) {
              return "Please enter a valid URL or upload an image"
            }
          }
        }
        return ""

      case "imageAlt":
        if (event.category === "image" && (!value || value.trim().length === 0))
          return "Alt text is required for accessibility"
        return ""

      case "time":
        if (value && value.trim().length > 0) {
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
          if (!timeRegex.test(value)) return "Please enter a valid time (HH:MM)"
        }
        return ""

      case "checkIn":
      case "checkOut":
        if (event.category === "hotel" && value && value.trim().length > 0) {
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
          if (!timeRegex.test(value)) return "Please enter a valid time (HH:MM)"
        }
        return ""

      default:
        return ""
    }
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    setEditedEvent({ ...editedEvent, [fieldName]: value })

    // Real-time validation
    const error = validateField(fieldName, value)
    setValidationErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }))
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    // Validate all fields based on event category
    const fieldsToValidate = ["title"]

    if (!isManualSource && typeof editedEvent.price !== "undefined") {
      fieldsToValidate.push("price")
    }

    if (!isManualSource && ["activity", "transfer", "image"].includes(event.category)) {
      fieldsToValidate.push("description")
    }

    if (!isManualSource && event.category === "flight") {
      // Only validate origin/destination if provided
      if (editedEvent.fromCity) {
        fieldsToValidate.push("fromCity")
      }
      if (editedEvent.toCity) {
        fieldsToValidate.push("toCity")
      }
    }

    if (!isManualSource && event.category === "activity") {
      fieldsToValidate.push("location", "duration", "capacity")
    }

    if (!isManualSource && event.category === "hotel") {
      fieldsToValidate.push("location", "nights", "hotelName", "roomCategory", "hotelRating", "mealPlan")
    }

    if (!isManualSource && event.category === "image") {
      fieldsToValidate.push("imageUrl", "imageAlt")
    }

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, editedEvent[field as keyof IItineraryEvent])
      if (error) {
        errors[field] = error
      }
    })

    // Additional cross-field validation
    if (!isManualSource && event.category === "hotel" && editedEvent.checkIn && editedEvent.checkOut) {
      const checkInTime = new Date(`2000-01-01T${editedEvent.checkIn}:00`)
      const checkOutTime = new Date(`2000-01-01T${editedEvent.checkOut}:00`)

      if (checkInTime >= checkOutTime) {
        errors.checkOut = "Check-out time must be after check-in time"
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddTag = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault()
      if (newTag.trim().length < 2) {
        setValidationErrors((prev) => ({ ...prev, newTag: "Tag must be at least 2 characters" }))
        return
      }
      if (newTag.trim().length > 50) {
        setValidationErrors((prev) => ({ ...prev, newTag: "Tag must be less than 50 characters" }))
        return
      }

      if (!editedEvent.highlights) {
        setEditedEvent({ ...editedEvent, highlights: [newTag.trim()] })
      } else if (!editedEvent.highlights.includes(newTag.trim())) {
        if (editedEvent.highlights.length >= 10) {
          setValidationErrors((prev) => ({ ...prev, newTag: "Maximum 10 highlights allowed" }))
          return
        }
        setEditedEvent({
          ...editedEvent,
          highlights: [...editedEvent.highlights, newTag.trim()],
        })
      }
      setNewTag("")
      setValidationErrors((prev) => ({ ...prev, newTag: "" }))
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedEvent({
      ...editedEvent,
      highlights: editedEvent.highlights?.filter((tag) => tag !== tagToRemove) || [],
    })
  }

  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>, field: "price" | "nights" | "capacity") => {
    const value = e.target.value
    if (value === "") {
      handleFieldChange(field, 0)
      return
    }
    const num = Number(value)
    if (!isNaN(num)) {
      handleFieldChange(field, num)
    }
  }

  const handleSave = () => {
    setIsValidating(true)

    if (!validateForm()) {
      setIsValidating(false)
      return
    }

    const updatedEvent: IItineraryEvent = {
      ...editedEvent,
      price: editedEvent.price || 0,
      currency: editedEvent.currency || "INR",
      nights: editedEvent.nights || 0,
      capacity: editedEvent.capacity || 0,
      highlights: editedEvent.highlights ? [...editedEvent.highlights] : [],
      listItems: editedEvent.listItems ? [...editedEvent.listItems] : [],
      meals: editedEvent.meals ? [...editedEvent.meals] : [],
      additionalInfoSections: editedEvent.additionalInfoSections ? [...editedEvent.additionalInfoSections] : [],
      amenities: editedEvent.amenities ? [...editedEvent.amenities] : [],
      subCategory: editedEvent.subCategory,
      // Flight specific
      baggage: editedEvent.baggage, // Legacy field
      stops: editedEvent.stops, // Legacy field
      pnr: editedEvent.pnr,
      refundable: editedEvent.refundable,
      flightNumber: editedEvent.flightNumber,
      airlines: editedEvent.airlines,
      flightClass: editedEvent.flightClass,
      endTime: editedEvent.endTime,
      startTime: editedEvent.startTime || editedEvent.time,
      // Flight luggage - granular fields
      checkinBags: editedEvent.checkinBags,
      checkinBagWeight: editedEvent.checkinBagWeight,
      cabinBags: editedEvent.cabinBags,
      cabinBagWeight: editedEvent.cabinBagWeight,
      // Flight stops - structured data
      numberOfStops: editedEvent.numberOfStops,
      stopLocations: editedEvent.stopLocations ? [...editedEvent.stopLocations] : [],
      // Calculate and update flight duration
      duration: event.category === "flight" && editedEvent.startTime && editedEvent.endTime
        ? calculateFlightDuration(editedEvent.startTime, editedEvent.endTime)
        : editedEvent.duration,
      // Hotel specific
      adults: editedEvent.adults,
      children: editedEvent.children,
      propertyType: editedEvent.propertyType,
      address: editedEvent.address,
      hotelLink: editedEvent.hotelLink,
      confirmationNumber: editedEvent.confirmationNumber,
      // Transfer specific
      fromLocation: editedEvent.fromLocation,
      toLocation: editedEvent.toLocation,
      vehicleType: editedEvent.vehicleType,
      transferType: editedEvent.transferType,
      transferCategory: editedEvent.transferCategory,
      airportName: editedEvent.airportName,
      pickupDrop: editedEvent.pickupDrop,
      pickupTime: editedEvent.pickupTime,
      dropTime: editedEvent.dropTime,
      noOfHours: editedEvent.noOfHours,
      noOfDays: editedEvent.noOfDays,
      fuelType: editedEvent.fuelType,
      carModel: editedEvent.carModel,
      transmission: editedEvent.transmission,
      busNumber: editedEvent.busNumber,
      trainNumber: editedEvent.trainNumber,
      transferClass: editedEvent.transferClass,
      transferLink: editedEvent.transferLink,
      stopsList: editedEvent.stopsList ? [...editedEvent.stopsList] : [],
      additionalVehicles: editedEvent.additionalVehicles ? [...editedEvent.additionalVehicles] : [],
      libraryItemId: event?.libraryItemId,
      componentSource: event?.componentSource || "manual"
    }
    onSave(updatedEvent)
    onClose()
    setIsValidating(false)
  }

  const renderFieldWithValidation = (fieldName: string, label: string, input: React.ReactNode, required = false) => (
    <div className="grid gap-2">
      <Label htmlFor={fieldName} className={required ? "after:content-['*'] after:text-red-500 after:ml-1" : ""}>
        {label}
      </Label>
      {input}
      {validationErrors[fieldName] && (
        <div className="flex items-center gap-1 text-red-500 text-sm">
          <AlertCircle className="h-3 w-3" />
          <span>{validationErrors[fieldName]}</span>
        </div>
      )}
    </div>
  )

  const renderFields = () => {
    // Simple text-only interface for notes
    if (event.category === "note") {
      return (
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="description">Note</Label>
            <Textarea
              id="description"
              value={editedEvent.description || ""}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder="Enter your note here..."
              className="min-h-[200px]"
              rows={10}
            />
          </div>
        </div>
      )
    }

    switch (event.category) {
      case "others":
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Sub-Category</h4>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleFieldChange('subCategory', 'gift-cards')}
                  className={`py-2 px-3 rounded-lg border-2 ${((editedEvent as any).subCategory || 'gift-cards') === 'gift-cards' ? 'bg-black text-white border-black' : 'bg-white border-gray-200'}`}>
                  Gift Cards
                </button>
                <button
                  type="button"
                  onClick={() => handleFieldChange('subCategory', 'travel-gears')}
                  className={`py-2 px-3 rounded-lg border-2 ${((editedEvent as any).subCategory || 'gift-cards') === 'travel-gears' ? 'bg-black text-white border-black' : 'bg-white border-gray-200'}`}>
                  Travel Gears
                </button>
              </div>
            </div>

            <OthersForms
              selectedSubCategory={(editedEvent as any).subCategory || 'gift-cards'}
              manualTitle={editedEvent.title || ''}
              setManualTitle={(v) => handleFieldChange("title", v)}
              manualCurrency={editedEvent.currency || 'INR'}
              setManualCurrency={(v) => handleFieldChange("currency", v)}
              manualGiftAmount={editedEvent.price || ''}
              setManualGiftAmount={(v) => handleFieldChange("price", v)}
              manualServiceCharge={(editedEvent as any).serviceCharge || ''}
              setManualServiceCharge={(v) => handleFieldChange("serviceCharge", v)}
              manualProducts={(editedEvent as any).travelGears || []}
              handleAddProduct={() => {
                const copy = [...((editedEvent as any).travelGears || [])]
                copy.push({ name: '', price: '', description: '', currency: 'INR' })
                handleFieldChange('travelGears', copy)
              }}
              handleRemoveProduct={(idx) => {
                const copy = [...((editedEvent as any).travelGears || [])]
                copy.splice(idx, 1)
                handleFieldChange('travelGears', copy)
              }}
              handleProductChange={(idx, field, value) => {
                const copy = [...((editedEvent as any).travelGears || [])]
                copy[idx] = { ...copy[idx], [field]: value }
                handleFieldChange('travelGears', copy)
              }}
              errors={validationErrors}
            />
          </div>
        )
      case "flight":
        return (
          <>
            <div className="space-y-4">
              {/* Mandatory Fields */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Mandatory Fields
                </h4>
                <div className="space-y-4 pl-4 border-l-2 border-red-200">
                  <div className="grid grid-cols-2 gap-4">
                    {renderFieldWithValidation("fromCity", "From", <Input id="fromCity" value={editedEvent.fromCity || ""} onChange={(e) => handleFieldChange("fromCity", e.target.value)} placeholder="Origin" />, true)}
                    {renderFieldWithValidation("toCity", "To", <Input id="toCity" value={editedEvent.toCity || ""} onChange={(e) => handleFieldChange("toCity", e.target.value)} placeholder="Destination" />, true)}
                  </div>
                  {renderFieldWithValidation("duration", "Flight Duration (Auto-calculated)",
                    <Input
                      id="duration"
                      value={calculateFlightDuration(editedEvent.startTime || editedEvent.time || "", editedEvent.endTime || "") || "Enter times to calculate"}
                      readOnly
                      placeholder="Calculated from departure & arrival"
                      className="bg-gray-50 cursor-not-allowed"
                    />, true)}
                  {renderFieldWithValidation("airlines", "Airline Name", <Input id="airlines" value={editedEvent.airlines || ""} onChange={(e) => handleFieldChange("airlines", e.target.value)} placeholder="e.g. Emirates" />, true)}
                  {renderFieldWithValidation("flightClass", "Class", <Input id="flightClass" value={editedEvent.flightClass || ""} onChange={(e) => handleFieldChange("flightClass", e.target.value)} placeholder="e.g. Economy" />, true)}
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price</Label>
                    <div className="flex gap-2">
                      <Select value={editedEvent.currency || "INR"} onValueChange={(value) => handleFieldChange("currency", value)}>
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
                        id="price"
                        type="number"
                        value={editedEvent.price || ""}
                        onChange={(e) => handleNumericInput(e, "price")}
                        placeholder="0.00"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {renderFieldWithValidation("time", "Departure Time", <Input id="time" type="time" value={editedEvent.time || ""} onChange={(e) => handleFieldChange("time", e.target.value)} />, true)}
                    {renderFieldWithValidation("endTime", "Arrival Time", <Input id="endTime" type="time" value={editedEvent.endTime || ""} onChange={(e) => handleFieldChange("endTime", e.target.value)} />, true)}
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="checkinBags">Check-in Luggage</Label>
                      <div className="flex gap-2">
                        <Input
                          id="checkinBags"
                          type="number"
                          placeholder="Count"
                          value={editedEvent.checkinBags !== undefined ? editedEvent.checkinBags : ""}
                          onChange={(e) => handleFieldChange("checkinBags", e.target.value === "" ? undefined : Number(e.target.value))}
                          min={0}
                          className="w-20"
                        />
                        <Input
                          id="checkinBagWeight"
                          placeholder="Weight (e.g. 23kg)"
                          value={editedEvent.checkinBagWeight || ""}
                          onChange={(e) => handleFieldChange("checkinBagWeight", e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cabinBags">Cabin Luggage</Label>
                      <div className="flex gap-2">
                        <Input
                          id="cabinBags"
                          type="number"
                          placeholder="Count"
                          value={editedEvent.cabinBags !== undefined ? editedEvent.cabinBags : ""}
                          onChange={(e) => handleFieldChange("cabinBags", e.target.value === "" ? undefined : Number(e.target.value))}
                          min={0}
                          className="w-20"
                        />
                        <Input
                          id="cabinBagWeight"
                          placeholder="Weight (e.g. 7kg)"
                          value={editedEvent.cabinBagWeight || ""}
                          onChange={(e) => handleFieldChange("cabinBagWeight", e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Flight Booking Details */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bookingId">Booking ID (Optional)</Label>
                      <Input
                        id="bookingId"
                        value={editedEvent.bookingId || ""}
                        onChange={(e) => handleFieldChange("bookingId", e.target.value)}
                        placeholder="e.g. XYZ123"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seatNumber">Seat No. (Optional)</Label>
                      <Input
                        id="seatNumber"
                        value={editedEvent.seatNumber || ""}
                        onChange={(e) => handleFieldChange("seatNumber", e.target.value)}
                        placeholder="e.g. 12A"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inFlightMeals">Meals (Optional)</Label>
                      <Input
                        id="inFlightMeals"
                        value={editedEvent.inFlightMeals || ""}
                        onChange={(e) => handleFieldChange("inFlightMeals", e.target.value)}
                        placeholder="e.g. Veg, Non-Veg"
                      />
                    </div>
                  </div>
                  {renderFieldWithValidation("title", "Flight Title", <Input id="title" value={editedEvent.title || ""} onChange={(e) => handleFieldChange("title", e.target.value)} placeholder="e.g. Flight to Paris" />)}
                  <div className="grid gap-2">
                    <Label htmlFor="numberOfStops">Number of Stops</Label>
                    <Input
                      type="number"
                      value={editedEvent.numberOfStops || 0}
                      onChange={(e) => {
                        const numStops = Number(e.target.value) || 0
                        handleFieldChange("numberOfStops", numStops)
                        // Adjust stopLocations array
                        const currentLocations = editedEvent.stopLocations || []
                        if (numStops > currentLocations.length) {
                          const newLocations = [...currentLocations]
                          while (newLocations.length < numStops) {
                            newLocations.push("")
                          }
                          handleFieldChange("stopLocations", newLocations)
                        } else if (numStops < currentLocations.length) {
                          handleFieldChange("stopLocations", currentLocations.slice(0, numStops))
                        }
                      }}
                      placeholder="0 for non-stop"
                      min="0"
                    />
                  </div>
                  {(editedEvent.numberOfStops && editedEvent.numberOfStops > 0) && (
                    <div className="grid gap-2">
                      <Label>Stop Locations</Label>
                      <div className="space-y-2">
                        {(editedEvent.stopLocations || []).map((stop, idx) => (
                          <Input
                            key={idx}
                            value={stop}
                            onChange={(e) => {
                              const newLocations = [...(editedEvent.stopLocations || [])]
                              newLocations[idx] = e.target.value
                              handleFieldChange("stopLocations", newLocations)
                            }}
                            placeholder={`Stop ${idx + 1} location (e.g. Dubai)`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {renderFieldWithValidation("flightNumber", "Flight No.", <Input id="flightNumber" value={editedEvent.flightNumber || ""} onChange={(e) => handleFieldChange("flightNumber", e.target.value)} placeholder="e.g. EK123" />)}
                  {renderFieldWithValidation("pnr", "PNR Number", <Input id="pnr" value={editedEvent.pnr || ""} onChange={(e) => handleFieldChange("pnr", e.target.value)} placeholder="Enter PNR" />)}

                  <div className="grid gap-2">
                    <Label htmlFor="amenities">Amenities</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {editedEvent.amenities?.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="px-2 py-1">
                          {tag}
                          <button onClick={() => {
                            const newAmenities = editedEvent.amenities ? editedEvent.amenities.filter(t => t !== tag) : [];
                            handleFieldChange("amenities", newAmenities);
                          }} className="ml-2 hover:text-red-500 focus:outline-none">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id="newAmenity"
                        placeholder="Add amenity"
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newAmenity.trim()) {
                              const current = editedEvent.amenities || [];
                              if (!current.includes(newAmenity.trim())) {
                                handleFieldChange("amenities", [...current, newAmenity.trim()]);
                              }
                              setNewAmenity("");
                            }
                          }
                        }}
                      />
                      <Button type="button" variant="outline" size="icon" onClick={() => {
                        if (newAmenity.trim()) {
                          const current = editedEvent.amenities || [];
                          if (!current.includes(newAmenity.trim())) {
                            handleFieldChange("amenities", [...current, newAmenity.trim()]);
                          }
                          setNewAmenity("");
                        }
                      }}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {renderFieldWithValidation("refundable", "Refundable / Non refundable", <Input id="refundable" value={editedEvent.refundable || ""} onChange={(e) => handleFieldChange("refundable", e.target.value)} placeholder="e.g. Refundable" />)}
                  {renderFieldWithValidation("description", "Description", <Input id="description" value={editedEvent.description || ""} onChange={(e) => handleFieldChange("description", e.target.value)} placeholder="Add description" />)}
                </div>
              </div>
            </div>
          </>
        )

      case "hotel":
        return (
          <div className="space-y-6">
            {/* Mandatory Fields */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Mandatory Fields
              </h4>
              <div className="space-y-4 pl-4 border-l-2 border-red-200">
                {renderFieldWithValidation(
                  "title",
                  "Hotel Title",
                  <Input
                    id="title"
                    value={editedEvent.title || ""}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    placeholder="Title for Hotel"
                    className={validationErrors.title ? "border-red-500" : ""}
                  />,
                  true
                )}
                {renderFieldWithValidation(
                  "roomCategory",
                  "Room Type",
                  <Input
                    id="roomCategory"
                    value={editedEvent.roomCategory || ""}
                    onChange={(e) => handleFieldChange("roomCategory", e.target.value)}
                    placeholder="e.g. Deluxe"
                    className={validationErrors.roomCategory ? "border-red-500" : ""}
                  />,
                  true
                )}
                {renderFieldWithValidation(
                  "location",
                  "Location",
                  <Input
                    id="location"
                    value={editedEvent.location || ""}
                    onChange={(e) => handleFieldChange("location", e.target.value)}
                    placeholder="City / Area"
                    className={validationErrors.location ? "border-red-500" : ""}
                  />,
                  true
                )}
                {renderFieldWithValidation(
                  "hotelRating",
                  "Hotel rating(stars)",
                  <Input
                    id="hotelRating"
                    type="number"
                    value={editedEvent.hotelRating || ""}
                    onChange={(e) => handleFieldChange("hotelRating", Number(e.target.value))}
                    placeholder="e.g. 5"
                    className={validationErrors.hotelRating ? "border-red-500" : ""}
                  />,
                  true
                )}
                <div className="grid gap-2">
                  <Label htmlFor="price">Price</Label>
                  <div className="flex gap-2">
                    <Select value={editedEvent.currency || "INR"} onValueChange={(value) => handleFieldChange("currency", value)}>
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
                      id="price"
                      type="number"
                      value={editedEvent.price || ""}
                      onChange={(e) => handleFieldChange("price", Number(e.target.value))}
                      placeholder="0.00"
                      className={validationErrors.price ? "border-red-500 flex-1" : "flex-1"}
                    />
                  </div>
                  {validationErrors.price && (
                    <div className="flex items-center gap-1 text-red-500 text-sm">
                      <AlertCircle className="h-3 w-3" />
                      <span>{validationErrors.price}</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {renderFieldWithValidation(
                    "adults",
                    "No. of Adult",
                    <Input
                      id="adults"
                      type="number"
                      value={editedEvent.adults || ""}
                      onChange={(e) => handleFieldChange("adults", Number(e.target.value))}
                      placeholder="Adults"
                    />
                  )}
                  {renderFieldWithValidation(
                    "children",
                    "No. of Child",
                    <Input
                      id="children"
                      type="number"
                      value={editedEvent.children || ""}
                      onChange={(e) => handleFieldChange("children", Number(e.target.value))}
                      placeholder="Children"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Optional Fields */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                Optional Fields
              </h4>
              <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                {renderFieldWithValidation(
                  "nights",
                  "No. of Nights",
                  <Input
                    id="nights"
                    type="number"
                    value={editedEvent.nights || ""}
                    onChange={(e) => handleFieldChange("nights", Number(e.target.value))}
                    placeholder="No. of nights"
                  />
                )}
                <div className="grid grid-cols-2 gap-4">
                  {renderFieldWithValidation(
                    "checkIn",
                    "Checkin date",
                    <Input
                      id="checkIn"
                      type="date"
                      value={editedEvent.checkIn || ""}
                      onChange={(e) => handleFieldChange("checkIn", e.target.value)}
                    />
                  )}
                  {renderFieldWithValidation(
                    "checkOut",
                    "Check out date",
                    <Input
                      id="checkOut"
                      type="date"
                      value={editedEvent.checkOut || ""}
                      onChange={(e) => handleFieldChange("checkOut", e.target.value)}
                    />
                  )}
                </div>
                {renderFieldWithValidation(
                  "propertyType",
                  "Property Type",
                  <Input
                    id="propertyType"
                    value={editedEvent.propertyType || ""}
                    onChange={(e) => handleFieldChange("propertyType", e.target.value)}
                    placeholder="e.g. Resort, Villa"
                  />
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amenities</label>
                  <div className="space-y-2">
                    {(editedEvent.amenities || []).map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          value={amenity}
                          onChange={(e) => {
                            const newAmenities = [...(editedEvent.amenities || [])];
                            newAmenities[idx] = e.target.value;
                            handleFieldChange("amenities", newAmenities);
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newAmenities = (editedEvent.amenities || []).filter((_, i) => i !== idx);
                            handleFieldChange("amenities", newAmenities);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add amenity"
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newAmenity.trim()) {
                              const current = editedEvent.amenities || [];
                              handleFieldChange("amenities", [...current, newAmenity.trim()]);
                              setNewAmenity("");
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (newAmenity.trim()) {
                            const current = editedEvent.amenities || [];
                            handleFieldChange("amenities", [...current, newAmenity.trim()]);
                            setNewAmenity("");
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags</label>
                  <div className="space-y-2">
                    {(editedEvent.highlights || []).map((tag, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          value={tag}
                          onChange={(e) => {
                            const newTags = [...(editedEvent.highlights || [])];
                            newTags[idx] = e.target.value;
                            handleFieldChange("highlights", newTags);
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newTags = (editedEvent.highlights || []).filter((_, i) => i !== idx);
                            handleFieldChange("highlights", newTags);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newTag.trim()) {
                              const current = editedEvent.highlights || [];
                              handleFieldChange("highlights", [...current, newTag.trim()]);
                              setNewTag("");
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (newTag.trim()) {
                            const current = editedEvent.highlights || [];
                            handleFieldChange("highlights", [...current, newTag.trim()]);
                            setNewTag("");
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
                {renderFieldWithValidation(
                  "imageUrl",
                  "Image (Media Add)",
                  <Input
                    id="imageUrl"
                    value={editedEvent.imageUrl || ""}
                    onChange={(e) => handleFieldChange("imageUrl", e.target.value)}
                    placeholder="Image URL"
                  />
                )}
                {renderFieldWithValidation(
                  "refundable",
                  "Refundable Non refundable",
                  <Input
                    id="refundable"
                    value={editedEvent.refundable || ""}
                    onChange={(e) => handleFieldChange("refundable", e.target.value)}
                    placeholder="e.g. Refundable"
                  />
                )}
                {renderFieldWithValidation(
                  "address",
                  "Address",
                  <Input
                    id="address"
                    value={editedEvent.address || ""}
                    onChange={(e) => handleFieldChange("address", e.target.value)}
                    placeholder="Full address"
                  />
                )}
                {renderFieldWithValidation(
                  "hotelLink",
                  "Hotel Link",
                  <Input
                    id="hotelLink"
                    value={editedEvent.hotelLink || ""}
                    onChange={(e) => handleFieldChange("hotelLink", e.target.value)}
                    placeholder="https://..."
                  />
                )}
                {renderFieldWithValidation(
                  "description",
                  "Description",
                  <Input
                    id="description"
                    value={editedEvent.description || ""}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    placeholder="Description (optional)"
                  />
                )}
                {renderFieldWithValidation(
                  "confirmationNumber",
                  "Confirmation No.",
                  <Input
                    id="confirmationNumber"
                    value={editedEvent.confirmationNumber || ""}
                    onChange={(e) => handleFieldChange("confirmationNumber", e.target.value)}
                    placeholder="Confirmation Number"
                  />
                )}
              </div>
            </div>
          </div>
        )

      case "transfer":
        return (
          <>
            {/* Common Fields */}
            <div className="space-y-6">
              {/* Subcategory Selection */}
              <div>
                <Label className="mb-2 block text-sm font-semibold text-gray-700">Transfer Category</Label>
                <div className="flex flex-wrap gap-2">
                  {transferSubCategories.map((subCat) => (
                    <button
                      key={subCat.id}
                      type="button"
                      onClick={() => handleFieldChange("transferCategory", subCat.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${editedEvent.transferCategory === subCat.id
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <span className="text-lg">{subCat.icon}</span>
                      <span>{subCat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Transfer Forms */}
              {editedEvent.transferCategory && (
                <TransferForms
                  selectedSubCategory={editedEvent.transferCategory}
                  // Common fields
                  manualTitle={editedEvent.title || ""}
                  setManualTitle={(val) => handleFieldChange("title", val)}
                  manualFromCity={editedEvent.fromLocation || editedEvent.fromCity || ""}
                  setManualFromCity={(val) => {
                    handleFieldChange("fromLocation", val)
                    handleFieldChange("fromCity", val)
                  }}
                  manualToCity={editedEvent.toLocation || editedEvent.toCity || ""}
                  setManualToCity={(val) => {
                    handleFieldChange("toLocation", val)
                    handleFieldChange("toCity", val)
                  }}
                  manualPrice={editedEvent.price === 0 && editedEvent.price !== 0 ? "" : (editedEvent.price ?? "")}
                  setManualPrice={(val) => handleFieldChange("price", val === "" ? 0 : val)}
                  manualCurrency={editedEvent.currency || "INR"}
                  setManualCurrency={(val) => handleFieldChange("currency", val)}
                  manualDescription={editedEvent.description || ""}
                  setManualDescription={(val) => handleFieldChange("description", val)}

                  // Airport Transfer specific
                  manualPickupDrop={(editedEvent as any).pickupDrop || "pickup"}
                  setManualPickupDrop={(val) => handleFieldChange("pickupDrop", val)}
                  manualAirportName={(editedEvent as any).airportName || ""}
                  setManualAirportName={(val) => handleFieldChange("airportName", val)}
                  manualTransferType={editedEvent.transferType || "private"}
                  setManualTransferType={(val) => handleFieldChange("transferType", val)}
                  manualVehicleType={editedEvent.vehicleType || ""}
                  setManualVehicleType={(val) => handleFieldChange("vehicleType", val)}
                  manualVehicleCapacity={editedEvent.capacity === 0 && editedEvent.capacity !== 0 ? "" : (editedEvent.capacity ?? "")}
                  setManualVehicleCapacity={(val) => handleFieldChange("capacity", val === "" ? 0 : val)}
                  manualPricePerPax={0}
                  manualStopsList={editedEvent.stopsList || []}
                  handleAddStop={() => {
                    const current = editedEvent.stopsList || []
                    handleFieldChange("stopsList", [...current, ""])
                  }}
                  handleRemoveStop={(idx) => {
                    const current = editedEvent.stopsList || []
                    handleFieldChange("stopsList", current.filter((_, i) => i !== idx))
                  }}
                  handleStopChange={(idx, val) => {
                    const current = [...(editedEvent.stopsList || [])]
                    current[idx] = val
                    handleFieldChange("stopsList", current)
                  }}
                  manualAdditionalVehicles={editedEvent.additionalVehicles || []}
                  handleAddVehicle={() => {
                    const current = editedEvent.additionalVehicles || []
                    handleFieldChange("additionalVehicles", [...current, { vehicleType: "", capacity: 4, price: 0 }])
                  }}
                  handleRemoveVehicle={(idx) => {
                    const current = editedEvent.additionalVehicles || []
                    handleFieldChange("additionalVehicles", current.filter((_, i) => i !== idx))
                  }}
                  handleVehicleChange={(idx, field, val) => {
                    const current = [...(editedEvent.additionalVehicles || [])]
                    current[idx] = { ...current[idx], [field]: val }
                    handleFieldChange("additionalVehicles", current)
                  }}

                  // Car Hire specific
                  manualPickupTime={editedEvent.pickupTime || ""}
                  setManualPickupTime={(val) => handleFieldChange("pickupTime", val)}
                  manualDropTime={editedEvent.dropTime || ""}
                  setManualDropTime={(val) => handleFieldChange("dropTime", val)}
                  manualNoOfHours={editedEvent.noOfHours === 0 && editedEvent.noOfHours !== 0 ? "" : (editedEvent.noOfHours ?? "")}
                  setManualNoOfHours={(val) => handleFieldChange("noOfHours", val === "" ? 0 : val)}
                  manualNoOfDays={editedEvent.noOfDays === 0 && editedEvent.noOfDays !== 0 ? "" : (editedEvent.noOfDays ?? "")}
                  setManualNoOfDays={(val) => handleFieldChange("noOfDays", val === "" ? 0 : val)}
                  manualCarType={editedEvent.vehicleType || ""}
                  setManualCarType={(val) => handleFieldChange("vehicleType", val)}
                  manualFuelType={editedEvent.fuelType || ""}
                  setManualFuelType={(val) => handleFieldChange("fuelType", val)}
                  manualCarModel={editedEvent.carModel || ""}
                  setManualCarModel={(val) => handleFieldChange("carModel", val)}
                  manualTransmission={(editedEvent.transmission as "automatic" | "manual" | "") || ""}
                  setManualTransmission={(val) => handleFieldChange("transmission", val)}

                  // Bus & Train specific
                  manualTravelDuration={editedEvent.duration || ""}
                  setManualTravelDuration={(val) => handleFieldChange("duration", val)}
                  manualDepartureTime={editedEvent.pickupTime || ""}
                  setManualDepartureTime={(val) => handleFieldChange("pickupTime", val)}
                  manualArrivalTime={editedEvent.dropTime || ""}
                  setManualArrivalTime={(val) => handleFieldChange("dropTime", val)}
                  manualClass={editedEvent.transferClass || ""}
                  setManualClass={(val) => handleFieldChange("transferClass", val)}
                  manualBusNumber={editedEvent.busNumber || ""}
                  setManualBusNumber={(val) => handleFieldChange("busNumber", val)}
                  manualTrainNumber={editedEvent.trainNumber || ""}
                  setManualTrainNumber={(val) => handleFieldChange("trainNumber", val)}
                  manualPnr={editedEvent.pnr || ""}
                  setManualPnr={(val) => handleFieldChange("pnr", val)}
                  manualRefundable={editedEvent.refundable || ""}
                  setManualRefundable={(val) => handleFieldChange("refundable", val)}
                  manualLink={editedEvent.transferLink || ""}
                  setManualLink={(val) => handleFieldChange("transferLink", val)}
                  manualAmenities={editedEvent.amenities || []}
                  setManualAmenities={(val) => handleFieldChange("amenities", val)}
                />
              )}
            </div>
          </>
        )

      case "activity":
        return (
          <>
            {renderFieldWithValidation(
              "title",
              "Activity Name",
              <Input
                id="title"
                value={editedEvent.title || ""}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                placeholder="Enter activity name"
                className={validationErrors.title ? "border-red-500" : ""}
              />,
              true,
            )}
            {renderFieldWithValidation(
              "description",
              "Description",
              <Textarea
                id="description"
                value={editedEvent.description || ""}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                placeholder="Activity description"
                rows={3}
                className={validationErrors.description ? "border-red-500" : ""}
              />,
              true,
            )}
            <div className="grid grid-cols-2 gap-4">
              {renderFieldWithValidation(
                "duration",
                "Duration",
                <Input
                  id="duration"
                  value={editedEvent.duration || ""}
                  onChange={(e) => handleFieldChange("duration", e.target.value)}
                  placeholder="e.g., 2 hours"
                  className={validationErrors.duration ? "border-red-500" : ""}
                />,
                true,
              )}
              {renderFieldWithValidation(
                "time",
                "Time",
                <Input
                  id="time"
                  type="time"
                  value={editedEvent.time || ""}
                  onChange={(e) => handleFieldChange("time", e.target.value)}
                  className={validationErrors.time ? "border-red-500" : ""}
                />,
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={editedEvent.difficulty || "Easy"}
                  onValueChange={(value) => handleFieldChange("difficulty", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {renderFieldWithValidation(
                "capacity",
                "Max Capacity",
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  max="1000"
                  value={editedEvent.capacity || ""}
                  onChange={(e) => handleNumericInput(e, "capacity")}
                  placeholder="20"
                  className={validationErrors.capacity ? "border-red-500" : ""}
                />,
                true,
              )}
            </div>
            {renderFieldWithValidation(
              "location",
              "Location",
              <Input
                id="location"
                value={editedEvent.location || ""}
                onChange={(e) => handleFieldChange("location", e.target.value)}
                placeholder="Activity location"
                className={validationErrors.location ? "border-red-500" : ""}
              />,
              true,
            )}
            {/* ... existing highlights code ... */}
          </>
        )

      case "meal":
        const mealOptions = [
          { id: "breakfast", label: "Breakfast" },
          { id: "lunch", label: "Lunch" },
          { id: "dinner", label: "Dinner" },
          { id: "highTea", label: "High Tea" },
          { id: "halfBoard", label: "Half Board (Breakfast + Lunch or Dinner)" },
          { id: "fullBoard", label: "Full Board (Breakfast + Lunch + Dinner)" },
          { id: "allInclusive", label: "All inclusive (All meals + snacks and drinks*)" },
          { id: "others", label: "Others" },
        ];

        const handleMealToggle = (mealId: string) => {
          const currentMeals = Array.isArray(editedEvent.meals) ? editedEvent.meals : [];
          const isSelected = currentMeals.includes(mealId);

          if (isSelected) {
            handleFieldChange("meals", currentMeals.filter(m => m !== mealId));
            // Clear custom description if removing "others"
            if (mealId === "others") {
              handleFieldChange("customMealDescription", "");
            }
          } else {
            handleFieldChange("meals", [...currentMeals, mealId]);
          }
        };

        return (
          <>
            <div className="space-y-3">
              <Label className="text-label-md">Select Meal Options (Multi-select)</Label>
              <div className="space-y-2">
                {mealOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={option.id}
                      checked={Array.isArray(editedEvent.meals) && editedEvent.meals.includes(option.id)}
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
            {Array.isArray(editedEvent.meals) && editedEvent.meals.includes("others") && (
              <div className="grid gap-2">
                <Label htmlFor="customMealDescription" className="text-label-md">
                  Please specify
                </Label>
                <Input
                  id="customMealDescription"
                  value={editedEvent.customMealDescription || ""}
                  onChange={(e) => handleFieldChange("customMealDescription", e.target.value)}
                  placeholder="Enter custom meal description..."
                  className="input-field"
                />
              </div>
            )}
            {/* Price Field */}
            <div className="grid gap-2">
              <Label htmlFor="mealPrice">Price</Label>
              <div className="flex gap-2">
                <Select value={editedEvent.currency || "INR"} onValueChange={(value) => handleFieldChange("currency", value)}>
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
                  id="mealPrice"
                  type="number"
                  min="0"
                  max="1000000"
                  step="0.01"
                  value={editedEvent.price || ""}
                  onChange={(e) => handleNumericInput(e, "price")}
                  placeholder="0.00"
                  className="flex-1"
                />
              </div>
            </div>
          </>
        )

      case "image":
        return (
          <>
            {renderFieldWithValidation(
              "title",
              "Image Title",
              <Input
                id="title"
                value={editedEvent.title || ""}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                placeholder="Enter image title"
                className={validationErrors.title ? "border-red-500" : ""}
              />,
              true,
            )}
            {renderFieldWithValidation(
              "imageUrl",
              "Image URL",
              <Input
                id="imageUrl"
                value={editedEvent.imageUrl || ""}
                onChange={(e) => handleFieldChange("imageUrl", e.target.value)}
                placeholder="Enter image URL or upload below"
                className={validationErrors.imageUrl ? "border-red-500" : ""}
              />,
              true,
            )}
            <div className="grid gap-2">
              <Label htmlFor="imageUpload">Upload Image</Label>
              <Input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      // 5MB limit
                      setValidationErrors((prev) => ({ ...prev, imageUpload: "File size must be less than 5MB" }))
                      return
                    }

                    const reader = new FileReader()
                    reader.onload = (event) => {
                      const result = event.target?.result as string
                      handleFieldChange("imageUrl", result)
                      setValidationErrors((prev) => ({ ...prev, imageUpload: "" }))
                    }
                    reader.readAsDataURL(file)
                  }
                }}
                className="cursor-pointer"
              />
              {validationErrors.imageUpload && (
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <AlertCircle className="h-3 w-3" />
                  <span>{validationErrors.imageUpload}</span>
                </div>
              )}
            </div>
            {editedEvent.imageUrl && (
              <div className="grid gap-2">
                <Label>Preview</Label>
                <div className="border rounded-lg p-2">
                  <img
                    src={editedEvent.imageUrl || "/placeholder.svg"}
                    alt={editedEvent.imageAlt || "Preview"}
                    className="max-w-full h-32 object-cover rounded"
                  />
                </div>
              </div>
            )}
            {renderFieldWithValidation(
              "imageCaption",
              "Caption",
              <Input
                id="imageCaption"
                value={editedEvent.imageCaption || ""}
                onChange={(e) => handleFieldChange("imageCaption", e.target.value)}
                placeholder="Enter image caption"
                className={validationErrors.imageCaption ? "border-red-500" : ""}
              />,
            )}
            {renderFieldWithValidation(
              "imageAlt",
              "Alt Text",
              <Input
                id="imageAlt"
                value={editedEvent.imageAlt || ""}
                onChange={(e) => handleFieldChange("imageAlt", e.target.value)}
                placeholder="Enter alt text for accessibility"
                className={validationErrors.imageAlt ? "border-red-500" : ""}
              />,
              true,
            )}
            {renderFieldWithValidation(
              "description",
              "Description",
              <Textarea
                id="description"
                value={editedEvent.description || ""}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                placeholder="Add image description..."
                rows={3}
                className={validationErrors.description ? "border-red-500" : ""}
              />,
              true,
            )}
          </>
        )

      case "ancillaries":
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Sub-Category</h4>
              <div className="grid grid-cols-3 gap-3">
                {ancillariesSubCategories.map((subCat) => (
                  <button
                    key={subCat.id}
                    type="button"
                    onClick={() => handleFieldChange("subCategory", subCat.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${editedEvent.subCategory === subCat.id
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <span className="text-xl mb-1">{subCat.icon}</span>
                    <span className="text-xs text-center font-medium">{subCat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {editedEvent.subCategory && (
              <AncillariesForms
                selectedSubCategory={editedEvent.subCategory}
                manualTitle={editedEvent.title || ""}
                setManualTitle={(v) => handleFieldChange("title", v)}
                manualPrice={editedEvent.price === 0 && editedEvent.price !== 0 ? "" : (editedEvent.price ?? "")}
                setManualPrice={(v) => handleFieldChange("price", v === "" ? 0 : v)}
                manualCurrency={editedEvent.currency || "INR"}
                setManualCurrency={(v) => handleFieldChange("currency", v)}

                // Visa Specific
                manualCountry={(editedEvent as any).country || ""}
                setManualCountry={(v) => handleFieldChange("country", v)}
                manualVisaType={(editedEvent as any).visaType || ""}
                setManualVisaType={(v) => handleFieldChange("visaType", v)}
                manualVisaDuration={(editedEvent as any).visaDuration || ""}
                setManualVisaDuration={(v) => handleFieldChange("visaDuration", v)}
                manualServiceFee={(editedEvent as any).serviceCharge || ""}
                setManualServiceFee={(v) => handleFieldChange("serviceCharge", v)}
                manualTotalFee={(editedEvent as any).totalFee || ""} // Derived usually, but passing if stored
                manualLengthOfStay={(editedEvent as any).lengthOfStay || ""}
                setManualLengthOfStay={(v) => handleFieldChange("lengthOfStay", v)}
                manualEntryMethod={(editedEvent as any).entryMethod || ""}
                setManualEntryMethod={(v) => handleFieldChange("entryMethod", v)}
                manualDepartureDate={(editedEvent as any).departureDate || ""}
                setManualDepartureDate={(v) => handleFieldChange("departureDate", v)}
                manualReturnDate={(editedEvent as any).returnDate || ""}
                setManualReturnDate={(v) => handleFieldChange("returnDate", v)}

                // Forex Specific
                manualForexCurrency={(editedEvent as any).forexCurrency || ""}
                setManualForexCurrency={(v) => handleFieldChange("forexCurrency", v)}
                manualBaseCurrency={(editedEvent as any).baseCurrency || "INR"}
                setManualBaseCurrency={(v) => handleFieldChange("baseCurrency", v)}
                manualAmount={(editedEvent as any).amount || ""}
                setManualAmount={(v) => handleFieldChange("amount", v)}

                // Travel Insurance Specific
                manualDestinations={(editedEvent as any).destinations || []}
                handleAddDestination={() => {
                  const current = (editedEvent as any).destinations || []
                  handleFieldChange("destinations", [...current, ""])
                }}
                handleRemoveDestination={(idx) => {
                  const current = (editedEvent as any).destinations || []
                  handleFieldChange("destinations", current.filter((_: any, i: number) => i !== idx))
                }}
                handleDestinationChange={(idx, value) => {
                  const current = [...((editedEvent as any).destinations || [])]
                  current[idx] = value
                  handleFieldChange("destinations", current)
                }}
                manualStartDate={(editedEvent as any).startDate || ""}
                setManualStartDate={(v) => handleFieldChange("startDate", v)}
                manualEndDate={(editedEvent as any).endDate || ""}
                setManualEndDate={(v) => handleFieldChange("endDate", v)}
                manualNoOfTravellers={(editedEvent as any).noOfTravellers || ""}
                setManualNoOfTravellers={(v) => handleFieldChange("noOfTravellers", v)}
                manualInsuranceType={(editedEvent as any).insuranceType || ""}
                setManualInsuranceType={(v) => handleFieldChange("insuranceType", v)}
                manualNotes={(editedEvent as any).insuranceNotes || ""}
                setManualNotes={(v) => handleFieldChange("insuranceNotes", v)}
                manualSumInsured={(editedEvent as any).sumInsured || ""}
                setManualSumInsured={(v) => handleFieldChange("sumInsured", v)}
              />
            )}
          </div>
        )
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {event.category.charAt(0).toUpperCase() + event.category.slice(1)}</DialogTitle>

        </DialogHeader>
        <DialogDescription className="sr-only">
          Edit the details of your {event.category} event.
        </DialogDescription>

        {Object.keys(validationErrors).filter((key) => validationErrors[key]).length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please fix the validation errors below before saving.</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          {renderFields()}

          {/* Additional Information Section */}
          {editedEvent.category !== "meal" && editedEvent.category !== "flight" && editedEvent.category !== "hotel" && editedEvent.category !== "note" && editedEvent.category !== "others" && editedEvent.category !== "ancillaries" && (
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
              {editedEvent.additionalInfoSections && editedEvent.additionalInfoSections.length > 0 ? (
                editedEvent.additionalInfoSections.map((section, index) => (
                  <div key={index} className="mb-4 border p-3 rounded-md relative">
                    <Input
                      placeholder="Section Heading"
                      value={section.heading}
                      onChange={(e) => {
                        const newSections = [...(editedEvent.additionalInfoSections || [])]
                        newSections[index] = { ...newSections[index], heading: e.target.value }
                        setEditedEvent({ ...editedEvent, additionalInfoSections: newSections })
                      }}
                      className="mb-2"
                    />
                    <Textarea
                      placeholder="Section Content"
                      value={section.content}
                      onChange={(e) => {
                        const newSections = [...(editedEvent.additionalInfoSections || [])]
                        newSections[index] = { ...newSections[index], content: e.target.value }
                        setEditedEvent({ ...editedEvent, additionalInfoSections: newSections })
                      }}
                      rows={4}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newSections = [...(editedEvent.additionalInfoSections || [])]
                        newSections.splice(index, 1)
                        setEditedEvent({ ...editedEvent, additionalInfoSections: newSections })
                      }}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      aria-label="Remove section"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No additional information sections added.</p>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const newSections = [...(editedEvent.additionalInfoSections || [])]
                  newSections.push({ heading: "", content: "" })
                  setEditedEvent({ ...editedEvent, additionalInfoSections: newSections })
                }}
              >
                Add Section
              </Button>
            </div>
          )}

          {!["meal", "flight", "hotel", "note", "others", "ancillaries"].includes(editedEvent.category) && (
            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <div className="flex gap-2">
                <Select value={editedEvent.currency || "INR"} onValueChange={(value) => handleFieldChange("currency", value)}>
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
                  id="price"
                  type="number"
                  min="0"
                  max="1000000"
                  step="0.01"
                  value={editedEvent.price || ""}
                  onChange={(e) => handleNumericInput(e, "price")}
                  placeholder="0.00"
                  className={validationErrors.price ? "border-red-500 flex-1" : "flex-1"}
                />
              </div>
              {validationErrors.price && (
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <AlertCircle className="h-3 w-3" />
                  <span>{validationErrors.price}</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isValidating || Object.keys(validationErrors).some((key) => validationErrors[key])}
          >
            {isValidating ? "Validating..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
