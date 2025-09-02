"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Calendar, MapPin, Clock, Edit } from "lucide-react"
import { IItinerary } from "@/models/Itinerary"

interface ItineraryListProps {
  onCreateNew: () => void
  onViewItinerary: (id: string) => void
  onEditItinerary: (id: string) => void
}

export function ItineraryList({ onCreateNew, onViewItinerary, onEditItinerary }: ItineraryListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [itineraries, setItineraries] = useState<IItinerary[]>([])
  const [loading, setLoading] = useState(true)

  // Load itineraries
  useEffect(() => {
    fetch("/api/itineraries")
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data?.data)) {
          setItineraries(data.data);
        } else if (Array.isArray(data)) {
          setItineraries(data);
        } else {
          console.error("Unexpected data format:", data);
          setItineraries([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch itineraries:", err);
        setItineraries([]);
        setLoading(false);
      });
  }, [])

  const filteredItineraries = itineraries.filter(itinerary => 
    itinerary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    itinerary.destination.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-lg font-medium">Loading itineraries...</p>
          <p className="text-sm text-gray-500">Please wait</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Itineraries</h2>
          <p className="text-sm text-gray-500">Create and manage your travel itineraries</p>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create New
        </Button>
      </div>

      <div className="mb-6">
        <Input
          type="search"
          placeholder="Search itineraries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItineraries.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium">No itineraries found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by creating your first itinerary
            </p>
            <Button onClick={onCreateNew} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create New Itinerary
            </Button>
          </div>
        ) : (
          filteredItineraries.map((itinerary) => (
            <Card 
              key={itinerary._id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <CardTitle>{itinerary.title}</CardTitle>
                <CardDescription className="flex items-center text-sm text-gray-500">
                  <MapPin className="mr-1 h-4 w-4" />
                  {itinerary.destination}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Clock className="mr-1 h-4 w-4" />
                  {itinerary.duration}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{itinerary.description}</p>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => onViewItinerary(itinerary._id!)}>
                    View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onEditItinerary(itinerary._id!)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
