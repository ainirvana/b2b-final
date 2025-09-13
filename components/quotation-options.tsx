"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Package, Upload, FileText } from "lucide-react"
import { ComingSoon } from "./coming-soon"
import { useRouter } from "next/navigation"

interface QuotationOptionsProps {
  onOptionSelect: (option: string) => void
}

export function QuotationOptions({ onOptionSelect }: QuotationOptionsProps) {
  const router = useRouter()
  
  const options = [
    {
      id: "new-cart",
      title: "Creating New Cart",
      description: "Start with an empty cart and add items manually",
      icon: ShoppingCart,
    },
    {
      id: "new-itinerary",
      title: "Create New Itinerary",
      description: "Build a new itinerary from scratch",
      icon: Package,
    },
    {
      id: "import-itinerary",
      title: "Import Saved Itinerary",
      description: "Import and customize an existing saved itinerary",
      icon: Upload,
    },
    {
      id: "convert-from-itinerary",
      title: "Convert from Itinerary",
      description: "Convert an existing itinerary to a quotation with pricing controls",
      icon: FileText,
    },
  ]

  const handleSelect = (optionId: string) => {
    if (optionId === "convert-from-itinerary") {
      router.push("/itinerary?selectForQuotation=true")
    } else {
      onOptionSelect(optionId)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Choose Your Starting Point</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {options.map((option) => {
          const Icon = option.icon
          return (
            <Card key={option.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {option.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{option.description}</p>
                <Button
                  onClick={() => handleSelect(option.id)}
                  className="w-full"
                >
                  Select
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
