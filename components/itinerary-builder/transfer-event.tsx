"use client"

import { Car, Clock, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { IItineraryEvent } from "@/models/Itinerary"
import { EventSourceBadge } from "./source-badge"

interface TransferEventProps {
  event: IItineraryEvent
  onEdit?: () => void
  onDelete?: () => void
}

export function TransferEvent({ event, onEdit, onDelete }: TransferEventProps) {
  const getVehicleIcon = (vehicleType?: string) => {
    // You could expand this with different vehicle icons
    return <Car className="h-5 w-5 text-purple-600" />
  }

  return (
    <div className="bg-white rounded-lg border-0 relative">
      <EventSourceBadge event={event} />
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-100 rounded-lg">{getVehicleIcon(event.vehicleType)}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
              Transfer
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
        {/* Route */}
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-purple-200 rounded-full"></div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-800">
              {event.fromLocation || "Pick-up location"} → {event.toLocation || "Drop-off location"}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 pl-4">
          <div className="w-4 h-4 border-l-2 border-b-2 border-purple-200 rounded-bl-lg mt-1"></div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">{event.description || "Transfer details"}</p>
            {event.vehicleType && <p className="text-xs text-purple-600 mt-1 font-medium">{event.vehicleType}</p>}
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="pl-4 flex items-center gap-4 text-sm text-gray-500">
          {event.capacity && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{event.capacity} passengers</span>
            </div>
          )}
          {event.duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{event.duration}</span>
            </div>
          )}
        </div>

        {/* Highlights/Features */}
        {event.highlights && event.highlights.length > 0 && (
          <div className="pl-4 flex flex-wrap gap-2">
            {event.highlights.map((highlight, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-xs text-purple-700 border border-purple-200"
              >
                {highlight}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      {event.price && (
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Transfer cost</span>
            <span className="text-lg font-bold text-purple-600">${event.price}</span>
          </div>
        </div>
      )}
    </div>
  )
}
