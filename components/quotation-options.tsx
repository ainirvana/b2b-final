"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Package, Upload } from "lucide-react"
import { ComingSoon } from "./coming-soon"

interface QuotationOptionsProps {
  onOptionSelect: (option: string) => void
}

export function QuotationOptions({ onOptionSelect }: QuotationOptionsProps) {
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
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Choose Your Starting Point</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  onClick={() => onOptionSelect(option.id)}
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
