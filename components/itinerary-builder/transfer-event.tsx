"use client"

import { Car, Clock, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { IItineraryEvent } from "@/models/Itinerary"
import { EventSourceBadge } from "./source-badge"

interface TransferEventProps {
  event: IItineraryEvent
  isDetailedView?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export function TransferEvent({ event, isDetailedView = true, onEdit, onDelete }: TransferEventProps) {
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
    </div>
  )
}

