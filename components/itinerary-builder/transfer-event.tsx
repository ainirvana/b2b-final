"use client"

import { Car, Clock, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { IItineraryEvent } from "@/models/Itinerary"
import { EventSourceBadge } from "./source-badge"
import { calculateTransferPrice } from "@/lib/pricing-calculator"

interface TransferEventProps {
  event: IItineraryEvent
  isDetailedView?: boolean
  onEdit?: () => void
  onDelete?: () => void
  pricingEnabled?: boolean
  pricingAdults?: number
  pricingChildren?: number
  pricingCurrency?: string
}

export function TransferEvent({
  event,
  isDetailedView = true,
  onEdit,
  onDelete,
  pricingEnabled = false,
  pricingAdults = 2,
  pricingChildren = 0,
  pricingCurrency = "INR"
}: TransferEventProps) {
  // Calculate pricing if enabled (transfers use special shared/private logic)
  const priceResult = pricingEnabled && event.price
    ? calculateTransferPrice(event, {
      adults: pricingAdults,
      children: pricingChildren,
      targetCurrency: pricingCurrency
    }, (event as any).transferCategory || "transfer")
    : null
  const getVehicleIcon = (vehicleType?: string) => {
    // You could expand this with different vehicle icons
    return <Car className="h-3.5 w-3.5 text-purple-600" />
  }

  if (!isDetailedView) {
    // Summary view: show only fromLocation -> toLocation
    return (
      <div className="bg-white rounded-lg border border-gray-200 relative p-2">
        <EventSourceBadge event={event} />
        <div className="flex items-center gap-1.5">
          <div className="p-1 bg-purple-100 rounded-lg">{getVehicleIcon(event.vehicleType)}</div>
          <div className="text-sm font-semibold text-gray-800">
            {event.fromLocation || "Pick-up"} → {event.toLocation || "Drop-off"}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 relative p-2">
      <EventSourceBadge event={event} />
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="p-1 bg-purple-100 rounded-lg">{getVehicleIcon(event.vehicleType)}</div>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700 border-purple-200 py-0 px-1">
              Transfer
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
        {/* Route */}
        <div className="flex items-center gap-1.5">
          <div className="w-0.5 h-4 bg-purple-200 rounded-full"></div>
          <div className="flex-1">
            <div className="text-xs font-medium text-gray-800">
              {event.fromLocation || "Pick-up location"} → {event.toLocation || "Drop-off location"}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-1.5 pl-2">
          <div className="w-3 h-3 border-l-2 border-b-2 border-purple-200 rounded-bl-lg mt-0.5"></div>
          <div className="flex-1">
            <p className="text-xs text-gray-600">{event.description || "Transfer details"}</p>
            {event.vehicleType && <p className="text-xs text-purple-600 mt-0.5 font-medium">{event.vehicleType}</p>}
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="pl-2 flex items-center gap-2.5 text-xs text-gray-500">
          {event.capacity && (
            <div className="flex items-center gap-0.5">
              <Users className="h-3 w-3" />
              <span>{event.capacity} pax</span>
            </div>
          )}
          {event.duration && (
            <div className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              <span>{event.duration}</span>
            </div>
          )}
        </div>

        {/* Highlights/Features */}
        {event.highlights && event.highlights.length > 0 && (
          <div className="pl-2 flex flex-wrap gap-1">
            {event.highlights.map((highlight, index) => (
              <span
                key={index}
                className="inline-flex items-center px-1.5 py-0 rounded-md bg-purple-50 text-xs text-purple-700 border border-purple-200"
              >
                {highlight}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      {event.price && (
        <div className="mt-1.5 p-1.5 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">
              {priceResult ? priceResult.breakdown : "Transfer"}
            </span>
            <div className="text-right">
              {priceResult ? (
                <>
                  <span className="text-sm font-bold text-purple-600">
                    {priceResult.displayPrice}
                  </span>
                  <span className="text-xs text-gray-400 block leading-none opacity-60">
                    {priceResult.originalDisplayPrice} / person
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm font-bold text-purple-600">
                    {event.currency === "INR" ? "₹" : event.currency === "EUR" ? "€" : event.currency === "GBP" ? "£" : event.currency === "AED" ? "AED " : "$"}
                    {event.price}
                  </span>
                  <span className="text-xs text-gray-500 ml-0.5">per person</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

