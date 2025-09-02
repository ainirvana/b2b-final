"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EventCard } from "@/components/itinerary-builder/event-card"
import { DayMeals } from "@/components/itinerary-builder/day-meals"
import { AdditionalSections } from "@/components/itinerary-builder/additional-sections"
import { ItineraryHeader } from "@/components/itinerary-builder/itinerary-header"
import type { IItineraryDay, IItineraryEvent } from "@/models/Itinerary"
import { ArrowLeft, Plus, Sun, Clock, Calendar, GripVertical, Plane, UtensilsCrossed } from "lucide-react"
import { generateUniqueId } from "@/lib/utils"

interface EnhancedDragDropBuilderProps {
  itineraryId?: string
  onBack: () => void
}

const EMPTY_DAY: IItineraryDay = {
  day: 1,
  date: new Date().toISOString().split("T")[0],
  title: "Day 1",
  events: [],
  meals: {
    breakfast: false,
    lunch: false,
    dinner: false,
  },
}

const COMPONENT_TEMPLATES = [
  {
    type: "flight",
    title: "Flight",
    icon: Plane,
    color: "bg-orange-50 border-orange-200",
  },
  {
    type: "transfer",
    title: "Transfer",
    icon: Clock,
    color: "bg-blue-50 border-blue-200",
  },
  {
    type: "hotel",
    title: "Hotel",
    icon: Sun,
    color: "bg-green-50 border-green-200",
  },
  {
    type: "activity",
    title: "Activity",
    icon: Calendar,
    color: "bg-purple-50 border-purple-200",
  },
  {
    type: "meal",
    title: "Meals",
    icon: UtensilsCrossed,
    color: "bg-yellow-50 border-yellow-200",
  },
]

export function EnhancedDragDropBuilder({ itineraryId, onBack }: EnhancedDragDropBuilderProps) {
  const [days, setDays] = useState<IItineraryDay[]>([EMPTY_DAY])
  const [title, setTitle] = useState("South of Thailand - Krabi, Phuket")
  const [description, setDescription] = useState("")
  const [isDetailedView, setIsDetailedView] = useState(true)
  const [additionalSections, setAdditionalSections] = useState<Record<string, string>>({})
  const [version, setVersion] = useState(0)
  const [highlights, setHighlights] = useState<string[]>(["Daily Breakfast", "Hotel", "Sightseeing"])
  const [hasBeenSaved, setHasBeenSaved] = useState(false)
  const [country, setCountry] = useState("Thailand")
  const [daysCount, setDaysCount] = useState(6)
  const [nightsCount, setNightsCount] = useState(5)

  const handleSave = () => {
    // Here you would typically save to your backend
    setVersion((prev) => prev + 1)
    setHasBeenSaved(true)
  }

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<{
    type: "component" | "event"
    item: any
    sourceDay?: number
    sourceIndex?: number
  } | null>(null)
  const [dropTarget, setDropTarget] = useState<{ dayIndex: number; position: number } | null>(null)

  const handleDragStart = (type: "component" | "event", item: any, dayIndex?: number, eventIndex?: number) => {
    setDraggedItem({ type, item, sourceDay: dayIndex, sourceIndex: eventIndex })
  }

  const handleDragOver = (dayIndex: number, position: number) => {
    setDropTarget({ dayIndex, position })
  }

  const handleEditEvent = (dayIndex: number, eventIndex: number, updatedEvent: IItineraryEvent) => {
    const newDays = [...days]
    newDays[dayIndex].events[eventIndex] = updatedEvent
    setDays(newDays)
  }

  const handleDeleteEvent = (dayIndex: number, eventIndex: number) => {
    const newDays = [...days]
    newDays[dayIndex].events.splice(eventIndex, 1)
    setDays(newDays)
  }

  const handleDrop = (dayIndex: number, position: number) => {
    if (!draggedItem) return

    const newDays = [...days]

    if (draggedItem.type === "component") {
      // Create new event from template
      const newEvent: IItineraryEvent = {
        id: generateUniqueId(),
        category: draggedItem.item.type,
        title: "New " + draggedItem.item.title,
        description: "",
        mainPoint: "",
        highlights: [],
        ...(draggedItem.item.type === "hotel" && {
          checkIn: "14:00",
          checkOut: "12:00",
          nights: 1,
        }),
        ...(draggedItem.item.type === "flight" && {
          fromCity: "Enter origin",
          toCity: "Enter destination",
          mainPoint: "Enter flight details",
        }),
        ...(draggedItem.item.type === "meal" && {
          meals: {
            breakfast: false,
            lunch: false,
            dinner: false,
          },
        }),
      }

      newDays[dayIndex].events.splice(position, 0, newEvent)
    } else if (
      draggedItem.type === "event" &&
      draggedItem.sourceDay !== undefined &&
      draggedItem.sourceIndex !== undefined
    ) {
      // Move existing event
      const [movedEvent] = newDays[draggedItem.sourceDay].events.splice(draggedItem.sourceIndex, 1)
      newDays[dayIndex].events.splice(position, 0, movedEvent)
    }

    setDays(newDays)
    setDraggedItem(null)
    setDropTarget(null)
  }

  const handleMealChange = (dayIndex: number, meal: keyof typeof EMPTY_DAY.meals, value: boolean) => {
    const newDays = [...days]
    newDays[dayIndex].meals[meal] = value
    setDays(newDays)
  }

  const addDay = () => {
    const newDay = {
      ...EMPTY_DAY,
      day: days.length + 1,
      title: "Day " + (days.length + 1),
      date: new Date(Date.now() + days.length * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    }
    setDays([...days, newDay])
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6 overflow-auto">
        {/* Back Button */}
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Itinerary Header */}
        <ItineraryHeader
          title={title}
          description={description}
          days={daysCount}
          nights={nightsCount}
          country={country}
          highlights={highlights}
          onSave={handleSave}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onHighlightsChange={setHighlights}
          onCountryChange={setCountry}
          onDaysChange={setDaysCount}
          onNightsChange={setNightsCount}
          version={version}
          hasBeenSaved={hasBeenSaved}
          isDetailedView={isDetailedView}
          onViewChange={setIsDetailedView}
          itineraryData={{ days }}
        />

        {/* Days */}
        <div className="space-y-6">
          {days.map((day, dayIndex) => (
            <Card
              key={dayIndex}
              className={
                "border-2 border-dashed " + (dropTarget?.dayIndex === dayIndex ? "border-blue-400" : "border-gray-200")
              }
              onDragOver={(e) => {
                e.preventDefault()
                handleDragOver(dayIndex, day.events.length)
              }}
              onDrop={() => handleDrop(dayIndex, day.events.length)}
            >
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-[#F8B02B] px-4 py-2 rounded-full">
                    <span className="font-semibold">DAY {dayIndex + 1}</span>
                  </div>
                  <Input
                    value={day.title}
                    placeholder="Enter location..."
                    onChange={(e) => {
                      const newDays = [...days]
                      newDays[dayIndex].title = e.target.value
                      setDays(newDays)
                    }}
                    className="max-w-[200px] h-9"
                  />
                  <div className="ml-auto text-right">
                    <div className="text-2xl font-bold">{new Date(day.date).getDate()}</div>
                    <div className="text-xs font-medium">
                      {new Date(day.date).toLocaleString("en-us", { weekday: "short" })}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {day.events.map((event, eventIndex) => (
                    <div
                      key={event.id}
                      onDragOver={(e) => {
                        e.preventDefault()
                        handleDragOver(dayIndex, eventIndex)
                      }}
                      onDrop={() => handleDrop(dayIndex, eventIndex)}
                    >
                      <EventCard
                        event={event}
                        onDragStart={() => handleDragStart("event", event, dayIndex, eventIndex)}
                        onEdit={(updatedEvent) => handleEditEvent(dayIndex, eventIndex, updatedEvent)}
                        onDelete={() => handleDeleteEvent(dayIndex, eventIndex)}
                      />
                    </div>
                  ))}
                </div>
                {/* Manually added DayMeals component */}
                <DayMeals
                  meals={day.meals}
                  onChange={(meal, value) => {
                    const newDays = [...days]
                    newDays[dayIndex].meals[meal] = value
                    setDays(newDays)
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Day Button */}
        <div className="mt-6 text-center">
          <Button onClick={addDay} variant="outline" className="border-dashed border-2 bg-transparent">
            <Plus className="mr-2 h-4 w-4" />
            Add Day
          </Button>
        </div>

        {/* Additional Sections */}
        <div className="mt-8">
          <AdditionalSections sections={additionalSections} onUpdate={setAdditionalSections} />
        </div>
      </div>

      {/* Component Sidebar */}
      <div className="w-80 border-l bg-white p-4 overflow-auto">
        <h3 className="font-semibold text-lg mb-4">Components</h3>
        <div className="space-y-3">
          {COMPONENT_TEMPLATES.map((component) => {
            const Icon = component.icon
            return (
              <Card
                key={component.type}
                className={component.color + " cursor-move"}
                draggable
                onDragStart={() => handleDragStart("component", component)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{component.title}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
