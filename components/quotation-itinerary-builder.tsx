"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
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
  const { createItinerary } = useItineraries()
  const { convertItineraryToQuotation } = useQuotations()
  const { toast } = useToast()
  const router = useRouter()

  const handleItineraryComplete = async (itineraryData: any) => {
    setIsCreating(true)
    try {
      // First create the itinerary with a special flag to mark it as quotation-only
      const itineraryResult = await createItinerary({
        ...itineraryData,
        isQuotationOnly: true, // Special flag to prevent it from showing in main itinerary list
        quotationLead: leadData, // Store lead data with the itinerary
      })

      if (itineraryResult && itineraryResult._id) {
        // Convert the itinerary to a quotation immediately
        const quotationId = await convertItineraryToQuotation(
          itineraryResult._id,
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
            description: "Itinerary created and converted to quotation successfully!",
          })
          router.push(`/quotation-builder/${quotationId}`)
        }
      }
    } catch (error) {
      console.error("Error creating itinerary for quotation:", error)
      toast({
        title: "Error",
        description: "Failed to create itinerary. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-white">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} disabled={isCreating}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Itinerary for Quotation</h1>
            <p className="text-sm text-gray-500">
              Build an itinerary for {leadData.name} that will be converted to a quotation
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ItineraryBuilderForQuotation
          onComplete={handleItineraryComplete}
          isCreating={isCreating}
          leadData={leadData}
        />
      </div>
    </div>
  )
}

// Internal component that wraps the ItineraryBuilder for quotation-specific use
function ItineraryBuilderForQuotation({ 
  onComplete, 
  isCreating,
  leadData 
}: { 
  onComplete: (data: any) => void
  isCreating: boolean
  leadData: any
}) {
  return (
    <div className="h-full p-6">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Build Your Itinerary</CardTitle>
          <p className="text-sm text-gray-600">
            Create a detailed itinerary that will be used as the basis for your quotation.
            Add destinations, activities, hotels, and other travel components.
          </p>
        </CardHeader>
        <CardContent className="h-full">
          {/* Custom itinerary builder interface for quotations */}
          <QuotationSpecificItineraryBuilder 
            onComplete={onComplete}
            isCreating={isCreating}
            leadData={leadData}
          />
        </CardContent>
      </Card>
    </div>
  )
}

// Simplified itinerary builder specifically for quotation workflow
function QuotationSpecificItineraryBuilder({ 
  onComplete, 
  isCreating,
  leadData 
}: { 
  onComplete: (data: any) => void
  isCreating: boolean
  leadData: any
}) {
  const [step, setStep] = useState<'basic' | 'detailed'>('basic')
  const [title, setTitle] = useState(`${leadData.name}'s Itinerary`)
  const [description, setDescription] = useState(leadData.remarks || "")
  const [destination, setDestination] = useState("")
  const [duration, setDuration] = useState("5 days")
  const [basicItineraryData, setBasicItineraryData] = useState<any>(null)
  
  const handleCreateBasicItinerary = () => {
    const data = {
      title,
      description,
      destination,
      duration,
      currency: "USD",
      totalPrice: 0,
      days: [
        {
          day: 1,
          date: new Date().toISOString().split('T')[0],
          title: "Arrival",
          description: "Arrival day",
          events: [],
          meals: { breakfast: false, lunch: false, dinner: false }
        }
      ],
      highlights: [],
      images: [],
      countries: destination ? [destination] : [],
      type: "customized-package",
      status: "draft",
      createdBy: "quotation-agent",
    }
    
    setBasicItineraryData(data)
    setStep('detailed')
  }

  const handleDetailedComplete = (detailedData: any) => {
    onComplete({
      ...basicItineraryData,
      ...detailedData,
      isQuotationOnly: true,
      quotationLead: leadData,
    })
  }

  if (step === 'detailed' && basicItineraryData) {
    return (
      <div className="h-full">
        <div className="mb-4">
          <Button 
            variant="ghost" 
            onClick={() => setStep('basic')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Basic Info
          </Button>
        </div>
        <ItineraryBuilderEmbedded 
          initialData={basicItineraryData}
          onComplete={handleDetailedComplete}
          isCreating={isCreating}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div>
          <label className="text-sm font-medium">Itinerary Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-md"
            placeholder="Enter itinerary title"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Destination</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-md"
            placeholder="Enter destination"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Duration</label>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-md"
            placeholder="e.g., 5 days, 1 week"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-md"
            rows={3}
            placeholder="Brief description of the trip"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleCreateBasicItinerary}
          disabled={isCreating || !title || !destination}
          className="min-w-[200px]"
        >
          Continue to Detailed Builder
        </Button>
      </div>
      
      <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
        <p className="font-medium mb-2">Next Steps:</p>
        <ul className="space-y-1 text-xs">
          <li>• Set basic itinerary information</li>
          <li>• Build detailed day-by-day itinerary</li>
          <li>• Add activities, hotels, and transportation</li>
          <li>• Set pricing for each component</li>
          <li>• Convert to quotation automatically</li>
        </ul>
      </div>
    </div>
  )
}

// Embedded itinerary builder component
function ItineraryBuilderEmbedded({ 
  initialData, 
  onComplete, 
  isCreating 
}: { 
  initialData: any
  onComplete: (data: any) => void
  isCreating: boolean
}) {
  const [itineraryData, setItineraryData] = useState(initialData)

  const handleSave = () => {
    onComplete(itineraryData)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        {/* This would integrate with the full ItineraryBuilder component */}
        <div className="h-full p-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Detailed Itinerary Builder</h3>
            <p className="text-gray-600 mb-4">
              Here you would build the detailed itinerary with days, events, pricing, etc.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Current itinerary: {itineraryData.title} - {itineraryData.destination}
            </p>
            <Button onClick={handleSave} disabled={isCreating}>
              {isCreating ? "Creating Quotation..." : "Complete & Create Quotation"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}