"use client"

import { Camera, Clock, Users, Star, MapPin, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { IItineraryEvent } from "@/models/Itinerary"
import { EventSourceBadge } from "./source-badge"

interface ActivityEventProps {
  event: IItineraryEvent
  onEdit?: () => void
  onDelete?: () => void
}

export function ActivityEvent({ event, onEdit, onDelete }: ActivityEventProps) {
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

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 relative">
      <EventSourceBadge event={event} />
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-100 rounded-lg">
          <Camera className="h-5 w-5 text-green-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
              Activity
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
          <div className="w-1 h-6 bg-green-200 rounded-full"></div>
          <h4 className="text-lg font-semibold text-gray-800">{event.title || "Activity Name"}</h4>
        </div>

        <div className="flex items-start gap-3 pl-4">
          <div className="w-4 h-4 border-l-2 border-b-2 border-green-200 rounded-bl-lg mt-1"></div>
          <p className="flex-1 text-sm text-gray-600">{event.description || event.mainPoint || "Activity details"}</p>
        </div>

        {event.location && (
          <div className="pl-4 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
        )}

        {/* Activity Details */}
        <div className="pl-4 flex flex-wrap items-center gap-3 text-sm">
          {event.duration && (
            <div className="flex items-center gap-1 text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{event.duration}</span>
            </div>
          )}
          {event.capacity && (
            <div className="flex items-center gap-1 text-gray-500">
              <Users className="h-4 w-4" />
              <span>Max {event.capacity} people</span>
            </div>
          )}
          {event.difficulty && (
            <Badge variant="outline" className={`text-xs ${getDifficultyColor(event.difficulty)}`}>
              {event.difficulty}
            </Badge>
          )}
        </div>

        {/* Highlights */}
        {event.highlights && event.highlights.length > 0 && (
          <div className="pl-4 flex flex-wrap gap-2">
            {event.highlights.map((highlight, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-xs text-green-700 border border-green-200"
              >
                <Star className="h-3 w-3 mr-1" />
                {highlight}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      {event.price && (
        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Activity cost</span>
            <div className="text-right">
              <span className="text-lg font-bold text-green-600">${event.price}</span>
              <span className="text-xs text-gray-500 block">per person</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
