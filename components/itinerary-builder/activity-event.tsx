"use client"

import { Camera, Clock, Users, Star, MapPin, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { IItineraryEvent } from "@/models/Itinerary"
import { EventSourceBadge } from "./source-badge"
import { calculateAncillaryPrice } from "@/lib/pricing-calculator"

interface ActivityEventProps {
  event: IItineraryEvent
  isDetailedView?: boolean
  onEdit?: () => void
  onDelete?: () => void
  pricingEnabled?: boolean
  pricingAdults?: number
  pricingChildren?: number
  pricingCurrency?: string
}

export function ActivityEvent({
  event,
  isDetailedView = true,
  onEdit,
  onDelete,
  pricingEnabled = false,
  pricingAdults = 2,
  pricingChildren = 0,
  pricingCurrency = "INR"
}: ActivityEventProps) {
  // Calculate pricing if enabled (activities are per person)
  const priceResult = pricingEnabled && event.price
    ? calculateAncillaryPrice(event, {
      adults: pricingAdults,
      children: pricingChildren,
      targetCurrency: pricingCurrency
    })
    : null
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-700 border-green-200"
      case "moderate":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "hard":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  if (!isDetailedView) {
    // Summary view: show only activity name
    return (
      <div className="bg-white p-2 rounded-lg border border-gray-200 relative">
        <EventSourceBadge event={event} />
        <div className="flex items-center gap-1.5">
          <div className="p-1 bg-green-100 rounded-lg">
            <Camera className="h-3.5 w-3.5 text-green-600" />
          </div>
          <h4 className="text-sm font-semibold text-gray-800 truncate">{event.title || "Activity Name"}</h4>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-2 rounded-lg border border-gray-200 relative">
      <EventSourceBadge event={event} />
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="p-1 bg-green-100 rounded-lg">
          <Camera className="h-3.5 w-3.5 text-green-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200 py-0 px-1">
              Activity
            </Badge>
            {event.time && (
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-2.5 w-2.5 mr-0.5" />
                {event.time}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-0.5 h-4 bg-green-200 rounded-full"></div>
          <h4 className="text-sm font-semibold text-gray-800">{event.title || "Activity Name"}</h4>
        </div>

        <div className="flex items-start gap-1.5 pl-2">
          <div className="w-3 h-3 border-l border-b border-green-200 rounded-bl-lg mt-0.5 flex-shrink-0"></div>
          <p className="flex-1 text-xs text-gray-600">{event.description || event.mainPoint || "Activity details"}</p>
        </div>

        {event.location && (
          <div className="pl-2 flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            <span>{event.location}</span>
          </div>
        )}

        {/* Activity Details */}
        <div className="pl-2 flex flex-wrap items-center gap-1.5 text-xs">
          {event.duration && (
            <div className="flex items-center gap-0.5 text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>{event.duration}</span>
            </div>
          )}
          {event.capacity && (
            <div className="flex items-center gap-0.5 text-gray-500">
              <Users className="h-3 w-3" />
              <span>Max {event.capacity}</span>
            </div>
          )}
          {event.difficulty && (
            <Badge variant="outline" className={`text-xs ${getDifficultyColor(event.difficulty)} py-0 px-1`}>
              {event.difficulty}
            </Badge>
          )}
        </div>

        {/* Highlights */}
        {event.highlights && event.highlights.length > 0 && (
          <div className="pl-2 flex flex-wrap gap-1">
            {event.highlights.map((highlight, index) => (
              <span
                key={index}
                className="inline-flex items-center px-1.5 py-0 rounded-md bg-green-50 text-xs text-green-700 border border-green-200"
              >
                <Star className="h-2.5 w-2.5 mr-0.5" />
                {highlight}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      {event.price && (
        <div className="mt-1.5 p-1.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">
              {priceResult ? priceResult.breakdown : "Activity"}
            </span>
            <div className="text-right">
              {priceResult ? (
                <>
                  <span className="text-sm font-bold text-green-600">
                    {priceResult.displayPrice}
                  </span>
                  <span className="text-xs text-gray-400 block leading-none opacity-60">
                    {priceResult.originalDisplayPrice} / person
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm font-bold text-green-600">
                    {event.currency === "INR" ? "₹" : event.currency === "EUR" ? "€" : event.currency === "GBP" ? "£" : event.currency === "AED" ? "AED " : "$"}
                    {event.price}
                  </span>
                  <span className="text-xs text-gray-500 block leading-none">per person</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
