"use client"

import { UtensilsCrossed, Coffee, Wine } from "lucide-react"
import { cn } from "@/lib/utils"

interface DayMealsProps {
  meals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  }
  onChange?: (meal: 'breakfast' | 'lunch' | 'dinner', value: boolean) => void
  className?: string
}

export function DayMeals({ meals, onChange, className }: DayMealsProps) {
  return (
    <div className={cn("bg-[#FFF8E7] p-4 rounded-md flex items-center justify-between min-h-[80px]", className)}>
      {/* Breakfast */}
      <div className="flex items-center gap-3 flex-1 border-r border-[#E5DBC4] px-6 cursor-pointer hover:bg-[#FFF3D9] transition-colors" onClick={() => onChange?.('breakfast', !meals.breakfast)}>
        <Coffee className="h-5 w-5" />
        <span className="text-sm font-medium">Breakfast</span>
        <div className="flex-1" />
        <span className={cn(
          "text-xs",
          meals.breakfast ? "text-green-600" : "text-gray-600"
        )}>
          {meals.breakfast ? "Included" : "Not Included"}
        </span>
      </div>

      {/* Lunch */}
      <div className="flex items-center gap-3 flex-1 border-r border-[#E5DBC4] px-6 cursor-pointer hover:bg-[#FFF3D9] transition-colors" onClick={() => onChange?.('lunch', !meals.lunch)}>
        <UtensilsCrossed className="h-5 w-5" />
        <span className="text-sm font-medium">Lunch</span>
        <div className="flex-1" />
        <span className={cn(
          "text-xs",
          meals.lunch ? "text-green-600" : "text-gray-600"
        )}>
          {meals.lunch ? "Included" : "Not Included"}
        </span>
      </div>

      {/* Dinner */}
      <div className="flex items-center gap-3 flex-1 px-6 cursor-pointer hover:bg-[#FFF3D9] transition-colors" onClick={() => onChange?.('dinner', !meals.dinner)}>
        <Wine className="h-5 w-5" />
        <span className="text-sm font-medium">Dinner</span>
        <div className="flex-1" />
        <span className={cn(
          "text-xs",
          meals.dinner ? "text-green-600" : "text-gray-600"
        )}>
          {meals.dinner ? "Included" : "Not Included"}
        </span>
      </div>
    </div>
  )
}
