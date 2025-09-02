import { IItineraryEvent } from "@/models/Itinerary"

export interface LibraryItem {
  _id: string
  title: string
  category: string
  subCategory?: string
  city?: string
  country?: string
  startDate?: string
  endDate?: string
  labels?: string
  notes?: string
  transferOptions?: string[]
  basePrice?: number
  currency: string
  availableFrom?: Date
  availableUntil?: Date
  variants?: string
  multimedia: string[]
  createdAt: Date
  updatedAt: Date
  extraFields?: Record<string, any>
}

export class LibraryToItineraryConverter {
  private static categoryMapping: { [key: string]: IItineraryEvent['category'] } = {
    'flight': 'flight',
    'hotel': 'hotel',
    'activity': 'activity',
    'transfer': 'transfer',
    'meal': 'meal',
    'restaurant': 'meal',
    'dining': 'meal',
    'transport': 'transfer',
    'transportation': 'transfer',
    'accommodation': 'hotel',
    'lodging': 'hotel',
    'sightseeing': 'activity',
    'tour': 'activity',
    'experience': 'activity'
  }

  static convertToItineraryEvent(libraryItem: LibraryItem, customTime?: string): IItineraryEvent {
    const category = this.categoryMapping[libraryItem.category.toLowerCase()] || 'activity'
    const baseTime = customTime || this.getDefaultTimeForCategory(category)
    
    const baseEvent: IItineraryEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category,
      source: "library",
      libraryItemId: libraryItem._id,
      isEdited: false,
      title: libraryItem.title,
      description: this.buildDescription(libraryItem),
      time: baseTime,
      location: this.buildLocation(libraryItem),
      highlights: this.extractHighlights(libraryItem),
      images: libraryItem.multimedia || [],
      price: libraryItem.basePrice || 0,
      libraryItemId: libraryItem._id
    }

    // Add category-specific fields
    switch (category) {
      case 'flight':
        return {
          ...baseEvent,
          ...this.buildFlightFields(libraryItem)
        }
      case 'hotel':
        return {
          ...baseEvent,
          ...this.buildHotelFields(libraryItem)
        }
      case 'activity':
        return {
          ...baseEvent,
          ...this.buildActivityFields(libraryItem)
        }
      case 'transfer':
        return {
          ...baseEvent,
          ...this.buildTransferFields(libraryItem)
        }
      case 'meal':
        return {
          ...baseEvent,
          ...this.buildMealFields(libraryItem)
        }
      default:
        return baseEvent
    }
  }

  private static getDefaultTimeForCategory(category: IItineraryEvent['category']): string {
    switch (category) {
      case 'flight':
        return '08:00'
      case 'hotel':
        return '14:00'
      case 'activity':
        return '10:00'
      case 'transfer':
        return '09:00'
      case 'meal':
        return '19:00'
      default:
        return '09:00'
    }
  }

  private static buildDescription(libraryItem: LibraryItem): string {
    let description = libraryItem.notes || `${libraryItem.title} from library`
    
    // Add subcategory if available
    if (libraryItem.subCategory) {
      description += ` (${libraryItem.subCategory})`
    }
    
    // Add labels if available
    if (libraryItem.labels) {
      description += `\n\nLabels: ${libraryItem.labels}`
    }
    
    // Add extra fields if available
    if (libraryItem.extraFields) {
      const extraInfo = Object.entries(libraryItem.extraFields)
        .filter(([_, value]) => value && value !== '')
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')
      
      if (extraInfo) {
        description += `\n\nAdditional Info: ${extraInfo}`
      }
    }

    return description
  }

  private static buildLocation(libraryItem: LibraryItem): string {
    const locationParts = [libraryItem.city, libraryItem.country].filter(Boolean)
    return locationParts.join(', ')
  }

  private static extractHighlights(libraryItem: LibraryItem): string[] {
    const highlights: string[] = []
    
    // Add labels as highlights
    if (libraryItem.labels) {
      highlights.push(...libraryItem.labels.split(',').map(label => label.trim()))
    }
    
    // Add variants as highlights
    if (libraryItem.variants) {
      highlights.push(libraryItem.variants)
    }
    
    // Add transfer options as highlights
    if (libraryItem.transferOptions && libraryItem.transferOptions.length > 0) {
      highlights.push(...libraryItem.transferOptions)
    }

    return highlights.filter(Boolean)
  }

  private static buildFlightFields(libraryItem: LibraryItem) {
    return {
      fromCity: libraryItem.extraFields?.departure || 'Enter departure city',
      toCity: libraryItem.city || libraryItem.extraFields?.arrival || 'Enter destination city',
      mainPoint: libraryItem.notes || `Flight: ${libraryItem.title}`
    }
  }

  private static buildHotelFields(libraryItem: LibraryItem) {
    const checkInTime = libraryItem.extraFields?.checkin || '14:00'
    const checkOutTime = libraryItem.extraFields?.checkout || '12:00'
    const nights = libraryItem.extraFields?.nights ? parseInt(libraryItem.extraFields.nights) : 1

    return {
      checkIn: checkInTime,
      checkOut: checkOutTime,
      nights: nights,
      meals: {
        breakfast: libraryItem.extraFields?.breakfast === true || libraryItem.extraFields?.breakfast === 'true',
        lunch: libraryItem.extraFields?.lunch === true || libraryItem.extraFields?.lunch === 'true',
        dinner: libraryItem.extraFields?.dinner === true || libraryItem.extraFields?.dinner === 'true'
      }
    }
  }

  private static buildActivityFields(libraryItem: LibraryItem) {
    return {
      // Activities can include meals too
      ...(libraryItem.extraFields?.includesMeals && {
        meals: {
          breakfast: libraryItem.extraFields?.breakfast === true,
          lunch: libraryItem.extraFields?.lunch === true,
          dinner: libraryItem.extraFields?.dinner === true
        }
      })
    }
  }

  private static buildTransferFields(libraryItem: LibraryItem) {
    return {
      fromCity: libraryItem.extraFields?.fromLocation || 'Pick-up location',
      toCity: libraryItem.extraFields?.toLocation || libraryItem.city || 'Drop-off location'
    }
  }

  private static buildMealFields(libraryItem: LibraryItem) {
    return {
      // Meal-specific fields could be added here
      mainPoint: `${libraryItem.title} dining experience`
    }
  }

  static getPreviewSummary(libraryItem: LibraryItem): string {
    const location = this.buildLocation(libraryItem)
    const price = libraryItem.basePrice ? `${libraryItem.currency} ${libraryItem.basePrice}` : 'Price on request'
    const parts = [libraryItem.title, location, price].filter(Boolean)
    return parts.join(' • ')
  }

  static validateLibraryItemForItinerary(libraryItem: LibraryItem): { isValid: boolean; issues: string[] } {
    const issues: string[] = []

    if (!libraryItem.title?.trim()) {
      issues.push('Title is required')
    }

    if (!libraryItem.category?.trim()) {
      issues.push('Category is required')
    }

    if (libraryItem.category?.toLowerCase() === 'flight' && !libraryItem.city) {
      issues.push('Destination city is required for flights')
    }

    if (libraryItem.category?.toLowerCase() === 'hotel' && !libraryItem.city) {
      issues.push('Location is required for hotels')
    }

    return {
      isValid: issues.length === 0,
      issues
    }
  }
}
