"use client"

import type React from "react"
import { useState, useEffect, type KeyboardEvent } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { IItineraryEvent } from "@/models/Itinerary"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, Plus, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EditEventModalProps {
  event: IItineraryEvent | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedEvent: IItineraryEvent) => void
}

interface ValidationErrors {
  [key: string]: string
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
      meals: event?.meals ? { ...event.meals } : undefined,
      hotelName: event?.hotelName || "",
      roomCategory: event?.roomCategory || "",
      hotelRating: event?.hotelRating || 0,
      mealPlan: event?.mealPlan || "",
      hotelNotes: event?.hotelNotes || "",
      additionalInfoSections: event?.additionalInfoSections ? [...event.additionalInfoSections] : [],
    };
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isValidating, setIsValidating] = useState(false)
  const [newTag, setNewTag] = useState("")

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
        capacity: event?.capacity ? Number(event.capacity) : 0,
        nights: event?.nights ? Number(event.nights) : 0,
        highlights: event?.highlights ? [...event.highlights] : [],
        listItems: event?.listItems ? [...event.listItems] : [],
        meals: event?.meals ? { ...event.meals } : undefined,
        hotelName: event?.hotelName || "",
        roomCategory: event?.roomCategory || "",
        hotelRating: event?.hotelRating || 0,
        mealPlan: event?.mealPlan || "",
        hotelNotes: event?.hotelNotes || "",
        additionalInfoSections: event?.additionalInfoSections ? [...event.additionalInfoSections] : [],
      })
      setValidationErrors({})
    }
  }, [event])

  if (!event) return null

  const validateField = (fieldName: string, value: any): string => {
    switch (fieldName) {
      case "title":
        if (!value || value.trim().length === 0) return "Title is required"
        if (value.trim().length < 2) return "Title must be at least 2 characters"
        if (value.trim().length > 100) return "Title must be less than 100 characters"
        return ""

      case "description":
        if (!value || value.trim().length === 0) return "Description is required"
        if (value.trim().length < 5) return "Description must be at least 5 characters"
        if (value.trim().length > 500) return "Description must be less than 500 characters"
        return ""

      case "fromCity":
        if (event.category === "flight" && (!value || value.trim().length === 0)) return "Origin city is required"
        if (value && value.trim().length > 0 && value.trim().length < 2)
          return "City name must be at least 2 characters"
        return ""

      case "toCity":
        if (event.category === "flight" && (!value || value.trim().length === 0)) return "Destination city is required"
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
    const fieldsToValidate = ["title", "description", "price"]

    if (event.category === "flight") {
      fieldsToValidate.push("fromCity", "toCity")
    }

    if (event.category === "activity") {
      fieldsToValidate.push("location", "duration", "capacity")
    }

      if (event.category === "hotel") {
        fieldsToValidate.push("location", "nights", "hotelName", "roomCategory", "hotelRating", "mealPlan")
      }

    if (event.category === "image") {
      fieldsToValidate.push("imageUrl", "imageAlt")
    }

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, editedEvent[field as keyof IItineraryEvent])
      if (error) {
        errors[field] = error
      }
    })

    // Additional cross-field validation
    if (event.category === "hotel" && editedEvent.checkIn && editedEvent.checkOut) {
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
      nights: editedEvent.nights || 0,
      capacity: editedEvent.capacity || 0,
      highlights: editedEvent.highlights ? [...editedEvent.highlights] : [],
      listItems: editedEvent.listItems ? [...editedEvent.listItems] : [],
      meals: editedEvent.meals ? { ...editedEvent.meals } : undefined,
      additionalInfoSections: editedEvent.additionalInfoSections ? [...editedEvent.additionalInfoSections] : [],
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
    switch (event.category) {
      case "flight":
        return (
          <>
            {/* Mandatory Fields */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Mandatory Fields
              </h4>
              <div className="space-y-4 pl-4 border-l-2 border-red-200">
                {renderFieldWithValidation(
                  "title",
                  "Flight Title",
                  <Input
                    id="title"
                    value={editedEvent.title || ""}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    placeholder="Enter flight title"
                    className={validationErrors.title ? "border-red-500" : ""}
                  />,
                  true,
                )}
              </div>
            </div>

            {/* Non-Mandatory Fields */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                Non-Mandatory Fields
              </h4>
              <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  {renderFieldWithValidation(
                    "fromCity",
                    "From",
                    <Input
                      id="fromCity"
                      value={editedEvent.fromCity || ""}
                      onChange={(e) => handleFieldChange("fromCity", e.target.value)}
                      placeholder="Origin city"
                      className={validationErrors.fromCity ? "border-red-500" : ""}
                    />,
                  )}
                  {renderFieldWithValidation(
                    "toCity",
                    "To",
                    <Input
                      id="toCity"
                      value={editedEvent.toCity || ""}
                      onChange={(e) => handleFieldChange("toCity", e.target.value)}
                      placeholder="Destination city"
                      className={validationErrors.toCity ? "border-red-500" : ""}
                    />,
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {renderFieldWithValidation(
                    "airlines",
                    "Airlines",
                    <Input
                      id="airlines"
                      value={(editedEvent as any).airlines || ""}
                      onChange={(e) => handleFieldChange("airlines", e.target.value)}
                      placeholder="e.g., Emirates, Qatar Airways"
                      className={validationErrors.airlines ? "border-red-500" : ""}
                    />,
                  )}
                  {renderFieldWithValidation(
                    "flightNumber",
                    "Flight No.",
                    <Input
                      id="flightNumber"
                      value={(editedEvent as any).flightNumber || ""}
                      onChange={(e) => handleFieldChange("flightNumber", e.target.value)}
                      placeholder="e.g., EK 123"
                      className={validationErrors.flightNumber ? "border-red-500" : ""}
                    />,
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {renderFieldWithValidation(
                    "startTime",
                    "Start Destination (Time)",
                    <Input
                      id="startTime"
                      type="time"
                      value={(editedEvent as any).startTime || ""}
                      onChange={(e) => handleFieldChange("startTime", e.target.value)}
                      className={validationErrors.startTime ? "border-red-500" : ""}
                    />,
                  )}
                  {renderFieldWithValidation(
                    "endTime",
                    "Final Destination (Time)",
                    <Input
                      id="endTime"
                      type="time"
                      value={(editedEvent as any).endTime || ""}
                      onChange={(e) => handleFieldChange("endTime", e.target.value)}
                      className={validationErrors.endTime ? "border-red-500" : ""}
                    />,
                  )}
                </div>
                {renderFieldWithValidation(
                  "flightClass",
                  "Flight Class",
                  <Select
                    value={(editedEvent as any).flightClass || ""}
                    onValueChange={(value) => handleFieldChange("flightClass", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select flight class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">Economy</SelectItem>
                      <SelectItem value="premium-economy">Premium Economy</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="first">First Class</SelectItem>
                    </SelectContent>
                  </Select>,
                )}
                <div className="grid gap-2">
                  <Label htmlFor="highlights">Highlights</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editedEvent.highlights?.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="px-2 py-1">
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="ml-2 hover:text-red-500 focus:outline-none">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="newTag"
                      placeholder="Add a highlight"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={handleAddTag}
                      className={`flex-1 ${validationErrors.newTag ? "border-red-500" : ""}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (newTag.trim()) {
                          if (newTag.trim().length < 2) {
                            setValidationErrors((prev) => ({ ...prev, newTag: "Tag must be at least 2 characters" }))
                            return
                          }
                          if (!editedEvent.highlights) {
                            setEditedEvent({ ...editedEvent, highlights: [newTag.trim()] })
                          } else if (!editedEvent.highlights.includes(newTag.trim())) {
                            setEditedEvent({
                              ...editedEvent,
                              highlights: [...editedEvent.highlights, newTag.trim()],
                            })
                          }
                          setNewTag("")
                          setValidationErrors((prev) => ({ ...prev, newTag: "" }))
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {validationErrors.newTag && (
                    <div className="flex items-center gap-1 text-red-500 text-sm">
                      <AlertCircle className="h-3 w-3" />
                      <span>{validationErrors.newTag}</span>
                    </div>
                  )}
                </div>
                {renderFieldWithValidation(
                  "flightNotes",
                  "Flight Notes",
                  <Textarea
                    id="flightNotes"
                    value={(editedEvent as any).flightNotes || ""}
                    onChange={(e) => handleFieldChange("flightNotes", e.target.value)}
                    placeholder="Additional flight notes..."
                    rows={3}
                    className={validationErrors.flightNotes ? "border-red-500" : ""}
                  />,
                )}
              </div>
            </div>
          </>
        )

      case "hotel":
        return (
          <>
            {renderFieldWithValidation(
              "title",
              "Hotel Name",
              <Input
                id="title"
                value={editedEvent.title || ""}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                placeholder="Enter hotel name"
                className={validationErrors.title ? "border-red-500" : ""}
              />,
              true,
            )}
            {renderFieldWithValidation(
              "location",
              "Location",
              <Input
                id="location"
                value={editedEvent.location || ""}
                onChange={(e) => handleFieldChange("location", e.target.value)}
                placeholder="Hotel location"
                className={validationErrors.location ? "border-red-500" : ""}
              />,
              true,
            )}
            {renderFieldWithValidation(
              "mainPoint",
              "Main Point",
              <Input
                id="mainPoint"
                value={editedEvent.mainPoint || ""}
                onChange={(e) => handleFieldChange("mainPoint", e.target.value)}
                placeholder="Hotel highlights or features"
                className={validationErrors.mainPoint ? "border-red-500" : ""}
              />,
            )}
            <div className="grid grid-cols-2 gap-4">
              {renderFieldWithValidation(
                "checkIn",
                "Check In",
                <Input
                  id="checkIn"
                  type="time"
                  value={editedEvent.checkIn || ""}
                  onChange={(e) => handleFieldChange("checkIn", e.target.value)}
                  className={validationErrors.checkIn ? "border-red-500" : ""}
                />,
              )}
              {renderFieldWithValidation(
                "checkOut",
                "Check Out",
                <Input
                  id="checkOut"
                  type="time"
                  value={editedEvent.checkOut || ""}
                  onChange={(e) => handleFieldChange("checkOut", e.target.value)}
                  className={validationErrors.checkOut ? "border-red-500" : ""}
                />,
              )}
            </div>
            {renderFieldWithValidation(
              "nights",
              "Number of Nights",
              <Input
                id="nights"
                type="number"
                min="1"
                max="365"
                value={editedEvent.nights || ""}
                onChange={(e) => handleNumericInput(e, "nights")}
                placeholder="1"
                className={validationErrors.nights ? "border-red-500" : ""}
              />,
              true,
            )}
            {renderFieldWithValidation(
              "hotelName",
              "Hotel Name",
              <Input
                id="hotelName"
                value={editedEvent.hotelName || ""}
                onChange={(e) => handleFieldChange("hotelName", e.target.value)}
                placeholder="Enter hotel name"
                className={validationErrors.hotelName ? "border-red-500" : ""}
              />,
              true,
            )}
            {renderFieldWithValidation(
              "roomCategory",
              "Room Category",
              <Input
                id="roomCategory"
                value={editedEvent.roomCategory || ""}
                onChange={(e) => handleFieldChange("roomCategory", e.target.value)}
                placeholder="e.g., Deluxe, Standard"
                className={validationErrors.roomCategory ? "border-red-500" : ""}
              />,
              true,
            )}
            {renderFieldWithValidation(
              "hotelRating",
              "Hotel Rating",
              <Input
                id="hotelRating"
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={editedEvent.hotelRating || ""}
                onChange={(e) => handleFieldChange("hotelRating", Number(e.target.value))}
                placeholder="4.5"
                className={validationErrors.hotelRating ? "border-red-500" : ""}
              />,
              true,
            )}
            {renderFieldWithValidation(
              "mealPlan",
              "Meal Plan",
              <Select
                value={editedEvent.mealPlan || ""}
                onValueChange={(value) => handleFieldChange("mealPlan", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select meal plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="room-only">Room Only</SelectItem>
                  <SelectItem value="bed-breakfast">Bed & Breakfast</SelectItem>
                  <SelectItem value="half-board">Half Board</SelectItem>
                  <SelectItem value="full-board">Full Board</SelectItem>
                  <SelectItem value="all-inclusive">All Inclusive</SelectItem>
                </SelectContent>
              </Select>,
              true,
            )}
            {renderFieldWithValidation(
              "hotelNotes",
              "Hotel Notes",
              <Textarea
                id="hotelNotes"
                value={editedEvent.hotelNotes || ""}
                onChange={(e) => handleFieldChange("hotelNotes", e.target.value)}
                placeholder="Additional hotel notes..."
                rows={3}
                className={validationErrors.hotelNotes ? "border-red-500" : ""}
              />,
            )}
          </>
        )

      case "transfer":
        return (
          <>
            {renderFieldWithValidation(
              "title",
              "Transfer Title",
              <Input
                id="title"
                value={editedEvent.title || ""}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                placeholder="Enter transfer title"
                className={validationErrors.title ? "border-red-500" : ""}
              />,
              true,
            )}
            {renderFieldWithValidation(
              "description",
              "Description",
              <Input
                id="description"
                value={editedEvent.description || ""}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                placeholder="e.g., Krabi Hotel to Phuket Hotel"
                className={validationErrors.description ? "border-red-500" : ""}
              />,
              true,
            )}
            {renderFieldWithValidation(
              "mainPoint",
              "Transfer Type",
              <Input
                id="mainPoint"
                value={editedEvent.mainPoint || ""}
                onChange={(e) => handleFieldChange("mainPoint", e.target.value)}
                placeholder="e.g., Private Transfer"
                className={validationErrors.mainPoint ? "border-red-500" : ""}
              />,
            )}
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
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {event.category.charAt(0).toUpperCase() + event.category.slice(1)}</DialogTitle>
        </DialogHeader>

        {Object.keys(validationErrors).filter((key) => validationErrors[key]).length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please fix the validation errors below before saving.</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          {renderFields()}

          {/* Additional Information Section */}
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

          {renderFieldWithValidation(
            "price",
            "Price (USD)",
            <Input
              id="price"
              type="number"
              min="0"
              max="1000000"
              step="0.01"
              value={editedEvent.price || ""}
              onChange={(e) => handleNumericInput(e, "price")}
              placeholder="0.00"
              className={validationErrors.price ? "border-red-500" : ""}
            />,
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
