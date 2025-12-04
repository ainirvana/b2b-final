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
    <div className={cn("bg-[#FFF8E7] p-3 rounded-md flex items-center justify-between gap-4 mt-2", className)}>
      {/* Breakfast */}
      <div className="flex items-center gap-2 flex-1 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onChange?.('breakfast', !meals.breakfast)}>
        <Coffee className="h-4 w-4 text-gray-700" />
        <span className="text-sm font-medium text-gray-800">Breakfast</span>
        <span className={cn(
          "ml-auto text-lg font-bold",
          meals.breakfast ? "text-green-600" : "text-red-500"
        )}>
          {meals.breakfast ? "✓" : "✗"}
        </span>
      </div>

      <div className="h-6 w-px bg-[#E5DBC4]" />

      {/* Lunch */}
      <div className="flex items-center gap-2 flex-1 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onChange?.('lunch', !meals.lunch)}>
        <UtensilsCrossed className="h-4 w-4 text-gray-700" />
        <span className="text-sm font-medium text-gray-800">Lunch</span>
        <span className={cn(
          "ml-auto text-lg font-bold",
          meals.lunch ? "text-green-600" : "text-red-500"
        )}>
          {meals.lunch ? "✓" : "✗"}
        </span>
      </div>

      <div className="h-6 w-px bg-[#E5DBC4]" />

      {/* Dinner */}
      <div className="flex items-center gap-2 flex-1 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onChange?.('dinner', !meals.dinner)}>
        <Wine className="h-4 w-4 text-gray-700" />
        <span className="text-sm font-medium text-gray-800">Dinner</span>
        <span className={cn(
          "ml-auto text-lg font-bold",
          meals.dinner ? "text-green-600" : "text-red-500"
        )}>
          {meals.dinner ? "✓" : "✗"}
        </span>
      </div>
    </div>
  )
}
