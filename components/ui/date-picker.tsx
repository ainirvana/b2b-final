"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DatePickerProps {
  date?: Date | null
  onDateChange?: (date: Date | null) => void
  placeholder?: string
  className?: string
}

export function DatePicker({ 
  date, 
  onDateChange, 
  placeholder = "Pick a date",
  className 
}: DatePickerProps) {
  const [inputValue, setInputValue] = React.useState(
    date ? format(date, "yyyy-MM-dd") : ""
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    
    if (value) {
      const newDate = new Date(value)
      if (!isNaN(newDate.getTime())) {
        onDateChange?.(newDate)
      }
    } else {
      onDateChange?.(null)
    }
  }

  React.useEffect(() => {
    setInputValue(date ? format(date, "yyyy-MM-dd") : "")
  }, [date])

  return (
    <div className={cn("relative", className)}>
      <Input
        type="date"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full"
      />
    </div>
  )
}