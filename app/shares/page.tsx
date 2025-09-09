"use client"

import { useEffect, useState } from "react"
import ShareManagement from "@/components/share-management"
import { IItinerary } from "@/models/Itinerary"

export default function SharesPage() {
  const [itineraries, setItineraries] = useState<IItinerary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchItineraries()
  }, [])

  const fetchItineraries = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/itineraries")
      
      if (!response.ok) {
        throw new Error("Failed to fetch itineraries")
      }

      const data = await response.json()
      setItineraries(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching itineraries:", error)
      setItineraries([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <ShareManagement availableItineraries={itineraries} />
    </div>
  )
}
