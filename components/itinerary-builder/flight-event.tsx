"use client"

import { Plane } from "lucide-react"
import { IItineraryEvent } from "@/models/Itinerary"
import { EventSourceBadge } from "./source-badge"
import { Badge } from "@/components/ui/badge"

interface FlightEventProps {
  event: IItineraryEvent
  isDetailedView?: boolean
}

export function FlightEvent({ event, isDetailedView = true }: FlightEventProps) {
  if (!isDetailedView) {
    // Summary view: show only fromCity -> toCity
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 relative">
        <EventSourceBadge event={event} />
        <div className="flex items-center gap-2">
          <Plane className="h-5 w-5 text-gray-700" />
          <h4 className="text-lg font-semibold text-gray-800">{event.fromCity} ⟶ {event.toCity}</h4>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 relative">
      <EventSourceBadge event={event} />
      <div className="flex items-center gap-2 mb-4">
        <Plane className="h-5 w-5 text-gray-700" />
        <h3 className="text-base font-bold text-gray-800">Flight</h3>
      </div>

      <div className="pl-7 space-y-2">
        {/* From -> To with vertical bar */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500">|</span>
          <h4 className="text-xl font-semibold text-gray-800">{event.fromCity} ⟶ {event.toCity}</h4>
        </div>

        {/* Main Point with L-shape connector */}
        <div className="flex items-start pl-7">
          <div className="w-4 h-4 border-l-2 border-b-2 border-gray-300 rounded-bl-md mr-2 mt-1"></div>
          <p className="flex-1 text-base font-bold text-gray-700">{event.mainPoint}</p>
        </div>

        {/* Highlights */}
        {event.highlights?.length > 0 && (
          <div className="pl-7 flex flex-wrap gap-2">
            {event.highlights.map((highlight, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-700">
                {highlight}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
