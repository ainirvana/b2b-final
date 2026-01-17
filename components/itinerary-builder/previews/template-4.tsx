import React from "react"
import { IItinerary, IItineraryDay, IItineraryEvent, ICartItem } from "@/models/Itinerary"
import { PricingConfig, calculateComponentPrice } from "@/lib/pricing-calculator"
import { formatCurrencyWithSymbol } from "@/lib/currency-utils"
import {
    Plane,
    Hotel,
    Car,
    Camera,
    UtensilsCrossed,
    MapPin,
    Clock,
    Calendar,
    Users,
    Info,
    CheckCircle2,
    FileText,
    CreditCard,
    Briefcase,
    Star,
    Globe,
    Shield,
    Luggage,
    Train,
    Bus,
    Ship,
    Anchor,
    Coffee,
    Moon,
    Sun,
    Image as ImageIcon,
    Quote,
    List,
    Heading,
    AlignLeft,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ImageCollage } from "@/components/image-collage"
import { IGalleryItem } from "@/models/Itinerary"

interface Template4Props {
    itinerary: any // Using any to avoid strict type mismatch with the preview interface in page.tsx
    isDetailedView: boolean
    showPrices: boolean
    showTimings: boolean
    pricingConfig: PricingConfig
}

export function ItineraryTemplate4({
    itinerary,
    isDetailedView,
    showPrices,
    showTimings,
    pricingConfig,
}: Template4Props) {
    // --- Helper Functions ---

    const formatPrice = (price: number, currency: string) => {
        return formatCurrencyWithSymbol(price, currency)
    }

    const getEventPrice = (event: IItineraryEvent) => {
        if (!showPrices || !event.price) return null
        const priceResult = calculateComponentPrice(event, pricingConfig)
        return priceResult ? priceResult.displayPrice : null
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return ""
        return new Date(dateStr).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    // --- Renderers for each Category ---

    const renderFlightEvent = (event: IItineraryEvent) => (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                        <Plane className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-900">{event.title || "Flight Transfer"}</h4>
                        {event.airlines && <p className="text-sm text-slate-500">{event.airlines} {event.flightNumber ? `• ${event.flightNumber}` : ""}</p>}
                    </div>
                </div>
                {getEventPrice(event) && (
                    <div className="text-right">
                        <span className="block font-bold text-slate-900">{getEventPrice(event)}</span>
                    </div>
                )}
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Route Info */}
                {(event.fromCity || event.toCity) && (
                    <div className="flex items-center justify-between col-span-1 md:col-span-2 bg-slate-50 rounded-lg p-4 border border-slate-100">
                        <div className="text-left">
                            <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Departure</span>
                            <span className="block text-lg font-bold text-slate-800">{event.fromCity}</span>
                            {showTimings && event.startTime && <span className="block text-sm text-blue-600 font-medium mt-1">{event.startTime}</span>}
                        </div>
                        <div className="flex-1 px-4 flex flex-col items-center">
                            <div className="w-full h-[1px] bg-slate-300 relative">
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-50 px-2">
                                    <Plane className="w-4 h-4 text-slate-400 rotate-90" />
                                </div>
                            </div>
                            {event.duration && <span className="text-xs text-slate-400 mt-2">{event.duration}</span>}
                        </div>
                        <div className="text-right">
                            <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Arrival</span>
                            <span className="block text-lg font-bold text-slate-800">{event.toCity}</span>
                            {showTimings && event.endTime && <span className="block text-sm text-blue-600 font-medium mt-1">{event.endTime}</span>}
                        </div>
                    </div>
                )}

                {/* Detailed Fields */}
                <div className="space-y-3">
                    {event.flightClass && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Star className="w-4 h-4 text-amber-500" />
                            <span>Class: <span className="font-medium text-slate-900">{event.flightClass}</span></span>
                        </div>
                    )}
                    {event.pnr && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span>PNR: <span className="font-mono bg-slate-100 px-1 rounded">{event.pnr}</span></span>
                        </div>
                    )}
                    {event.bookingId && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span>Booking ID: <span className="font-mono bg-slate-100 px-1 rounded">{event.bookingId}</span></span>
                        </div>
                    )}
                    {event.seatNumber && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span>Seat: <span className="font-medium text-slate-900">{event.seatNumber}</span></span>
                        </div>
                    )}
                    {event.refundable && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CreditCard className="w-4 h-4 text-slate-400" />
                            <span>Type: <span className="font-medium text-slate-900">{event.refundable}</span></span>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    {/* Luggage Details */}
                    {(event.checkinBags || event.cabinBags || event.baggage) && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Baggage Allowance</h5>
                            {event.checkinBags !== undefined && (
                                <div className="flex items-center gap-2 text-sm mb-1">
                                    <Briefcase className="w-4 h-4 text-slate-600" />
                                    <span>Check-in: {event.checkinBags} pcs {event.checkinBagWeight ? `(${event.checkinBagWeight})` : ""}</span>
                                </div>
                            )}
                            {event.cabinBags !== undefined && (
                                <div className="flex items-center gap-2 text-sm mb-1">
                                    <Luggage className="w-4 h-4 text-slate-600" />
                                    <span>Cabin: {event.cabinBags} pcs {event.cabinBagWeight ? `(${event.cabinBagWeight})` : ""}</span>
                                </div>
                            )}
                            {event.baggage && !event.checkinBags && !event.cabinBags && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Briefcase className="w-4 h-4 text-slate-600" />
                                    <span>{event.baggage}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Stops Info */}
                    {(event.numberOfStops || (event.stopLocations && event.stopLocations.length > 0) || event.stops) && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Stops</h5>
                            {event.numberOfStops !== undefined && (
                                <span className="block text-sm font-medium text-slate-900">{event.numberOfStops} Stop{event.numberOfStops !== 1 ? 's' : ''}</span>
                            )}
                            {event.stopLocations && event.stopLocations.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {event.stopLocations.map((loc, i) => (
                                        <Badge key={i} variant="outline" className="bg-white text-xs">{loc}</Badge>
                                    ))}
                                </div>
                            )}
                            {event.stops && !event.numberOfStops && <span className="block text-sm text-slate-700">{event.stops}</span>}
                        </div>
                    )}
                </div>
            </div>
            {/* Description & Notes */}
            {(event.description || event.flightNotes || event.inFlightMeals) && (
                <div className="px-5 pb-5 pt-0 text-sm text-slate-600 space-y-2">
                    {event.description && <p className="leading-relaxed border-t border-slate-100 pt-3">{event.description}</p>}
                    {event.inFlightMeals && (
                        <div className="flex items-center gap-2 pt-2">
                            <UtensilsCrossed className="w-4 h-4 text-slate-400" />
                            <span>Meal: {event.inFlightMeals}</span>
                        </div>
                    )}
                    {event.flightNotes && (
                        <div className="bg-amber-50 text-amber-800 p-3 rounded-lg mt-2 flex gap-2 items-start">
                            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p>{event.flightNotes}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )

    const renderHotelEvent = (event: IItineraryEvent) => (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {event.images && event.images.length > 0 && (
                <div className="w-full h-48 relative">
                    <img src={event.images[0]} alt={event.hotelName || event.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                        <h4 className="text-xl font-bold">{event.hotelName || event.title}</h4>
                        {event.hotelRating && (
                            <div className="flex gap-0.5 mt-1 text-yellow-400">
                                {[...Array(event.hotelRating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                            </div>
                        )}
                    </div>
                    {getEventPrice(event) && (
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                            {getEventPrice(event)}
                        </div>
                    )}
                </div>
            )}

            {!event.images?.length && (
                <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                            <Hotel className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900">{event.hotelName || event.title}</h4>
                            <div className="flex gap-1 items-center mt-0.5">
                                {event.hotelRating && (
                                    <div className="flex gap-0.5 text-amber-500 scale-75 origin-left">
                                        {[...Array(event.hotelRating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {getEventPrice(event) && (
                        <div className="text-right">
                            <span className="block font-bold text-slate-900">{getEventPrice(event)}</span>
                        </div>
                    )}
                </div>
            )}

            <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {/* Check-in / Check-out */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="text-slate-400"><Moon className="w-5 h-5" /></div>
                        <div>
                            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Check-in</span>
                            <p className="font-medium text-slate-900">{event.checkIn || "14:00"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="text-slate-400"><Sun className="w-5 h-5" /></div>
                        <div>
                            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Check-out</span>
                            <p className="font-medium text-slate-900">{event.checkOut || "11:00"}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm text-slate-700">
                    {event.roomCategory && (
                        <div className="flex items-center gap-2">
                            <Hotel className="w-4 h-4 text-emerald-600" />
                            <span>Room: <strong>{event.roomCategory}</strong></span>
                        </div>
                    )}
                    {event.mealPlan && (
                        <div className="flex items-center gap-2">
                            <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
                            <span>Meal Plan: <strong>{event.mealPlan}</strong></span>
                        </div>
                    )}
                    {event.adults !== undefined && (
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span>Guests: {event.adults} Adults{event.children ? `, ${event.children} Children` : ''}</span>
                        </div>
                    )}
                    {event.address && (
                        <div className="flex items-start gap-2 col-span-1 md:col-span-2">
                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                            <span>{event.address}</span>
                        </div>
                    )}
                    {event.hotelLink && (
                        <div className="flex items-center gap-2 col-span-1 md:col-span-2">
                            <Globe className="w-4 h-4 text-blue-500" />
                            <a href={event.hotelLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">{event.hotelLink}</a>
                        </div>
                    )}
                    {event.confirmationNumber && (
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span>Conf #: <span className="font-mono bg-slate-100 px-1 rounded">{event.confirmationNumber}</span></span>
                        </div>
                    )}
                </div>

                {event.amenities && event.amenities.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Amenities</span>
                        <div className="flex flex-wrap gap-2">
                            {event.amenities.map((amenity, i) => (
                                <Badge key={i} variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none font-normal">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    {amenity}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {(event.description || event.hotelNotes) && (
                    <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-600 space-y-2">
                        {event.description && <p className="leading-relaxed">{event.description}</p>}
                        {event.hotelNotes && (
                            <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg flex items-start gap-2">
                                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <p>{event.hotelNotes}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )

    const renderTransferEvent = (event: IItineraryEvent) => (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
                        <Car className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-900">{event.title || "Transfer"}</h4>
                        {event.transferCategory && <p className="text-sm text-slate-500 capitalize">{event.transferCategory} • {event.vehicleType || "Vehicle"}</p>}
                    </div>
                </div>
                {getEventPrice(event) && (
                    <div className="text-right">
                        <span className="block font-bold text-slate-900">{getEventPrice(event)}</span>
                    </div>
                )}
            </div>

            <div className="p-5">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    {/* From -> To */}
                    {(event.fromLocation || event.toLocation) && (
                        <div className="flex-1 bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-center gap-3">
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                <div className="w-0.5 h-6 bg-slate-300"></div>
                                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            </div>
                            <div className="flex-1 space-y-3">
                                <div>
                                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">Pick-up</span>
                                    <span className="text-sm font-medium text-slate-900 block">{event.fromLocation || "TBD"}</span>
                                    {showTimings && event.pickupTime && <span className="text-xs text-blue-600 block mt-0.5">{event.pickupTime}</span>}
                                </div>
                                <div>
                                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">Drop-off</span>
                                    <span className="text-sm font-medium text-slate-900 block">{event.toLocation || "TBD"}</span>
                                    {showTimings && event.dropTime && <span className="text-xs text-blue-600 block mt-0.5">{event.dropTime}</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Details Panel */}
                    <div className="flex-1 space-y-3">
                        {event.vehicleType && (
                            <div className="flex items-center gap-2 text-sm">
                                <Car className="w-4 h-4 text-orange-500" />
                                <span className="text-slate-600">Vehicle: <strong className="text-slate-900">{event.vehicleType}</strong></span>
                            </div>
                        )}
                        {event.transferType && (
                            <div className="flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-600">Type: <strong className="capitalize text-slate-900">{event.transferType}</strong></span>
                            </div>
                        )}
                        {event.noOfHours && (
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-600">Duration: <strong>{event.noOfHours} Hours</strong></span>
                            </div>
                        )}
                        {event.busNumber && (
                            <div className="flex items-center gap-2 text-sm">
                                <Bus className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-600">Bus #: <strong>{event.busNumber}</strong></span>
                            </div>
                        )}
                        {event.trainNumber && (
                            <div className="flex items-center gap-2 text-sm">
                                <Train className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-600">Train #: <strong>{event.trainNumber}</strong></span>
                            </div>
                        )}
                        {event.transferLink && (
                            <div className="flex items-center gap-2 text-sm">
                                <Globe className="w-4 h-4 text-blue-500" />
                                <a href={event.transferLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[200px]">{event.transferLink}</a>
                            </div>
                        )}
                    </div>
                </div>

                {event.stopsList && event.stopsList.length > 0 && (
                    <div className="mb-4">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Stops via</span>
                        <div className="flex flex-wrap gap-2">
                            {event.stopsList.map((stop, i) => (
                                <Badge key={i} variant="outline" className="text-slate-600">{stop}</Badge>
                            ))}
                        </div>
                    </div>
                )}

                {event.description && <p className="text-sm text-slate-600 border-t border-slate-100 pt-3 leading-relaxed">{event.description}</p>}

                {/* Additional Vehicles */}
                {event.additionalVehicles && event.additionalVehicles.length > 0 && (
                    <div className="mt-3 bg-slate-50 p-3 rounded-lg">
                        <h6 className="text-xs font-bold text-slate-700 uppercase mb-2">Additional Vehicles</h6>
                        {event.additionalVehicles.map((veh, i) => (
                            <div key={i} className="flex justify-between text-sm mb-1">
                                <span>{veh.vehicleType} (Cap: {veh.capacity})</span>
                                {showPrices && <span className="font-medium">{formatPrice(veh.price, 'USD')}</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )

    const renderActivityEvent = (event: IItineraryEvent) => (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {event.images && event.images.length > 0 && (
                <div className="w-full h-56 relative">
                    <img src={event.images[0]} alt={event.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-purple-500 hover:bg-purple-600 border-none">Activity</Badge>
                            {event.difficulty && <Badge variant="outline" className="text-white border-white/50 capitalize">{event.difficulty}</Badge>}
                        </div>
                        <h4 className="text-2xl font-bold">{event.title}</h4>
                    </div>
                    {getEventPrice(event) && (
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                            {getEventPrice(event)}
                        </div>
                    )}
                </div>
            )}

            {!event.images?.length && (
                <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                            <Camera className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900">{event.title}</h4>
                            {showTimings && event.time && <p className="text-sm text-blue-600">{event.time}</p>}
                        </div>
                    </div>
                    {getEventPrice(event) && (
                        <div className="text-right">
                            <span className="block font-bold text-slate-900">{getEventPrice(event)}</span>
                        </div>
                    )}
                </div>
            )}

            <div className="p-5">
                <div className="flex flex-wrap gap-4 text-sm text-slate-700 mb-4">
                    {event.duration && (
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <Clock className="w-4 h-4 text-purple-500" />
                            <span>Duration: <strong>{event.duration}</strong></span>
                        </div>
                    )}
                    {event.location && (
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <MapPin className="w-4 h-4 text-purple-500" />
                            <span>{event.location}</span>
                        </div>
                    )}
                    {event.capacity && (
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <Users className="w-4 h-4 text-purple-500" />
                            <span>Capacity: <strong>{event.capacity}</strong></span>
                        </div>
                    )}
                </div>

                {event.description && <p className="text-slate-600 leading-relaxed mb-4">{event.description}</p>}

                {event.highlights && event.highlights.length > 0 && (
                    <div className="space-y-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Highlights</span>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {event.highlights.map((h, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                    {h}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {event.listItems && event.listItems.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                            {event.listItems.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )

    const renderGenericEvent = (event: IItineraryEvent, icon: any, colorClass: string) => (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-start gap-4">
                <div className={cn("p-2 rounded-lg flex-shrink-0", colorClass)}>
                    {icon}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-slate-900 text-lg">{event.title}</h4>
                        {getEventPrice(event) && <span className="font-bold text-slate-900">{getEventPrice(event)}</span>}
                    </div>
                    {showTimings && event.time && <p className="text-sm text-blue-600 font-medium mb-2">{event.time}</p>}
                    {event.description && <div className="text-slate-600 text-sm leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: event.description.replace(/\n/g, '<br/>') }} />}

                    {/* Images for generic events */}
                    {event.images && event.images.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {event.images.map((img, i) => (
                                <img key={i} src={img} alt={`Img ${i}`} className="rounded-lg object-cover h-32 w-full" />
                            ))}
                        </div>
                    )}
                    {event.imageUrl && (
                        <div className="mt-4">
                            <img src={event.imageUrl} alt={event.imageAlt || "Image"} className="rounded-lg object-cover w-full h-full max-h-96" />
                            {event.imageCaption && <p className="text-xs text-center text-slate-500 mt-1 italic">{event.imageCaption}</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )

    const renderEvent = (event: IItineraryEvent) => {
        switch (event.category) {
            case "flight": return renderFlightEvent(event)
            case "hotel": return renderHotelEvent(event)
            case "transfer": return renderTransferEvent(event)
            case "activity": return renderActivityEvent(event)
            case "meal": return renderGenericEvent(event, <UtensilsCrossed className="w-5 h-5 text-amber-700" />, "bg-amber-100")
            case "cruise": return renderGenericEvent(event, <Ship className="w-5 h-5 text-blue-700" />, "bg-blue-100")
            case "heading": return <h3 className="text-2xl font-bold text-slate-800 my-4 font-playfair">{event.title}</h3>
            case "paragraph": return <div className="text-slate-700 leading-relaxed my-2">{event.description}</div>
            case "note": return (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-3 rounded-r-lg">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                            <h5 className="font-bold text-yellow-800 text-sm uppercase tracking-wide mb-1">{event.title || "Note"}</h5>
                            <p className="text-yellow-900 text-sm">{event.description}</p>
                        </div>
                    </div>
                </div>
            )
            case "ancillaries":
                // Ancillary renderer
                return (
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <h4 className="font-semibold text-slate-900 text-lg">{event.title || "Ancillary Service"}</h4>
                                    {getEventPrice(event) && <span className="font-bold text-slate-900">{getEventPrice(event)}</span>}
                                </div>
                                {event.description && <p className="text-slate-600 text-sm mb-4">{event.description}</p>}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-white p-4 rounded-lg border border-slate-100">
                                    {event.country && <div><span className="text-slate-500 block text-xs uppercase">Country</span> <span className="font-medium">{event.country}</span></div>}
                                    {event.visaType && <div><span className="text-slate-500 block text-xs uppercase">Visa Type</span> <span className="font-medium">{event.visaType}</span></div>}
                                    {event.visaDuration && <div><span className="text-slate-500 block text-xs uppercase">Duration</span> <span className="font-medium">{event.visaDuration}</span></div>}

                                    {event.insuranceType && <div><span className="text-slate-500 block text-xs uppercase">Insurance</span> <span className="font-medium">{event.insuranceType}</span></div>}
                                    {event.sumInsured && <div><span className="text-slate-500 block text-xs uppercase">Sum Insured</span> <span className="font-medium">{event.sumInsured}</span></div>}

                                    {event.forexCurrency && <div><span className="text-slate-500 block text-xs uppercase">Forex</span> <span className="font-medium">{event.amount} {event.forexCurrency}</span></div>}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            default: return renderGenericEvent(event, <Star className="w-5 h-5 text-slate-600" />, "bg-slate-100")
        }
    }

    // --- Main Layout ---

    return (
        <div className="font-sans text-slate-900 bg-slate-50/50 min-h-screen pb-20">

            {/* Cover Section */}
            <div className="relative w-full h-[60vh] min-h-[500px] overflow-hidden bg-slate-900">
                {/* Background Image */}
                {itinerary.images && itinerary.images.length > 0 ? (
                    <img src={itinerary.images[0]} className="w-full h-full object-cover opacity-60" alt="Cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-950 opacity-80" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50" />

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
                    {itinerary.branding?.headerLogo && (
                        <img src={itinerary.branding.headerLogo} alt="Logo" className="h-20 mb-8 object-contain filter brightness-0 invert" />
                    )}

                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
                        {itinerary.title}
                    </h1>

                    <div className="w-24 h-1 bg-amber-500 mx-auto mb-6" />

                    <p className="text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto font-light leading-relaxed">
                        {itinerary.description}
                    </p>

                    <div className="mt-10 flex flex-wrap gap-4 justify-center">
                        <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{itinerary.days.length} Days</span>
                        </div>
                        {itinerary.previewConfig?.adults && (
                            <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 text-white flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>{itinerary.previewConfig.adults} Adults, {itinerary.previewConfig.children} Children</span>
                            </div>
                        )}
                        {showPrices && itinerary.totalPrice > 0 && (
                            <div className="bg-amber-500 px-6 py-2 rounded-full text-white font-bold flex items-center gap-2 shadow-lg hover:bg-amber-600 transition-colors">
                                <CreditCard className="w-4 h-4" />
                                <span>{formatPrice(itinerary.totalPrice, itinerary.currency || 'USD')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-20 relative z-20 space-y-12">

                {/* Agency / Guest Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Guest Card */}
                    {itinerary.guestDetails && (
                        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-amber-500">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Prepared For</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-slate-900">{itinerary.guestDetails.name || "Guest"}</p>
                                    <p className="text-sm text-slate-500">{itinerary.guestDetails.email} • {itinerary.guestDetails.mobile}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Agency Card */}
                    {itinerary.agencyDetails && (
                        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-slate-800">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Presented By</h3>
                            <div className="flex items-center gap-4">
                                {itinerary.agencyDetails.logo ? (
                                    <img src={itinerary.agencyDetails.logo} alt="Agency" className="w-12 h-12 object-contain" />
                                ) : (
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                        <Briefcase className="w-6 h-6" />
                                    </div>
                                )}
                                <div>
                                    <p className="text-lg font-bold text-slate-900">{itinerary.agencyDetails.name || "Agency"}</p>
                                    <p className="text-sm text-slate-500">{itinerary.agencyDetails.phone} • {itinerary.agencyDetails.email}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Gallery Section */}
                {itinerary.gallery && itinerary.gallery.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-px bg-slate-200 flex-1"></div>
                            <span className="text-slate-400 font-serif italic text-lg">Visual Experience</span>
                            <div className="h-px bg-slate-200 flex-1"></div>
                        </div>
                        <ImageCollage gallery={itinerary.gallery.filter((g: IGalleryItem) => g.type === 'image')} />
                    </div>
                )}

                {/* Itinerary Days */}
                <div className="space-y-12">
                    {itinerary.days.map((day: IItineraryDay, index: number) => (
                        <div key={index} className="relative pl-8 md:pl-0">
                            {/* Timeline line for desktop */}
                            <div className="hidden md:block absolute left-[50%] top-0 bottom-0 w-px bg-slate-200 -translate-x-[0.5px]"></div>

                            {/* Day Header */}
                            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8 relative z-10">
                                <div className="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-bold shadow-xl border-4 border-slate-50">
                                    Day {day.day}
                                </div>
                                <div className="text-center bg-white px-8 py-4 rounded-2xl shadow-sm border border-slate-100 max-w-2xl">
                                    {itinerary.previewConfig?.withDates && itinerary.previewConfig.startDate && (
                                        <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">
                                            {formatDate(new Date(new Date(itinerary.previewConfig.startDate).getTime() + (day.day - 1) * 86400000).toISOString())}
                                        </p>
                                    )}
                                    <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: '"Playfair Display", serif' }}>{day.title}</h2>
                                    {day.description && <p className="text-slate-500 mt-2 text-sm leading-relaxed">{isDetailedView ? day.detailedDescription || day.description : day.description}</p>}
                                </div>
                            </div>

                            {/* Events List */}
                            <div className="space-y-6 max-w-4xl mx-auto">
                                {day.events.map((event, eventIdx) => (
                                    <div key={eventIdx} className="relative group">
                                        {renderEvent(event)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer / End */}
                <div className="text-center pt-12 pb-8 border-t border-slate-200">
                    <h3 className="text-3xl font-bold text-slate-900 mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>End of Services</h3>
                    <p className="text-slate-500">We hope you have a wonderful journey!</p>
                    {itinerary.branding?.footerText && (
                        <p className="text-sm text-slate-400 mt-8">{itinerary.branding.footerText}</p>
                    )}
                </div>
            </div>
        </div>
    )
}
