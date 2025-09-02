"use client"

import { useEffect, useState } from "react"
import { ItineraryBuilder } from "@/components/itinerary-builder"
import { useRouter } from "next/navigation"

export default function ItineraryBuilderPage() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleBack = () => {
    router.push('/itinerary')
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ItineraryBuilder onBack={handleBack} />
    </div>
  )
}
