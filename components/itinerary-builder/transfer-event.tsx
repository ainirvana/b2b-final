"use client"

import { Car, Clock, Users, Image as ImageIcon } from "lucide-react"
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
  pricingMode?: 'individual' | 'total-only'
}

export function TransferEvent({
  event,
  isDetailedView = true,
  onEdit,
  onDelete,
  pricingEnabled = false,
  pricingAdults = 2,
  pricingChildren = 0,
  pricingCurrency = "INR",
  pricingMode = 'individual',
}: TransferEventProps) {
  const priceResult = pricingEnabled && pricingMode === 'individual' && event.price
    ? calculateTransferPrice(event, {
      adults: pricingAdults,
      children: pricingChildren,
      targetCurrency: pricingCurrency
    }, (event as any).transferCategory || "transfer")
    : null

  const getCategoryLabel = (category?: string) => {
    const labels: { [key: string]: string } = {
      'airport-transfer': '✈️ Airport',
      'car-hire-hourly': '🚗 Car Hire',
      'car-hire-daily': '🚗 Car Hire',
      'train': '🚂 Train',
      'bus': '🚌 Bus',
      'transfer': '🚗 Transfer'
    }
    return category ? labels[category] || category : null
  }

  if (!isDetailedView) {
    return (
      <div className="bg-white p-2 rounded-lg border border-gray-200 relative">
        <EventSourceBadge event={event} />
        <div className="flex items-center gap-1.5">
          <Car className="h-3.5 w-3.5 text-purple-600" />
          <span className="text-sm font-semibold text-gray-800">
            {event.fromLocation || "Pick-up"} → {event.toLocation || "Drop-off"}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-2 rounded-lg border border-gray-200 relative">
      <EventSourceBadge event={event} />

      {/* Compact Header */}
      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
        <Car className="h-3.5 w-3.5 text-purple-600" />
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Transfer</h3>
        {event.transferType && (
          <Badge
            className={`text-xs py-0 px-1 ${event.transferType === 'private'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-100 text-purple-700 border-purple-300'
              }`}
          >
            {event.transferType.toUpperCase()}
          </Badge>
        )}
        {event.transferCategory && getCategoryLabel(event.transferCategory) && (
          <span className="text-xs text-slate-600">{getCategoryLabel(event.transferCategory)}</span>
        )}
      </div>

      {/* Route */}
      <div className="mb-1.5">
        <h4 className="text-sm font-bold text-gray-900">
          {event.fromLocation || "Pick-up"} → {event.toLocation || "Drop-off"}
        </h4>
        {event.subtitle && (
          <p className="text-xs italic text-slate-600 mt-0.5">{event.subtitle}</p>
        )}
        {event.vehicleType && (
          <p className="text-xs text-purple-600 font-medium mt-0.5">{event.vehicleType}</p>
        )}
      </div>

      {/* Description */}
      {event.description && event.description.trim() && (
        <p className="text-xs text-slate-600 mb-1.5 leading-snug">{event.description}</p>
      )}

      {/* Details */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-1.5 text-xs">
        {event.capacity && (
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-slate-400" />
            <span className="text-slate-600">{event.capacity} pax</span>
          </div>
        )}
        {event.duration && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-slate-400" />
            <span className="text-slate-600">{event.duration}</span>
          </div>
        )}
      </div>

      {/* Highlights */}
      {event.highlights && event.highlights.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {event.highlights.map((highlight, index) => (
            <span key={index} className="inline-block px-1.5 py-0.5 rounded bg-purple-50 text-xs text-purple-700 border border-purple-200">
              {highlight}
            </span>
          ))}
        </div>
      )}

      {/* Images */}
      {event.images && event.images.length > 0 && (
        <div className="mb-1.5">
          <div className="grid grid-cols-4 gap-1">
            {event.images.map((img, idx) => (
              <img key={idx} src={img} alt={`Transfer ${idx + 1}`} className="w-full h-12 object-cover rounded border border-slate-200" />
            ))}
          </div>
        </div>
      )}

      {/* Additional Info */}
      {event.additionalInfoSections && event.additionalInfoSections.length > 0 && (
        <div className="mb-1.5 space-y-1">
          {event.additionalInfoSections.map((section, idx) => (
            <div key={idx} className="p-1.5 bg-purple-50 rounded border-l-2 border-purple-400">
              <h5 className="text-xs font-semibold text-purple-900">{section.heading}</h5>
              <p className="text-xs text-purple-800 leading-snug mt-0.5">{section.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Price */}
      {event.price && pricingEnabled && pricingMode === 'individual' && (
        <div className="pt-1.5 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {priceResult ? priceResult.breakdown : "Price"}
            </span>
            <div className="text-right">
              {priceResult ? (
                <>
                  <span className="text-sm font-bold text-purple-600">
                    {priceResult.displayPrice}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">
                    ({priceResult.originalDisplayPrice}/pax)
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm font-bold text-purple-600">
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
