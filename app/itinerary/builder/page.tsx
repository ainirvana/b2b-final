"use client"

import { useEffect, useState, Suspense } from "react"
import { ItineraryBuilder } from "@/components/itinerary-builder"
import { CartComboBuilder } from "@/components/cart-combo-builder"
import { HtmlEditor } from "@/components/html-editor"
import { useRouter, useSearchParams } from "next/navigation"

function ItineraryBuilderContent() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const itineraryType = searchParams.get('itineraryType') || 'customized'
  const name = searchParams.get('name') || ''
  const productId = searchParams.get('productId') || ''
  const description = searchParams.get('description') || ''
  const days = searchParams.get('days') || ''
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const maxGroupSize = searchParams.get('maxGroupSize') || ''

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleBack = () => {
    router.push('/itinerary')
  }

  if (!mounted) {
    return null
  }

  const itineraryData = {
    name,
    productId,
    description,
    days,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    maxGroupSize: maxGroupSize ? Number(maxGroupSize) : undefined,
  }

  // Route to appropriate builder based on itinerary type
  switch (itineraryType) {
    case 'cart-combo':
      return (
        <div className="min-h-screen flex flex-col">
          <CartComboBuilder onBack={handleBack} itineraryData={itineraryData} />
        </div>
      )
    case 'html-editor':
      return (
        <div className="min-h-screen flex flex-col">
          <HtmlEditor onBack={handleBack} itineraryData={itineraryData} />
        </div>
      )
    case 'fixed-group':
    case 'customized':
    default:
      return (
        <div className="min-h-screen flex flex-col">
          <ItineraryBuilder 
            onBack={handleBack} 
            itineraryType={itineraryType as any}
            itineraryData={itineraryData}
          />
        </div>
      )
  }
}

export default function ItineraryBuilderPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading builder...</div>}>
      <ItineraryBuilderContent />
    </Suspense>
  )
}
