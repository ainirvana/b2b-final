"use client"

import { Plane } from "lucide-react"
import { IItineraryEvent } from "@/models/Itinerary"
import { EventSourceBadge } from "./source-badge"
import { Badge } from "@/components/ui/badge"
import { calculateFlightPrice } from "@/lib/pricing-calculator"

interface FlightEventProps {
  event: IItineraryEvent
  isDetailedView?: boolean
  pricingEnabled?: boolean
  pricingAdults?: number
  pricingChildren?: number
  pricingCurrency?: string
}

export function FlightEvent({
  event,
  isDetailedView = true,
  pricingEnabled = false,
  pricingAdults = 2,
  pricingChildren = 0,
  pricingCurrency = "INR"
}: FlightEventProps) {
  // Calculate pricing if enabled
  const priceResult = pricingEnabled && event.price
    ? calculateFlightPrice(event, {
      adults: pricingAdults,
      children: pricingChildren,
      targetCurrency: pricingCurrency
    })
    : null

  if (!isDetailedView) {
    // Summary view: show only fromCity -> toCity
    return (
      <div className="bg-white p-2 rounded-lg border border-gray-200 relative">
        <EventSourceBadge event={event} />
        <div className="flex items-center gap-1.5">
          <Plane className="h-3.5 w-3.5 text-gray-700" />
          <h4 className="text-sm font-semibold text-gray-800">{event.fromCity} ⟶ {event.toCity}</h4>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-2 rounded-lg border border-gray-200 relative">
      <EventSourceBadge event={event} />
      <div className="flex items-center gap-1.5 mb-1.5">
        <Plane className="h-3.5 w-3.5 text-gray-700" />
        <h3 className="text-sm font-bold text-gray-800">Flight</h3>
      </div>

      <div className="pl-4 space-y-1">
        {/* From -> To with vertical bar */}
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 text-xs">|</span>
          <h4 className="text-sm font-semibold text-gray-800">{event.fromCity} ⟶ {event.toCity}</h4>
        </div>

        {/* Main Point with L-shape connector */}
        <div className="flex items-start pl-3">
          <div className="w-3 h-3 border-l border-b border-gray-300 rounded-bl-md mr-1.5 mt-0.5 flex-shrink-0"></div>
          <p className="flex-1 text-xs font-bold text-gray-700">{event.mainPoint}</p>
        </div>

        {/* Highlights */}
        {event.highlights?.length > 0 && (
          <div className="pl-3 flex flex-wrap gap-1">
            {event.highlights?.map((highlight, index) => (
              <span key={index} className="inline-flex items-center px-1.5 py-0 rounded-md bg-gray-100 text-xs text-gray-700">
                {highlight}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      {event.price && (
        <div className="mt-1.5 p-1.5 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">
              {priceResult ? priceResult.breakdown : "Flight"}
            </span>
            <div className="text-right">
              {priceResult ? (
                <>
                  <span className="text-sm font-bold text-gray-700">
                    {priceResult.displayPrice}
                  </span>
                  <span className="text-xs text-gray-400 block leading-none opacity-60">
                    {priceResult.originalDisplayPrice} / person
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm font-bold text-gray-700">
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
