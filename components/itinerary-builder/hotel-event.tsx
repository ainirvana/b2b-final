"use client"

import { Hotel, Moon, Wifi, Car, UtensilsCrossed, Dumbbell, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { IItineraryEvent } from "@/models/Itinerary"
import { EventSourceBadge } from "./source-badge"

interface HotelEventProps {
  event: IItineraryEvent
  isDetailedView?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export function HotelEvent({ event, isDetailedView = true, onEdit, onDelete }: HotelEventProps) {
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

  if (!isDetailedView) {
    // Summary view: show only hotel name
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 relative">
        <EventSourceBadge event={event} />
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Hotel className="h-5 w-5 text-blue-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-800">{event.title || "Hotel Name"}</h4>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 relative">
      <EventSourceBadge event={event} />
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Hotel className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              Hotel
            </Badge>
            {event.time && (
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                {event.time}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-blue-200 rounded-full"></div>
          <h4 className="text-lg font-semibold text-gray-800">{event.title || "Hotel Name"}</h4>
        </div>

        <div className="flex items-start gap-3 pl-4">
          <div className="w-4 h-4 border-l-2 border-b-2 border-blue-200 rounded-bl-lg mt-1"></div>
          <p className="flex-1 text-sm text-gray-600">{event.description || event.mainPoint || "Hotel details"}</p>
        </div>

        {event.location && <div className="pl-4 text-sm text-gray-500">📍 {event.location}</div>}

        {/* Amenities */}
        {event.amenities && event.amenities.length > 0 && (
          <div className="pl-4 flex flex-wrap gap-2">
            {event.amenities.map((amenity, index) => (
              <div
                key={index}
                className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-md text-xs text-blue-700"
              >
                {getAmenityIcon(amenity)}
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Check-in/Check-out Section */}
      <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Check In</p>
            <p className="text-sm font-semibold text-gray-800">{event.checkIn || "14:00"}</p>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="flex-grow border-t border-dashed border-blue-300"></div>
            {(event.nights || event.nights === 0) && (
              <div className="flex items-center gap-1 mx-3 px-2 py-1 bg-white rounded-full shadow-sm">
                <span className="text-xs font-semibold text-blue-600">{event.nights}N</span>
                <Moon className="h-3 w-3 text-blue-500" />
              </div>
            )}
            <div className="flex-grow border-t border-dashed border-blue-300"></div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Check Out</p>
            <p className="text-sm font-semibold text-gray-800">{event.checkOut || "12:00"}</p>
          </div>
        </div>
      </div>

      {/* Price */}
      {event.price && (
        <div className="mt-3 text-right">
          <span className="text-lg font-bold text-blue-600">${event.price}</span>
          <span className="text-sm text-gray-500 ml-1">per night</span>
        </div>
      )}
    </div>
  )
}
