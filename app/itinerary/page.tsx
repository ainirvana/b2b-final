"use client"

import { useState, Suspense } from "react"
import { ItineraryList } from "@/components/itinerary-list"
import { ItineraryBuilder } from "@/components/itinerary-builder"
import { TopHeader } from "@/components/top-header"
import { Sidebar } from "@/components/sidebar"
import { ItinerarySetupModal } from "@/components/itinerary-setup-modal"
import { useRouter, useSearchParams } from "next/navigation"

function ItineraryPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const itineraryId = searchParams.get('id')
  const mode = searchParams.get('mode') // 'create', 'edit', 'view'
  const [currentView, setCurrentView] = useState<'list' | 'builder' | 'viewer'>(
    mode === 'create' ? 'builder' : mode === 'edit' ? 'builder' : itineraryId ? 'viewer' : 'list'
  )
  const [showSetupModal, setShowSetupModal] = useState(false)

  const handleCreateNew = () => {
    setShowSetupModal(true)
  }

  const handleViewItinerary = (id: string) => {
    // Fetch the itinerary to get its type for proper routing
    fetch(`/api/itineraries/${id}`)
      .then(res => res.json())
      .then(itinerary => {
        const type = itinerary.type || 'customized-package'
        router.push(`/itinerary/builder?id=${id}&mode=view&type=${type}`)
      })
      .catch(err => {
        console.error('Failed to fetch itinerary type:', err)
        // Fallback to default type
        router.push(`/itinerary/builder?id=${id}&mode=view&type=customized-package`)
      })
  }

  const handleEditItinerary = (id: string) => {
    setCurrentView('builder')
    // Fetch the itinerary to get its type for proper routing
    fetch(`/api/itineraries/${id}`)
      .then(res => res.json())
      .then(itinerary => {
        const type = itinerary.type || 'customized-package'
        router.push(`/itinerary/builder?id=${id}&mode=edit&type=${type}`)
      })
      .catch(err => {
        console.error('Failed to fetch itinerary type:', err)
        // Fallback to default type
        router.push(`/itinerary/builder?id=${id}&mode=edit&type=customized-package`)
      })
  }

  const handleBack = () => {
    setCurrentView('list')
    router.push('/itinerary')
  }

  const renderContent = () => {
    switch (currentView) {
      case 'builder':
        return <ItineraryBuilder itineraryId={itineraryId || undefined} onBack={handleBack} />
      case 'viewer':
        return <ItineraryBuilder itineraryId={itineraryId || undefined} onBack={handleBack} />
      default:
        return <ItineraryList onCreateNew={handleCreateNew} onViewItinerary={handleViewItinerary} onEditItinerary={handleEditItinerary} />
    }
  }

  // Handle setup modal close
  const handleSetupModalClose = () => {
    setShowSetupModal(false)
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-neutral-50 to-brand-primary-50/30">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-auto animate-fade-in">
          {renderContent()}
        </main>
      </div>
      <ItinerarySetupModal
        isOpen={showSetupModal}
        onClose={handleSetupModalClose}
      />
    </div>
  )
}

export default function ItineraryPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <ItineraryPageContent />
    </Suspense>
  )
}
