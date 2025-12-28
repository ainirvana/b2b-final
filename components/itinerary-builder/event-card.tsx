"use client"

import { Button } from "@/components/ui/button"
import { IItineraryEvent } from "@/models/Itinerary"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import { HotelEvent } from "./hotel-event"
import { TransferEvent } from "./transfer-event"
import { ActivityEvent } from "./activity-event"
import { FlightEvent } from "./flight-event"
import { OthersEvent } from "./others-event"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface EventCardProps {
  event: IItineraryEvent
  isDragging?: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
  onEdit?: () => void
  onDelete?: () => void
  nightIndex?: number // Current night for multi-night hotels (1, 2, 3, etc.)
  totalNights?: number // Total nights for the hotel stay
  dayNumber?: number // Actual day number (1, 2, 3, etc.)
  // Pricing props
  isDetailedView?: boolean
  pricingEnabled?: boolean
  pricingAdults?: number
  pricingChildren?: number
  pricingCurrency?: string
  pricingMode?: 'individual' | 'total-only'
}

export function EventCard({
  event,
  isDragging,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
  nightIndex,
  totalNights,
  dayNumber,
  isDetailedView = true,
  pricingEnabled = false,
  pricingAdults = 2,
  pricingChildren = 0,
  pricingCurrency = "INR",
  pricingMode = 'individual',
}: EventCardProps) {

  const renderEventContent = () => {
    switch (event.category) {
      case 'hotel':
        return <HotelEvent event={event} nightIndex={nightIndex} totalNights={totalNights} dayNumber={dayNumber} />
      case 'transfer':
        return <TransferEvent event={event} />
      case 'activity':
        return <ActivityEvent event={event} />
      case 'flight':
        return (
          <FlightEvent
            event={event}
            isDetailedView={isDetailedView}
            pricingEnabled={pricingEnabled}
            pricingAdults={pricingAdults}
            pricingChildren={pricingChildren}
            pricingCurrency={pricingCurrency}
            pricingMode={pricingMode}
          />
        )
      case 'others':
      case 'other':
        return <OthersEvent event={event} pricingEnabled={pricingEnabled} />
      default:
        return null
    }
  }

  return (
    <div className="relative">
      <div
        className={`${isDragging ? 'opacity-50' : ''}`}
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        {/* DEBUG MARKER TO VERIFY FILE LOADING */}
        <div className="hidden" data-debug-id="event-card-loaded"></div>
        {renderEventContent()}
      </div>

      {(onEdit || onDelete) && (
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={onDelete}>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}
