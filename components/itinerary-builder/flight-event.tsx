"use client"

import { Plane, Clock, Luggage, Shield, FileText, Image as ImageIcon } from "lucide-react"
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
  pricingMode?: 'individual' | 'total-only'
}

export function FlightEvent({
  event,
  isDetailedView = true,
  pricingEnabled = false,
  pricingAdults = 2,
  pricingChildren = 0,
  pricingCurrency = "INR",
  pricingMode = 'individual',
}: FlightEventProps) {
  // Calculate pricing if enabled
  const priceResult = pricingEnabled && pricingMode === 'individual' && event.price
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

      {/* Compact Header */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <Plane className="h-3.5 w-3.5 text-slate-700" />
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Flight</h3>
        {event.airlines && (
          <Badge variant="outline" className="text-xs bg-slate-50 text-slate-700 border-slate-300 py-0 px-1">
            {event.airlines}
          </Badge>
        )}
        {event.flightNumber && (
          <Badge variant="outline" className="text-xs bg-slate-50 text-slate-700 border-slate-300 py-0 px-1">
            {event.flightNumber}
          </Badge>
        )}
        {event.flightClass && (
          <Badge className="text-xs bg-blue-600 text-white py-0 px-1">
            {event.flightClass}
          </Badge>
        )}
      </div>

      {/* Route & Times */}
      <div className="mb-1.5">
        <h4 className="text-sm font-bold text-gray-900 mb-1">{event.fromCity} → {event.toCity}</h4>

        {/* Times - if event.time is set, show both departure and arrival */}
        {(event.time || event.startTime || event.endTime) && (
          <div className="flex items-center gap-2 text-xs">
            {(event.startTime || event.time) && (
              <div className="flex items-center gap-1 text-slate-600">
                <Clock className="h-3 w-3" />
                <span className="font-medium">{event.startTime || event.time}</span>
              </div>
            )}
            {(event.startTime || event.time) && event.endTime && (
              <span className="text-slate-400">→</span>
            )}
            {event.endTime && (
              <div className="flex items-center gap-1 text-slate-600">
                <Clock className="h-3 w-3" />
                <span className="font-medium">{event.endTime}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Point */}
      {event.mainPoint && (
        <p className="text-xs text-slate-700 mb-1.5 leading-snug">{event.mainPoint}</p>
      )}

      {/* Compact Details Grid */}
      {(event.baggage || event.stops || event.pnr || event.refundable) && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-1.5 text-xs">
          {event.baggage && (
            <div className="flex items-center gap-1">
              <Luggage className="h-3 w-3 text-slate-400 flex-shrink-0" />
              <span className="text-slate-600 truncate">{event.baggage}</span>
            </div>
          )}
          {event.stops && (
            <div className="flex items-center gap-1">
              <span className="text-slate-400">✈</span>
              <span className="text-slate-600 truncate">{event.stops}</span>
            </div>
          )}
          {event.pnr && (
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3 text-slate-400 flex-shrink-0" />
              <span className="text-slate-600 font-mono truncate text-xs">{event.pnr}</span>
            </div>
          )}
          {event.refundable && (
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-slate-400 flex-shrink-0" />
              <span className="text-slate-600 truncate">{event.refundable}</span>
            </div>
          )}
        </div>
      )}

      {/* Highlights */}
      {event.highlights && event.highlights.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {event.highlights.map((highlight, index) => (
            <span
              key={index}
              className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-xs text-slate-700"
            >
              {highlight}
            </span>
          ))}
        </div>
      )}

      {/* Notes */}
      {event.flightNotes && (
        <div className="mb-1.5 p-1.5 bg-amber-50 rounded border-l-2 border-amber-400">
          <p className="text-xs text-amber-900 leading-snug">{event.flightNotes}</p>
        </div>
      )}

      {/* Description */}
      {event.description && event.description.trim() && event.description !== event.mainPoint && (
        <p className="text-xs text-slate-600 mb-1.5 leading-snug">{event.description}</p>
      )}

      {/* Images - Compact */}
      {event.images && event.images.length > 0 && (
        <div className="mb-1.5">
          <div className="grid grid-cols-4 gap-1">
            {event.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Flight ${idx + 1}`}
                className="w-full h-12 object-cover rounded border border-slate-200"
              />
            ))}
          </div>
        </div>
      )}

      {/* Additional Info Sections */}
      {event.additionalInfoSections && event.additionalInfoSections.length > 0 && (
        <div className="mb-1.5 space-y-1">
          {event.additionalInfoSections.map((section, idx) => (
            <div key={idx} className="p-1.5 bg-blue-50 rounded border-l-2 border-blue-400">
              <h5 className="text-xs font-semibold text-blue-900">{section.heading}</h5>
              <p className="text-xs text-blue-800 leading-snug mt-0.5">{section.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Price - Compact */}
      {event.price && pricingEnabled && pricingMode === 'individual' && (
        <div className="pt-1.5 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {priceResult ? priceResult.breakdown : "Price"}
            </span>
            <div className="text-right">
              {priceResult ? (
                <>
                  <span className="text-sm font-bold text-slate-900">
                    {priceResult.displayPrice}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">
                    ({priceResult.originalDisplayPrice}/pax)
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm font-bold text-slate-900">
                    {event.currency === "INR" ? "₹" : event.currency === "EUR" ? "€" : event.currency === "GBP" ? "£" : event.currency === "AED" ? "AED " : "$"}
                    {event.price}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">/pax</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
