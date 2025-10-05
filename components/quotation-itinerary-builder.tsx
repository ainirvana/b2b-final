"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save } from "lucide-react"
import { ItineraryBuilder } from "@/components/itinerary-builder"
import { useItineraries } from "@/hooks/use-itineraries"
import { useQuotations } from "@/hooks/use-quotations"
import { useToast } from "@/hooks/use-toast"

interface QuotationItineraryBuilderProps {
  leadData: {
    name: string
    leadDate?: string
    leadReferenceNo?: string
    remarks: string
    contactDetails?: string
  }
  onBack: () => void
}

export function QuotationItineraryBuilder({ leadData, onBack }: QuotationItineraryBuilderProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [createdItineraryId, setCreatedItineraryId] = useState<string | null>(null)
  const { createItinerary } = useItineraries()
  const { convertItineraryToQuotation } = useQuotations()
  const { toast } = useToast()
  const router = useRouter()

  // Handle when user completes building the itinerary
  const handleCompleteAndCreateQuotation = async () => {
    if (!createdItineraryId) {
      toast({
        title: "Error",
        description: "Please save your itinerary first before creating quotation.",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      // Convert the itinerary to a quotation
      const quotationId = await convertItineraryToQuotation(
        createdItineraryId,
        {
          name: leadData.name,
          email: leadData.contactDetails || "",
          phone: "",
          referenceNo: leadData.leadReferenceNo || "",
          notes: leadData.remarks || "",
        }
      )

      if (quotationId) {
        toast({
          title: "Success",
          description: "Itinerary converted to quotation successfully!",
        })
        router.push(`/quotation-builder/${quotationId}`)
      }
    } catch (error) {
      console.error("Error converting itinerary to quotation:", error)
      toast({
        title: "Error",
        description: "Failed to create quotation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} disabled={isCreating}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold">Create Itinerary for Quotation</h1>
            <p className="text-sm text-gray-500">
              Build an itinerary for {leadData.name} that will be converted to a quotation
            </p>
          </div>
        </div>
        
        {createdItineraryId && (
          <Button 
            onClick={handleCompleteAndCreateQuotation}
            disabled={isCreating}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {isCreating ? "Creating Quotation..." : "Complete & Create Quotation"}
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <QuotationItineraryBuilderContent
          leadData={leadData}
          onItineraryCreated={setCreatedItineraryId}
          onSaveRequested={async () => {
            // This will be called when the itinerary is saved
            console.log("[DEBUG] Itinerary saved, ready for quotation conversion")
          }}
        />
      </div>
    </div>
  )
}

// Internal component that uses the full ItineraryBuilder with quotation-specific setup
function QuotationItineraryBuilderContent({ 
  leadData,
  onItineraryCreated,
  onSaveRequested
}: { 
  leadData: any
  onItineraryCreated: (id: string) => void
  onSaveRequested?: () => Promise<void>
}) {
  const [tempItineraryId, setTempItineraryId] = useState<string | null>(null)
  const { createItinerary } = useItineraries()
  const { toast } = useToast()

  // Create a temporary itinerary for the builder to work with
  useEffect(() => {
    console.log("[DEBUG] QuotationItineraryBuilderContent useEffect triggered")
    const initializeItinerary = async () => {
      try {
        console.log("[DEBUG] Initializing temporary itinerary for quotation")
        const initialData = {
          title: `${leadData.name}'s Itinerary`,
          description: leadData.remarks || "Itinerary created for quotation",
          destination: "Enter destination",
          duration: "5 days",
          currency: "USD",
          totalPrice: 0,
          status: "draft" as const,
          type: "customized-package" as const,
          createdBy: "agent-user",
          countries: [],
          days: [
            {
              day: 1,
              date: new Date().toISOString().split("T")[0],
              title: "Day 1",
              description: "",
              detailedDescription: "",
              events: [],
              nights: 0,
              meals: {
                breakfast: false,
                lunch: false,
                dinner: false,
              },
            }
          ],
          highlights: [],
          images: [],
          // Mark as quotation-only to prevent showing in main itinerary list
          isQuotationOnly: true,
          quotationLead: leadData,
        }

        const result = await createItinerary(initialData)
        if (result && result._id) {
          console.log("[DEBUG] Temporary itinerary created with ID:", result._id)
          setTempItineraryId(result._id)
          onItineraryCreated(result._id)
        }
      } catch (error) {
        console.error("Error creating temporary itinerary:", error)
        toast({
          title: "Error",
          description: "Failed to initialize itinerary builder",
          variant: "destructive",
        })
      }
    }

    if (!tempItineraryId) {
      initializeItinerary()
    }
  }, [leadData, createItinerary, onItineraryCreated, toast, tempItineraryId])

  // Custom onBack handler that doesn't navigate away
  const handleBack = () => {
    // Don't navigate back from here - the parent component handles this
    return
  }

  if (!tempItineraryId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-medium">Initializing Itinerary Builder...</p>
          <p className="text-sm text-gray-500">Setting up your workspace</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <ItineraryBuilder 
        itineraryId={tempItineraryId}
        onBack={handleBack}
        onSave={onSaveRequested}
      />
    </div>
  )
}