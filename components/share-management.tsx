"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Share2, 
  Eye, 
  Copy, 
  Trash2, 
  Edit, 
  Calendar, 
  Lock, 
  Unlock,
  ExternalLink,
  Plus,
  Loader2,
  Settings
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { IPublicShare } from "@/models/PublicShare"
import { IItinerary } from "@/models/Itinerary"

interface ShareWithItineraries extends IPublicShare {
  itinerary?: IItinerary
  itineraries?: IItinerary[]
}

interface CreateShareModalProps {
  isOpen: boolean
  onClose: () => void
  onShareCreated: (share: ShareWithItineraries) => void
  availableItineraries: IItinerary[]
}

function CreateShareModal({ isOpen, onClose, onShareCreated, availableItineraries }: CreateShareModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shareType: "individual" as "individual" | "collection",
    itineraryId: "",
    itineraryIds: [] as string[],
    expiresAt: "",
    passwordProtected: false,
    password: "",
    settings: {
      allowComments: false,
      showPricing: true,
      showContactInfo: true,
      customBranding: {
        companyName: "",
        contactEmail: "",
        contactPhone: "",
        primaryColor: "",
        logo: ""
      }
    }
  })
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your share",
        variant: "destructive"
      })
      return
    }

    if (formData.shareType === "individual" && !formData.itineraryId) {
      toast({
        title: "Itinerary Required",
        description: "Please select an itinerary to share",
        variant: "destructive"
      })
      return
    }

    if (formData.shareType === "collection" && formData.itineraryIds.length === 0) {
      toast({
        title: "Itineraries Required",
        description: "Please select at least one itinerary for the collection",
        variant: "destructive"
      })
      return
    }

    try {
      setCreating(true)
      const response = await fetch("/api/shares", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create share")
      }

      const result = await response.json()
      onShareCreated(result.share)
      onClose()
      
      toast({
        title: "Share Created",
        description: `Your ${formData.shareType} share has been created successfully!`
      })

      // Reset form
      setFormData({
        title: "",
        description: "",
        shareType: "individual",
        itineraryId: "",
        itineraryIds: [],
        expiresAt: "",
        passwordProtected: false,
        password: "",
        settings: {
          allowComments: false,
          showPricing: true,
          showContactInfo: true,
          customBranding: {
            companyName: "",
            contactEmail: "",
            contactPhone: "",
            primaryColor: "",
            logo: ""
          }
        }
      })
    } catch (err) {
      console.error("Error creating share:", err)
      toast({
        title: "Creation Failed",
        description: err instanceof Error ? err.message : "Failed to create share",
        variant: "destructive"
      })
    } finally {
      setCreating(false)
    }
  }

  const handleItineraryToggle = (itineraryId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      itineraryIds: checked
        ? [...prev.itineraryIds, itineraryId]
        : prev.itineraryIds.filter(id => id !== itineraryId)
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Share</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter share title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description for your share"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="shareType">Share Type</Label>
              <Select
                value={formData.shareType}
                onValueChange={(value: "individual" | "collection") => 
                  setFormData(prev => ({ ...prev, shareType: value, itineraryId: "", itineraryIds: [] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual Itinerary</SelectItem>
                  <SelectItem value="collection">Collection of Itineraries</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Itinerary Selection */}
          <div className="space-y-4">
            {formData.shareType === "individual" ? (
              <div>
                <Label htmlFor="itinerary">Select Itinerary *</Label>
                <Select
                  value={formData.itineraryId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, itineraryId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an itinerary" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableItineraries.map((itinerary) => (
                      <SelectItem key={itinerary._id} value={itinerary._id!}>
                        {itinerary.title} ({itinerary.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <Label>Select Itineraries for Collection *</Label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                  {availableItineraries.map((itinerary) => (
                    <div key={itinerary._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={itinerary._id}
                        checked={formData.itineraryIds.includes(itinerary._id!)}
                        onCheckedChange={(checked) => 
                          handleItineraryToggle(itinerary._id!, checked as boolean)
                        }
                      />
                      <label htmlFor={itinerary._id} className="text-sm flex-1 cursor-pointer">
                        {itinerary.title} ({itinerary.type})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Security & Expiration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="password-protected"
                checked={formData.passwordProtected}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, passwordProtected: checked, password: checked ? prev.password : "" }))
                }
              />
              <Label htmlFor="password-protected">Password Protected</Label>
            </div>

            {formData.passwordProtected && (
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                />
              </div>
            )}

            <div>
              <Label htmlFor="expires">Expiration Date (Optional)</Label>
              <Input
                id="expires"
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
              />
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Share Settings</h4>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-pricing"
                  checked={formData.settings.showPricing}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings, showPricing: checked }
                    }))
                  }
                />
                <Label htmlFor="show-pricing">Show Pricing</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="show-contact"
                  checked={formData.settings.showContactInfo}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings, showContactInfo: checked }
                    }))
                  }
                />
                <Label htmlFor="show-contact">Show Contact Information</Label>
              </div>
            </div>

            {/* Custom Branding */}
            <div className="space-y-3">
              <h5 className="font-medium text-sm">Custom Branding (Optional)</h5>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="company-name" className="text-sm">Company Name</Label>
                  <Input
                    id="company-name"
                    value={formData.settings.customBranding.companyName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        customBranding: {
                          ...prev.settings.customBranding,
                          companyName: e.target.value
                        }
                      }
                    }))}
                    placeholder="Your Company"
                  />
                </div>
                
                <div>
                  <Label htmlFor="primary-color" className="text-sm">Primary Color</Label>
                  <Input
                    id="primary-color"
                    type="color"
                    value={formData.settings.customBranding.primaryColor}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        customBranding: {
                          ...prev.settings.customBranding,
                          primaryColor: e.target.value
                        }
                      }
                    }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contact-email" className="text-sm">Contact Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={formData.settings.customBranding.contactEmail}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      customBranding: {
                        ...prev.settings.customBranding,
                        contactEmail: e.target.value
                      }
                    }
                  }))}
                  placeholder="contact@company.com"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Create Share
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface ShareManagementProps {
  availableItineraries: IItinerary[]
}

export default function ShareManagement({ availableItineraries }: ShareManagementProps) {
  const [shares, setShares] = useState<ShareWithItineraries[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchShares()
  }, [])

  const fetchShares = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/shares?createdBy=current-user") // TODO: Get from auth
      
      if (!response.ok) {
        throw new Error("Failed to fetch shares")
      }

      const data = await response.json()
      setShares(data.shares || [])
    } catch (err) {
      console.error("Error fetching shares:", err)
      toast({
        title: "Failed to Load",
        description: "Could not load your shares. Please refresh and try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const copyShareLink = async (shareId: string) => {
    const url = `${window.location.origin}/share/${shareId}`
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: "Link Copied",
        description: "Share link copied to clipboard!"
      })
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link. Please try again.",
        variant: "destructive"
      })
    }
  }

  const deleteShare = async (shareId: string) => {
    if (!confirm("Are you sure you want to delete this share? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/shares/${shareId}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        throw new Error("Failed to delete share")
      }

      setShares(prev => prev.filter(share => share.shareId !== shareId))
      toast({
        title: "Share Deleted",
        description: "Share has been successfully deleted."
      })
    } catch (err) {
      console.error("Error deleting share:", err)
      toast({
        title: "Delete Failed",
        description: "Failed to delete share. Please try again.",
        variant: "destructive"
      })
    }
  }

  const toggleShareStatus = async (shareId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/shares/${shareId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (!response.ok) {
        throw new Error("Failed to update share")
      }

      setShares(prev => prev.map(share => 
        share.shareId === shareId 
          ? { ...share, isActive: !isActive }
          : share
      ))

      toast({
        title: "Share Updated",
        description: `Share has been ${!isActive ? 'activated' : 'deactivated'}.`
      })
    } catch (err) {
      console.error("Error updating share:", err)
      toast({
        title: "Update Failed",
        description: "Failed to update share status.",
        variant: "destructive"
      })
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString()
  }

  const getTypeColor = (type: string) => {
    const colors = {
      "fixed-group-tour": "bg-blue-100 text-blue-800",
      "customized-package": "bg-green-100 text-green-800",
      "cart-combo": "bg-purple-100 text-purple-800",
      "html-editor": "bg-orange-100 text-orange-800"
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Share Management</h2>
          <p className="text-gray-600">Create and manage public links for your itineraries</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Share
        </Button>
      </div>

      {/* Shares List */}
      {shares.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No shares created yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first public share to start sharing your itineraries with the world.
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Share
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {shares.map((share) => (
            <Card key={share.shareId} className={`${!share.isActive ? 'opacity-60' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{share.title}</h3>
                      <Badge variant={share.shareType === "individual" ? "default" : "secondary"}>
                        {share.shareType}
                      </Badge>
                      {share.passwordProtected && (
                        <Badge variant="outline">
                          <Lock className="h-3 w-3 mr-1" />
                          Protected
                        </Badge>
                      )}
                      {!share.isActive && (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </div>

                    {share.description && (
                      <p className="text-gray-600 mb-3">{share.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {share.viewCount} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Created {formatDate(share.createdAt)}
                      </span>
                      {share.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Expires {formatDate(share.expiresAt)}
                        </span>
                      )}
                    </div>

                    {/* Itinerary Preview */}
                    <div className="space-y-2">
                      {share.shareType === "individual" && share.itinerary ? (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{share.itinerary.title}</span>
                          <Badge className={getTypeColor(share.itinerary.type)} variant="secondary">
                            {share.itinerary.type}
                          </Badge>
                        </div>
                      ) : share.shareType === "collection" && share.itineraries ? (
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            Collection of {share.itineraries.length} itineraries:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {share.itineraries.slice(0, 3).map((itinerary, idx) => (
                              <Badge key={idx} className={getTypeColor(itinerary.type)} variant="outline">
                                {itinerary.title}
                              </Badge>
                            ))}
                            {share.itineraries.length > 3 && (
                              <Badge variant="outline">
                                +{share.itineraries.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyShareLink(share.shareId)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/share/${share.shareId}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleShareStatus(share.shareId, share.isActive)}
                    >
                      {share.isActive ? (
                        <Unlock className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteShare(share.shareId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Share Modal */}
      <CreateShareModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onShareCreated={(newShare) => {
          setShares(prev => [newShare, ...prev])
        }}
        availableItineraries={availableItineraries}
      />
    </div>
  )
}
