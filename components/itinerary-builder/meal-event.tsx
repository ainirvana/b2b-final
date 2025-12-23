"use client"

import { UtensilsCrossed, Clock, MapPin, Image as ImageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { IItineraryEvent } from "@/models/Itinerary"
import { EventSourceBadge } from "./source-badge"

interface MealEventProps {
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

export function MealEvent({
    event,
    isDetailedView = true,
    onEdit,
    onDelete,
    pricingEnabled = false,
    pricingAdults = 2,
    pricingChildren = 0,
    pricingCurrency = "INR",
    pricingMode = 'individual',
}: MealEventProps) {
    const getMealLabel = (mealId: string): string => {
        const labels: { [key: string]: string } = {
            breakfast: "Breakfast",
            lunch: "Lunch",
            dinner: "Dinner",
            highTea: "High Tea",
            halfBoard: "Half Board",
            fullBoard: "Full Board",
            allInclusive: "All Inclusive",
            others: "Others"
        }
        return labels[mealId] || mealId
    }

    const mealTypes = event.meals || []

    if (!isDetailedView) {
        return (
            <div className="bg-white p-2 rounded-lg border border-gray-200 relative">
                <EventSourceBadge event={event} />
                <div className="flex items-center gap-1.5">
                    <UtensilsCrossed className="h-3.5 w-3.5 text-amber-600" />
                    <div className="flex flex-wrap gap-1">
                        {mealTypes.length > 0 ? (
                            mealTypes.slice(0, 2).map((meal, idx) => (
                                <span key={idx} className="text-sm font-semibold text-gray-800">
                                    {getMealLabel(meal)}
                                    {idx < Math.min(mealTypes.length, 2) - 1 && ", "}
                                </span>
                            ))
                        ) : (
                            <span className="text-sm font-semibold text-gray-800">Meal</span>
                        )}
                        {mealTypes.length > 2 && <span className="text-xs text-gray-500">+{mealTypes.length - 2}</span>}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white p-2 rounded-lg border border-gray-200 relative">
            <EventSourceBadge event={event} />

            {/* Compact Header */}
            <div className="flex items-center gap-1.5 mb-1.5">
                <UtensilsCrossed className="h-3.5 w-3.5 text-amber-600" />
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Meal</h3>
            </div>

            {/* Title */}
            {event.title && (
                <div className="mb-1.5">
                    <h4 className="text-sm font-bold text-gray-900">{event.title}</h4>
                    {event.subtitle && (
                        <p className="text-xs italic text-slate-600 mt-0.5">{event.subtitle}</p>
                    )}
                    {event.location && (
                        <div className="flex items-center gap-1 text-xs text-slate-600 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            <span>{event.location}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Meal Types */}
            {mealTypes.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1.5">
                    {mealTypes.map((meal, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300 py-0.5 px-2">
                            {getMealLabel(meal)}
                        </Badge>
                    ))}
                </div>
            )}

            {/* Description */}
            {event.description && event.description.trim() && (
                <p className="text-xs text-slate-600 mb-1.5 leading-snug">{event.description}</p>
            )}

            {/* Custom Meal Description */}
            {event.customMealDescription && (
                <div className="mb-1.5 p-1.5 bg-amber-50 rounded border-l-2 border-amber-400">
                    <p className="text-xs text-amber-900 leading-snug">{event.customMealDescription}</p>
                </div>
            )}

            {/* Images */}
            {event.images && event.images.length > 0 && (
                <div className="mb-1.5">
                    <div className="grid grid-cols-4 gap-1">
                        {event.images.map((img, idx) => (
                            <img key={idx} src={img} alt={`Meal ${idx + 1}`} className="w-full h-12 object-cover rounded border border-slate-200" />
                        ))}
                    </div>
                </div>
            )}

            {/* Additional Info */}
            {event.additionalInfoSections && event.additionalInfoSections.length > 0 && (
                <div className="mb-1.5 space-y-1">
                    {event.additionalInfoSections.map((section, idx) => (
                        <div key={idx} className="p-1.5 bg-amber-50 rounded border-l-2 border-amber-400">
                            <h5 className="text-xs font-semibold text-amber-900">{section.heading}</h5>
                            <p className="text-xs text-amber-800 leading-snug mt-0.5">{section.content}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Price */}
            {event.price && pricingEnabled && pricingMode === 'individual' && (
                <div className="pt-1.5 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Price</span>
                        <div className="text-right">
                            <span className="text-sm font-bold text-amber-600">
                                {event.currency === "INR" ? "₹" : event.currency === "EUR" ? "€" : event.currency === "GBP" ? "£" : event.currency === "AED" ? "AED " : "$"}
                                {event.price}
                            </span>
                            <span className="text-xs text-slate-500 ml-1">/pax</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
