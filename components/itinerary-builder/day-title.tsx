"use client"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface DayTitleProps {
  day: number
  title: string
  nights?: number
  onTitleChange: (title: string) => void
  onNightsChange?: (nights: string) => void
}

export function DayTitle({ day, title, nights, onTitleChange, onNightsChange }: DayTitleProps) {
  return (
    <div className="flex items-center space-x-4">
      <Badge variant="secondary" className="bg-orange-100 text-orange-600 border-none py-1 px-3">
        DAY {day}
      </Badge>
      <Input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="text-lg font-medium border-none p-0 h-auto bg-transparent w-64"
        placeholder="Enter day title"
      />
      {onNightsChange && (
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            value={nights || ""}
            onChange={(e) => onNightsChange(e.target.value)}
            className="w-12 h-8 p-1 text-center"
            min={0}
          />
          <span className="text-sm text-gray-600">Night(s)</span>
        </div>
      )}
    </div>
  )
}
