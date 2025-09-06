import mongoose from "mongoose"

export interface IItinerary {
  _id?: string
  productId: string
  title: string
  description: string
  destination: string
  countries: string[]; // NEW: support single or multiple countries
  duration: string
  totalPrice: number
  currency: string
  status: "draft" | "published" | "archived"
  createdBy: string
  createdAt: Date
  updatedAt: Date
  days: IItineraryDay[]
  highlights: string[]
  images: string[]
  gallery?: IGalleryItem[] // NEW: Gallery section for multimedia files
  branding?: {
    headerLogo?: string
    headerText?: string
    footerLogo?: string
    footerText?: string
    primaryColor?: string
    secondaryColor?: string
  }
  // NEW: Itinerary type categorization
  itineraryType: "fixed-group" | "customized" | "cart-combo" | "html-editor"
  // For Fixed Group Tours
  fixedDates?: {
    startDate: Date
    endDate: Date
    availableDates: Date[]
    maxGroupSize?: number
  }
  // For Cart/Combo items  
  cartItems?: ICartItem[]
  // For HTML Editor mode
  htmlContent?: string
  // Metadata tracking
  lastUpdatedBy?: string
  lastUpdatedAt?: Date
}

export interface IGalleryItem {
  id: string
  url: string
  type: "image" | "video"
  caption?: string
  altText?: string
  fileName: string
  uploadedAt: Date
}

export interface ICartItem {
  id: string
  name: string
  productId: string
  description: string
  category: "hotel" | "flight" | "activity" | "transfer" | "meal" | "other"
  price?: number
  location?: string
  // Hotel specific
  nights?: number
  roomType?: string
  // Activity specific  
  duration?: string
  difficulty?: string
  // No dates for cart items - they are standalone
}

export interface IItineraryDay {
  day: number
  date: string
  title: string
  description?: string
  detailedDescription?: string
  events: IItineraryEvent[]
  nights?: number
  meals: {
    breakfast: boolean
    lunch: boolean
    dinner: boolean
  }
}

export interface IItineraryEvent {
  id: string
  category: 
    | "flight"
    | "hotel"
    | "activity"
    | "transfer"
    | "meal"
    | "photo"
    | "other"
    | "heading"
    | "paragraph"
    | "list"
    | "image"
  title: string
  description: string
  time?: string
  location?: string
  price?: number
  componentSource?: "manual" | "my-library" | "global-library" | "my-library-edited" | "global-library-edited"
  libraryItemId?: string
  originalLibraryId?: string
  versionHistory?: Array<{
    timestamp: Date
    action: "created" | "edited" | "imported"
    source: string
  }>
  highlights?: string[]
  listItems?: string[]
  // Activity specific
  duration?: string
  difficulty?: "easy" | "moderate" | "hard" | string
  capacity?: number
  // Hotel specific
  checkIn?: string
  checkOut?: string
  amenities?: string[]
  hotelName?: string
  roomCategory?: string
  hotelRating?: number
  mealPlan?: string // BLD format (Breakfast, Lunch, Dinner)
  hotelNotes?: string
  // Flight specific
  fromCity?: string
  toCity?: string
  mainPoint?: string
  airlines?: string
  flightNumber?: string
  startTime?: string
  endTime?: string
  flightClass?: string
  flightNotes?: string
  // Transfer specific
  fromLocation?: string
  toLocation?: string
  vehicleType?: string
  // Image specific
  imageUrl?: string
  imageCaption?: string
  imageAlt?: string
  // Meal specific
  meals?: {
    breakfast: boolean
    lunch: boolean
    dinner: boolean
  }
  // Additional properties
  nights?: number
  images?: string[]
  subtitle?: string
  additionalInfoSections?: {
    heading: string
    content: string
  }[]
}

const ItineraryEventSchema = new mongoose.Schema({
  id: { type: String, required: true },
  time: { type: String },
  category: {
    type: String,
    enum: [
      "flight",
      "hotel",
      "activity",
      "transfer",
      "meal",
      "photo",
      "other",
      "heading",
      "paragraph",
      "list",
      "image",
    ],
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: String,
  mainPoint: String,
  highlights: [String],
  fromCity: String,
  toCity: String,
  airlines: String,
  flightNumber: String,
  startTime: String,
  endTime: String,
  flightClass: String,
  flightNotes: String,
  nights: Number,
  checkIn: String,
  checkOut: String,
  images: [String],
  price: { type: Number, default: 0 },
  libraryItemId: String,
  componentSource: {
    type: String,
    enum: ["manual", "my-library", "global-library", "my-library-edited", "global-library-edited"],
  },
  originalLibraryId: String,
  versionHistory: [
    {
      timestamp: Date,
      action: { type: String, enum: ["created", "edited", "imported"] },
      source: String,
    },
  ],
  imageUrl: String,
  imageCaption: String,
  imageAlt: String,
  listItems: [String],
  subtitle: String,
})

const ItineraryDaySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  date: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  detailedDescription: String,
  events: [ItineraryEventSchema],
  nights: Number,
  meals: {
    breakfast: Boolean,
    lunch: Boolean,
    dinner: Boolean,
  },
})

const ItinerarySchema = new mongoose.Schema(
  {
    productId: { type: String },
    title: { type: String },
    description: { type: String },
    destination: { type: String },
    countries: { type: [String] }, // Removed required constraint
    duration: { type: String },
    totalPrice: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    createdBy: { type: String },
    days: [ItineraryDaySchema],
    highlights: [String],
    images: [String],
    gallery: [
      {
        id: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, enum: ["image", "video"], required: true },
        caption: String,
        altText: String,
        fileName: { type: String, required: true },
        uploadedAt: { type: Date, required: true },
      },
    ],
    branding: {
      headerLogo: String,
      headerText: String,
      footerLogo: String,
      footerText: String,
      primaryColor: String,
      secondaryColor: String,
    },
    // NEW: Itinerary type categorization
    itineraryType: {
      type: String,
      enum: ["fixed-group", "customized", "cart-combo", "html-editor"],
      default: "customized",
    },
    // For Fixed Group Tours
    fixedDates: {
      startDate: Date,
      endDate: Date,
      availableDates: [Date],
      maxGroupSize: Number,
    },
    // For Cart/Combo items
    cartItems: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        productId: { type: String, required: true },
        description: String,
        category: {
          type: String,
          enum: ["hotel", "flight", "activity", "transfer", "meal", "other"],
          required: true,
        },
        price: Number,
        location: String,
        nights: Number,
        roomType: String,
        duration: String,
        difficulty: String,
      },
    ],
    // For HTML Editor mode
    htmlContent: String,
    // Metadata tracking
    lastUpdatedBy: String,
    lastUpdatedAt: Date,
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Itinerary || mongoose.model<IItinerary>("Itinerary", ItinerarySchema)
