"use client"

import { Hotel, Moon, Wifi, Car, UtensilsCrossed, Dumbbell, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { IItineraryEvent } from "@/models/Itinerary"
import { EventSourceBadge } from "./source-badge"
import { calculateHotelPrice } from "@/lib/pricing-calculator"

interface HotelEventProps {
  event: IItineraryEvent
  isDetailedView?: boolean
  nightIndex?: number // Current night (1, 2, 3, etc.)
  totalNights?: number // Total nights for the stay
  dayNumber?: number // Actual day number (1, 2, 3, etc.)
  onEdit?: () => void
  onDelete?: () => void
  pricingEnabled?: boolean
  pricingAdults?: number
  pricingChildren?: number
  pricingCurrency?: string
}

export function HotelEvent({
  event,
  isDetailedView = true,
  nightIndex,
  totalNights,
  dayNumber,
  onEdit,
  onDelete,
  pricingEnabled = false,
  pricingAdults = 2,
  pricingChildren = 0,
  pricingCurrency = "INR"
}: HotelEventProps) {
  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="h-3 w-3" />
      case "parking":
        return <Car className="h-3 w-3" />
      case "restaurant":
        return <UtensilsCrossed className="h-3 w-3" />
      case "gym":
        return <Dumbbell className="h-3 w-3" />
      default:
        return null
    }
  }

  // Default times
  const checkInTime = event.checkIn || "11:00"
  const checkOutTime = event.checkOut || "10:00"

  // Determine night display
  const nightDisplay = nightIndex && totalNights ? `${nightIndex}/${totalNights}N` : (event.nights ? `${event.nights}N` : null)

  // Calculate checkout day: if hotel has X nights starting on day Y, checkout is on day Y + X
  const checkoutDay = dayNumber && event.nights ? dayNumber + event.nights : null

  // Determine if this is a check-in day or checkout day
  const isCheckInDay = nightIndex === 1
  // Checkout day is when nightIndex equals totalNights + 1 (the day after the last night)
  const isCheckOutDay = nightIndex !== undefined && totalNights !== undefined && nightIndex === totalNights + 1

  // Calculate pricing if enabled (AFTER isCheckOutDay is defined)
  const priceResult = pricingEnabled && event.price
    ? calculateHotelPrice(event, {
      adults: pricingAdults,
      children: pricingChildren,
      targetCurrency: pricingCurrency
    }, isCheckOutDay)
    : null

  if (!isDetailedView) {
    // Summary view: show only hotel name with night indicator
    return (
      <div className="bg-white p-2 rounded-lg border border-gray-200 relative">
        <EventSourceBadge event={event} />
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 flex-1">
            <div className="p-1 bg-blue-100 rounded-lg">
              <Hotel className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <h4 className="text-sm font-semibold text-gray-800 truncate">{event.title || "Hotel Name"}</h4>
          </div>
          {nightDisplay && !isCheckOutDay && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300 flex-shrink-0 text-xs py-0.5 px-1.5">
              {nightDisplay}
            </Badge>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-2 rounded-lg border border-gray-200 relative">
      <EventSourceBadge event={event} />
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="p-1 bg-blue-100 rounded-lg">
          <Hotel className="h-3.5 w-3.5 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1 flex-wrap">
            <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200 py-0 px-1">
              Hotel
            </Badge>
            {nightDisplay && !isCheckOutDay && (
              <Badge className="text-xs bg-blue-600 text-white py-0 px-1">
                {nightDisplay}
              </Badge>
            )}
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
          <div className="w-0.5 h-4 bg-blue-200 rounded-full"></div>
          <h4 className="text-sm font-semibold text-gray-800">{event.title || "Hotel Name"}</h4>
        </div>

        <div className="flex items-start gap-1.5 pl-2">
          <div className="w-3 h-3 border-l border-b border-blue-200 rounded-bl-lg mt-0.5 flex-shrink-0"></div>
          <p className="flex-1 text-xs text-gray-600">{event.description || event.mainPoint || "Hotel details"}</p>
        </div>

        {event.location && <div className="pl-2 text-xs text-gray-500">📍 {event.location}</div>}

        {/* Amenities */}
        {event.amenities && event.amenities.length > 0 && (
          <div className="pl-2 flex flex-wrap gap-1">
            {event.amenities.map((amenity, index) => (
              <div
                key={index}
                className="flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 rounded-md text-xs text-blue-700"
              >
                {getAmenityIcon(amenity)}
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Check-in/Check-out Tags and Times */}
      <div className="mt-2 space-y-2">
        {/* Check-in and Check-out Tags */}
        <div className="flex gap-2 flex-wrap">
          {isCheckInDay && (
            <Badge className="bg-green-600 text-white text-xs py-1 px-2">
              ✓ CHECK-IN
            </Badge>
          )}
          {isCheckOutDay && (
            <Badge className="bg-red-600 text-white text-xs py-1 px-2">
              ✓ CHECK-OUT
            </Badge>
          )}
        </div>

        {/* Check-in/Check-out Times */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-2 rounded-lg">
          <div className="flex items-center justify-between gap-1">
            <div className="text-center flex-1">
              <p className="text-xs text-gray-500 leading-tight">{isCheckInDay ? "Check-In" : "Stay"}</p>
              <p className="text-xs font-semibold text-gray-800">{checkInTime}</p>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="flex-grow border-t border-dashed border-blue-300"></div>
              {nightDisplay && !isCheckOutDay && (
                <div className="flex items-center gap-0.5 mx-1 px-1.5 py-0 bg-white rounded-full shadow-sm">
                  <span className="text-xs font-semibold text-blue-600">{nightDisplay}</span>
                  <Moon className="h-2.5 w-2.5 text-blue-500" />
                </div>
              )}
              <div className="flex-grow border-t border-dashed border-blue-300"></div>
            </div>

            <div className="text-center flex-1">
              <p className="text-xs text-gray-500 leading-tight">{isCheckOutDay ? "Check-Out" : "Stay"}</p>
              <p className="text-xs font-semibold text-gray-800">{checkOutTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Price */}
      {event.price && (
        <div className="mt-1.5 p-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">
              {priceResult ? priceResult.breakdown : "Hotel"}
            </span>
            <div className="text-right">
              {priceResult ? (
                <>
                  <span className="text-sm font-bold text-blue-600">
                    {priceResult.displayPrice}
                  </span>
                  <span className="text-xs text-gray-400 block leading-none opacity-60">
                    {priceResult.originalDisplayPrice} / night
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm font-bold text-blue-600">
                    {event.currency === "INR" ? "₹" : event.currency === "EUR" ? "€" : event.currency === "GBP" ? "£" : event.currency === "AED" ? "AED " : "$"}
                    {event.price}
                  </span>
                  <span className="text-xs text-gray-500 ml-0.5">per night</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
