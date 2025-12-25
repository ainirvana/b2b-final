"use client"

import { Car, Clock, Users, Image as ImageIcon, MapPin, Calendar, Info, Fuel, Settings, Train, Bus, Plane, Shield, Link as LinkIcon } from "lucide-react"
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
      'airport-transfer': '✈️ Airport Transfer',
      'car-hire-hourly': '🕐 Hourly',
      'car-hire-outstation': '🛣️ Outstation',
      'car-hire-roundtrip': '🔄 Round Trip',
      'car-hire-selfdrive': '🚗 Self Drive',
      'train': '🚆 Train',
      'bus': '🚌 Bus',
    }
    return category ? labels[category] || '🚗 Transfer' : '🚗 Transfer'
  }

  const getCategoryIcon = (category?: string) => {
    if (category === 'train') return <Train className="h-3.5 w-3.5 text-purple-600" />
    if (category === 'bus') return <Bus className="h-3.5 w-3.5 text-purple-600" />
    if (category === 'airport-transfer') return <Plane className="h-3.5 w-3.5 text-purple-600" />
    return <Car className="h-3.5 w-3.5 text-purple-600" />
  }

  // Helper to get departure and arrival times (bus/train use different field names)
  const getDepartureTime = () => {
    return (event as any).departureTime || event.pickupTime || event.time
  }

  const getArrivalTime = () => {
    return (event as any).arrivalTime || event.dropTime
  }

  if (!isDetailedView) {
    return (
      <div className="bg-white p-2 rounded-lg border border-gray-200 relative">
        <EventSourceBadge event={event} />
        <div className="flex items-center gap-1.5">
          {getCategoryIcon(event.transferCategory)}
          <span className="text-sm font-semibold text-gray-800">
            {event.fromLocation || event.fromCity || "Pick-up"} → {event.toLocation || event.toCity || "Drop-off"}
          </span>
        </div>
      </div>
    )
  }

  const isCarHire = event.transferCategory?.includes('car-hire')
  const isBusOrTrain = event.transferCategory === 'bus' || event.transferCategory === 'train'
  const isAirportTransfer = event.transferCategory === 'airport-transfer'
  const isSelfDrive = event.transferCategory === 'car-hire-selfdrive'

  return (
    <div className="bg-white p-3 rounded-lg border border-gray-200 relative shadow-sm">
      <EventSourceBadge event={event} />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {getCategoryIcon(event.transferCategory)}
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">TRANSFER</h3>
          {event.transferCategory && (
            <Badge className="text-xs py-0 px-2 bg-purple-100 text-purple-700 border-purple-300">
              {getCategoryLabel(event.transferCategory)}
            </Badge>
          )}
          {event.transferType && (
            <Badge
              className={`text-xs py-0 px-2 ${event.transferType === 'private'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-100 text-purple-700 border-purple-300'
                }`}
            >
              {event.transferType.toUpperCase()}
            </Badge>
          )}
        </div>
      </div>

      {/* Title */}
      {event.title && (
        <h4 className="text-sm font-bold text-gray-900 mb-2">{event.title}</h4>
      )}

      {/* Airport Name (for airport transfers) */}
      {isAirportTransfer && (event as any).airportName && (
        <div className="mb-2 p-2 bg-sky-50 rounded-lg border border-sky-200">
          <div className="flex items-center gap-1.5 text-xs">
            <Plane className="h-3.5 w-3.5 text-sky-600" />
            <span className="text-sky-900 font-semibold">{(event as any).airportName}</span>
          </div>
        </div>
      )}

      {/* Route Information */}
      <div className="mb-3 p-2.5 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-purple-600 flex-shrink-0" />
          <div className="flex-1">
            {/* Handle Self Drive - may only have fromLocation */}
            {isSelfDrive && !event.toLocation && !event.toCity ? (
              <p className="text-sm font-bold text-gray-900">
                Pickup from: {event.fromLocation || event.fromCity || "Pick-up location"}
              </p>
            ) : (
              <p className="text-sm font-bold text-gray-900">
                {event.fromLocation || event.fromCity || "Pick-up location"}
                <span className="mx-2 text-purple-600">→</span>
                {event.toLocation || event.toCity || "Drop-off location"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Vehicle & Time Details Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Vehicle Type / Car Type */}
        {event.vehicleType && (
          <div className="flex items-center gap-1.5 text-xs bg-gray-50 p-2 rounded">
            <Car className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-gray-700 font-medium">{event.vehicleType}</span>
          </div>
        )}

        {/* Capacity */}
        {event.capacity && (
          <div className="flex items-center gap-1.5 text-xs bg-gray-50 p-2 rounded">
            <Users className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-gray-700">{event.capacity} pax</span>
          </div>
        )}

        {/* Pickup/Departure Time */}
        {getDepartureTime() && (
          <div className="flex items-center gap-1.5 text-xs bg-gray-50 p-2 rounded">
            <Clock className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-gray-700">
              {isBusOrTrain ? 'Departure' : 'Pickup'}: {getDepartureTime()}
            </span>
          </div>
        )}

        {/* Drop/Arrival Time */}
        {getArrivalTime() && (
          <div className="flex items-center gap-1.5 text-xs bg-gray-50 p-2 rounded">
            <Clock className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-gray-700">
              {isBusOrTrain ? 'Arrival' : 'Drop'}: {getArrivalTime()}
            </span>
          </div>
        )}

        {/* Duration for Bus/Train */}
        {event.duration && isBusOrTrain && (
          <div className="flex items-center gap-1.5 text-xs bg-gray-50 p-2 rounded col-span-2">
            <Clock className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-gray-700">Travel Duration: {event.duration}</span>
          </div>
        )}
      </div>

      {/* Car Hire Specific Details */}
      {(isCarHire || event.noOfHours || event.noOfDays || event.carModel || event.fuelType || event.transmission) && (
        <div className="mb-3 p-2.5 bg-blue-50 rounded-lg border border-blue-200">
          <h5 className="text-xs font-semibold text-blue-900 mb-1.5 flex items-center gap-1">
            <Info className="h-3 w-3" />
            Rental Details
          </h5>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {event.noOfHours && (
              <div className="text-gray-700">
                <span className="font-medium">Duration:</span> {event.noOfHours} hours
              </div>
            )}
            {event.noOfDays && (
              <div className="text-gray-700">
                <span className="font-medium">Days:</span> {event.noOfDays} days
              </div>
            )}
            {event.carModel && (
              <div className="text-gray-700">
                <span className="font-medium">Model:</span> {event.carModel}
              </div>
            )}
            {event.fuelType && (
              <div className="text-gray-700">
                <span className="font-medium">Fuel:</span> {event.fuelType}
              </div>
            )}
            {event.transmission && (
              <div className="text-gray-700">
                <span className="font-medium">Transmission:</span> {event.transmission}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bus/Train Specific Details */}
      {isBusOrTrain && (event.busNumber || event.trainNumber || event.transferClass || event.pnr) && (
        <div className="mb-3 p-2.5 bg-green-50 rounded-lg border border-green-200">
          <h5 className="text-xs font-semibold text-green-900 mb-1.5 flex items-center gap-1">
            <Info className="h-3 w-3" />
            Journey Details
          </h5>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {event.busNumber && (
              <div className="text-gray-700">
                <span className="font-medium">Bus No:</span> {event.busNumber}
              </div>
            )}
            {event.trainNumber && (
              <div className="text-gray-700">
                <span className="font-medium">Train No:</span> {event.trainNumber}
              </div>
            )}
            {event.transferClass && (
              <div className="text-gray-700">
                <span className="font-medium">Class:</span> {event.transferClass}
              </div>
            )}
            {event.pnr && (
              <div className="text-gray-700">
                <span className="font-medium">PNR:</span> {event.pnr}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {event.description && event.description.trim() && (
        <p className="text-xs text-gray-600 mb-2.5 leading-relaxed">{event.description}</p>
      )}

      {/* Stops List */}
      {event.stopsList && event.stopsList.length > 0 && (
        <div className="mb-2.5">
          <h5 className="text-xs font-semibold text-gray-700 mb-1">Stops</h5>
          <div className="flex flex-wrap gap-1">
            {event.stopsList.map((stop, index) => (
              <span key={index} className="inline-block px-2 py-0.5 rounded bg-yellow-50 text-xs text-yellow-800 border border-yellow-200">
                {stop}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Amenities (for bus/train) */}
      {event.amenities && event.amenities.length > 0 && isBusOrTrain && (
        <div className="mb-2.5">
          <h5 className="text-xs font-semibold text-gray-700 mb-1">Amenities</h5>
          <div className="flex flex-wrap gap-1">
            {event.amenities.map((amenity, index) => (
              <span key={index} className="inline-block px-2 py-0.5 rounded bg-teal-50 text-xs text-teal-700 border border-teal-200">
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Highlights (for other transfers) */}
      {event.highlights && event.highlights.length > 0 && !isBusOrTrain && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {event.highlights.map((highlight, index) => (
            <span key={index} className="inline-block px-2 py-0.5 rounded bg-purple-50 text-xs text-purple-700 border border-purple-200">
              {highlight}
            </span>
          ))}
        </div>
      )}

      {/* Additional Vehicles */}
      {event.additionalVehicles && event.additionalVehicles.length > 0 && (
        <div className="mb-2.5 p-2 bg-amber-50 rounded-lg border border-amber-200">
          <h5 className="text-xs font-semibold text-amber-900 mb-1.5">Additional Vehicles</h5>
          <div className="space-y-1">
            {event.additionalVehicles.map((vehicle, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <span className="text-gray-700">
                  {vehicle.vehicleType} ({vehicle.capacity} pax)
                </span>
                <span className="text-amber-700 font-medium">
                  {event.currency === "INR" ? "₹" : event.currency === "EUR" ? "€" : event.currency === "GBP" ? "£" : "$"}
                  {vehicle.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Reference & Links (for non-bus/train) */}
      {(event.pnr || event.refundable || event.transferLink) && !isBusOrTrain && (
        <div className="mb-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
          <h5 className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Booking Info
          </h5>
          <div className="space-y-0.5 text-xs">
            {event.pnr && (
              <div className="text-gray-700">
                <span className="font-medium">PNR:</span> {event.pnr}
              </div>
            )}
            {event.refundable && (
              <div className="text-gray-700">
                <span className="font-medium">Policy:</span> {event.refundable}
              </div>
            )}
            {event.transferLink && (
              <div className="text-gray-700 flex items-center gap-1">
                <LinkIcon className="h-3 w-3" />
                <a href={event.transferLink} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                  View Booking
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Link for Bus/Train */}
      {isBusOrTrain && event.transferLink && (
        <div className="mb-2.5">
          <a
            href={event.transferLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-purple-600 hover:underline flex items-center gap-1"
          >
            <LinkIcon className="h-3 w-3" />
            View Booking Link
          </a>
        </div>
      )}

      {/* Refund Policy for Bus/Train */}
      {isBusOrTrain && event.refundable && (
        <div className="mb-2.5 text-xs">
          <span className="font-medium text-gray-700">Policy:</span>
          <span className="text-gray-600 ml-1">{event.refundable}</span>
        </div>
      )}

      {/* Images */}
      {event.images && event.images.length > 0 && (
        <div className="mb-2.5">
          <div className="grid grid-cols-4 gap-1">
            {event.images.map((img, idx) => (
              <img key={idx} src={img} alt={`Transfer ${idx + 1}`} className="w-full h-12 object-cover rounded border border-gray-200" />
            ))}
          </div>
        </div>
      )}

      {/* Price */}
      {event.price && pricingEnabled && pricingMode === 'individual' && (
        <div className="pt-2.5 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {priceResult ? priceResult.breakdown : "Total Price"}
            </span>
            <div className="text-right">
              {priceResult ? (
                <>
                  <span className="text-base font-bold text-purple-600">
                    {priceResult.displayPrice}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">
                    ({priceResult.originalDisplayPrice}/pax)
                  </span>
                </>
              ) : (
                <>
                  <span className="text-base font-bold text-purple-600">
                    {event.currency === "INR" ? "₹" : event.currency === "EUR" ? "€" : event.currency === "GBP" ? "£" : event.currency === "AED" ? "AED " : "$"}
                    {event.price}
                  </span>
                  {event.capacity && (
                    <span className="text-xs text-gray-500 ml-1">
                      ({event.currency === "INR" ? "₹" : event.currency === "EUR" ? "€" : event.currency === "GBP" ? "£" : "$"}
                      {(event.price / event.capacity).toFixed(2)}/pax)
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
