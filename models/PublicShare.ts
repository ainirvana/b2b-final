import mongoose from "mongoose"

export interface IPublicShare {
  _id?: string
  shareId: string // UUID for public URL
  title: string
  description?: string
  shareType: "individual" | "collection"
  // For individual sharing
  itineraryId?: string
  // For collection sharing
  itineraryIds?: string[]
  createdBy: string
  isActive: boolean
  expiresAt?: Date
  passwordProtected?: boolean
  password?: string
  viewCount: number
  createdAt: Date
  updatedAt: Date
  settings: {
    allowComments: boolean
    showPricing: boolean
    showContactInfo: boolean
    customBranding?: {
      logo?: string
      primaryColor?: string
      secondaryColor?: string
      companyName?: string
      contactEmail?: string
      contactPhone?: string
    }
  }
}

export interface IShareView {
  _id?: string
  shareId: string
  viewerIP: string
  viewerLocation?: string
  userAgent: string
  viewedAt: Date
  referrer?: string
}

const shareViewSchema = new mongoose.Schema({
  shareId: { type: String, required: true, index: true },
  viewerIP: { type: String, required: true },
  viewerLocation: { type: String },
  userAgent: { type: String, required: true },
  viewedAt: { type: Date, default: Date.now },
  referrer: { type: String }
})

const publicShareSchema = new mongoose.Schema({
  shareId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  title: { type: String, required: true },
  description: { type: String },
  shareType: { 
    type: String, 
    enum: ["individual", "collection"], 
    required: true 
  },
  itineraryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Itinerary",
    required: function(this: IPublicShare) { return this.shareType === "individual" }
  },
  itineraryIds: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Itinerary",
    required: function(this: IPublicShare) { return this.shareType === "collection" }
  }],
  createdBy: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date },
  passwordProtected: { type: Boolean, default: false },
  password: { type: String },
  viewCount: { type: Number, default: 0 },
  settings: {
    allowComments: { type: Boolean, default: false },
    showPricing: { type: Boolean, default: true },
    showContactInfo: { type: Boolean, default: true },
    customBranding: {
      logo: { type: String },
      primaryColor: { type: String },
      secondaryColor: { type: String },
      companyName: { type: String },
      contactEmail: { type: String },
      contactPhone: { type: String }
    }
  }
}, {
  timestamps: true
})

// Add indexes for better performance
publicShareSchema.index({ shareId: 1 })
publicShareSchema.index({ createdBy: 1 })
publicShareSchema.index({ shareType: 1 })
publicShareSchema.index({ isActive: 1 })
publicShareSchema.index({ expiresAt: 1 })

shareViewSchema.index({ shareId: 1, viewedAt: -1 })

const PublicShare = mongoose.models.PublicShare || mongoose.model<IPublicShare>("PublicShare", publicShareSchema)
const ShareView = mongoose.models.ShareView || mongoose.model<IShareView>("ShareView", shareViewSchema)

export { PublicShare, ShareView }
export default PublicShare
