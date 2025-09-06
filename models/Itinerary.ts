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
  type: "fixed-group-tour" | "customized-package" | "cart-combo" | "html-editor" // NEW: Itinerary types
  createdBy: string
  lastUpdatedBy?: string // NEW: Track who last updated
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
  // NEW: Fixed Group Tour specific fields
  fixedDates?: {
    startDate: string
    endDate: string
    availableDates: string[]
    maxParticipants?: number
    currentBookings?: number
  }
  // NEW: Cart/Combo specific fields
  cartItems?: ICartItem[]
  // NEW: HTML Editor content
  htmlContent?: string
  htmlBlocks?: IHtmlBlock[]
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

// NEW: Cart/Combo item interface
export interface ICartItem {
  id: string
  productId: string
  name: string
  description: string
  category: "activity" | "hotel" | "flight" | "transfer" | "meal" | "other"
  price: number
  nights?: number // Not applicable for combo items except hotels
  quantity: number
  addedAt: Date
}

// NEW: HTML Block interface for HTML editor
export interface IHtmlBlock {
  id: string
  type: "heading" | "paragraph" | "list" | "image" | "divider" | "quote" | "table"
  content: string
  level?: number // For headings (h1, h2, h3, etc.)
  listType?: "ordered" | "unordered" // For lists
  items?: string[] // For list items
  imageUrl?: string
  imageCaption?: string
  order: number
  createdAt: Date
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
    type: {
      type: String,
      enum: ["fixed-group-tour", "customized-package", "cart-combo", "html-editor"],
      default: "customized-package",
    },
    createdBy: { type: String },
    lastUpdatedBy: { type: String },
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
    // Fixed Group Tour fields
    fixedDates: {
      startDate: String,
      endDate: String,
      availableDates: [String],
      maxParticipants: Number,
      currentBookings: { type: Number, default: 0 },
    },
    // Cart/Combo fields
    cartItems: [
      {
        id: { type: String, required: true },
        productId: { type: String, required: true },
        name: { type: String, required: true },
        description: String,
        category: {
          type: String,
          enum: ["activity", "hotel", "flight", "transfer", "meal", "other"],
          required: true,
        },
        price: { type: Number, required: true },
        nights: Number,
        quantity: { type: Number, default: 1 },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    // HTML Editor fields
    htmlContent: String,
    htmlBlocks: [
      {
        id: { type: String, required: true },
        type: {
          type: String,
          enum: ["heading", "paragraph", "list", "image", "divider", "quote", "table"],
          required: true,
        },
        content: String,
        level: Number,
        listType: { type: String, enum: ["ordered", "unordered"] },
        items: [String],
        imageUrl: String,
        imageCaption: String,
        order: { type: Number, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Itinerary || mongoose.model<IItinerary>("Itinerary", ItinerarySchema)
