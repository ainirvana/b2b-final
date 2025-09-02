"use client"

import React, { useState, useCallback, useEffect } from "react"
import { City, Country } from "country-state-city"
import { 
  ArrowLeft, X, MapPin, Hotel, Plane, Car, Info, Calendar, Upload, User, 
  MapPin as LocationPin, Utensils, Ticket, Shield, CreditCard, Briefcase, 
  Gift, Luggage, Bus, Train, Shuffle, Home, Building, ShoppingBag, Badge,
  Package, DollarSign, Calendar as CalendarIcon, MoreHorizontal, Navigation, Activity
} from "lucide-react"

interface CityData {
  name: string;
  countryCode: string;
  countryName: string;
  stateCode?: string;
  latitude?: string;
  longitude?: string;
  key: string;
}
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useLibrary } from "@/hooks/use-library"
import { toast } from "sonner"

interface SelectCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onItemCreated: () => void
  editingItem?: any
}

export function SelectCategoryModal({ isOpen, onClose, onItemCreated, editingItem }: SelectCategoryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState("Flight")
  const [selectedSubCategory, setSelectedSubCategory] = useState("Flight")
  const [selectedTransferOptions, setSelectedTransferOptions] = useState<string[]>(["any"])
  const [formData, setFormData] = useState({
    title: "",
    city: "Bangkok",
    country: "Thailand",
    startDate: "",
    endDate: "",
    labels: "",
    notes: "",
    basePrice: "",
    currency: "USD",
    availableFrom: "",
    availableUntil: "",
    variants: ""
  })
  const [citySuggestions, setCitySuggestions] = useState<CityData[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  const { createItem } = useLibrary()
  const isEditing = !!editingItem

  // Initialize form with editing data
  React.useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title || "",
        city: editingItem.city || "Bangkok",
        country: editingItem.country || "Thailand",
        startDate: editingItem.startDate || "",
        endDate: editingItem.endDate || "",
        labels: editingItem.labels || "",
        notes: editingItem.notes || "",
        basePrice: editingItem.basePrice?.toString() || "",
        currency: editingItem.currency || "USD",
        availableFrom: editingItem.availableFrom ? (() => {
          const date = new Date(editingItem.availableFrom)
          return date instanceof Date && !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : ""
        })() : "",
        availableUntil: editingItem.availableUntil ? (() => {
          const date = new Date(editingItem.availableUntil)
          return date instanceof Date && !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : ""
        })() : "",
        variants: editingItem.variants || ""
      })
      setSelectedCategory(editingItem.category || "Flight")
      setSelectedSubCategory(editingItem.subCategory || "Flight")
      setSelectedTransferOptions(editingItem.transferOptions || ["any"])
      setUploadedFiles(editingItem.multimedia || [])
    }
  }, [editingItem])

  const categories = [
    { id: "Flight", label: "Flight", icon: Plane },
    { id: "Hotel", label: "Hotel", icon: Hotel },
    { id: "Activity", label: "Activity & Experiences", icon: Activity },
    { id: "Transfer", label: "Transfer", icon: Car },
    { id: "Ancillaries", label: "Ancillaries", icon: MoreHorizontal },
    { id: "Package", label: "Packages", icon: Navigation },
    { id: "Others", label: "Others", icon: ShoppingBag },
    { id: "Meal", label: "Meal", icon: Utensils }
  ]

  const subCategories = {
    Flight: [
      { id: "Flight", label: "Flight", icon: Plane },
      { id: "Charter", label: "Charter", icon: Plane },
      { id: "Private", label: "Private", icon: Plane },
      { id: "Others", label: "Others", icon: Plane }
    ],
    Hotel: [
      { id: "Hotel", label: "Hotel", icon: Hotel },
      { id: "Homestays", label: "Homestays & Villas", icon: Home },
      { id: "Others", label: "Others", icon: Hotel }
    ],
    Activity: [
      { id: "Tickets", label: "Tickets", icon: Ticket },
      { id: "Tours", label: "Tours", icon: MapPin },
      { id: "Experiences", label: "Experiences", icon: MapPin },
      { id: "Others", label: "Others", icon: MapPin }
    ],
    Transfer: [
      { id: "Airport Transfer", label: "Airport Transfer", icon: Plane },
      { id: "On-demand Transfers", label: "On-demand Transfers", icon: Car },
      { id: "Rentals", label: "Rentals", icon: Car },
      { id: "Inter-city", label: "Inter-city", icon: Bus },
      { id: "Others", label: "Others", icon: Shuffle }
    ],
    Ancillaries: [
      { id: "Visa", label: "Visa", icon: Badge },
      { id: "Forex", label: "Forex", icon: CreditCard },
      { id: "Travel Insurance", label: "Travel Insurance", icon: Shield },
      { id: "Event Management", label: "Event Management", icon: Briefcase },
      { id: "Services", label: "Services", icon: User }
    ],
    Package: [
      { id: "7n8d", label: "7N/8D", icon: Package },
      { id: "5n6d", label: "5N/6D", icon: Package },
      { id: "3n4d", label: "3N/4D", icon: Package },
      { id: "10n11d", label: "10N/11D", icon: Package },
      { id: "14n15d", label: "14N/15D", icon: Package },
      { id: "custom", label: "Custom", icon: Package }
    ],
    Others: [
      { id: "Travel Gear", label: "Travel Gear", icon: Luggage },
      { id: "Gifts", label: "Gifts", icon: Gift },
      { id: "Souvenirs", label: "Souvenirs", icon: ShoppingBag }
    ],
    Meal: [
      { id: "Breakfast", label: "B", icon: Utensils },
      { id: "Lunch", label: "L", icon: Utensils },
      { id: "Dinner", label: "D", icon: Utensils },
      { id: "Others", label: "Others", icon: Utensils }
    ]
  }

  const transferOptions = [
    { id: "any", label: "Any" },
    { id: "car-only", label: "Car Only" },
    { id: "bus", label: "Bus" },
    { id: "trains", label: "Trains" },
    { id: "shuttle", label: "Shuttle" },
    { id: "other-combo", label: "Other Combo" }
  ]

  const searchCities = useCallback((search: string) => {
    if (search.length < 2) {
      setCitySuggestions([]);
      return;
    }

    const countries = Country.getAllCountries();
    const searchLower = search.toLowerCase();
    
    let matches: CityData[] = [];
    let uniqueCities = new Set();
    
    countries.forEach(country => {
      const cities = City.getCitiesOfCountry(country.isoCode);
      if (cities) {
        cities.forEach(city => {
          if (city.name.toLowerCase().includes(searchLower)) {
            // Create a unique identifier using all available data
            const uniqueId = `${city.name}-${country.isoCode}-${city.stateCode || ''}-${city.latitude || ''}-${city.longitude || ''}`;
            
            // Only add if we haven't seen this exact city before
            if (!uniqueCities.has(uniqueId)) {
              uniqueCities.add(uniqueId);
              matches.push({
                name: city.name,
                countryCode: country.isoCode,
                countryName: country.name,
                stateCode: city.stateCode,
                latitude: city.latitude,
                longitude: city.longitude,
                key: uniqueId
              });
            }
          }
        });
      }
    });

    // Limit to top 10 matches for better performance
    setCitySuggestions(matches.slice(0, 10));
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchCities(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchCities]);

  const handleInputChange = (field: string, value: string) => {
    if (field === "city") {
      setFormData(prev => ({ ...prev, city: value }));
      setSearchTerm(value);
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  }

  const handleCitySelect = (cityData: CityData) => {
    setFormData(prev => ({
      ...prev,
      city: cityData.name,
      country: cityData.countryName
    }));
    setSearchTerm("");
    setCitySuggestions([]);
  }

  const handleTransferOptionToggle = (optionId: string) => {
    setSelectedTransferOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    )
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Check file limits
    if (uploadedFiles.length + files.length > 5) {
      toast.error('Maximum 5 files allowed')
      return
    }

    // Check file sizes
    const oversizedFiles = files.filter(file => file.size > 7 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      toast.error('Files must be under 7MB')
      return
    }

    setUploading(true)
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) throw new Error('Upload failed')
        const data = await response.json()
        return data.url
      })

      const urls = await Promise.all(uploadPromises)
      setUploadedFiles(prev => [...prev, ...urls])
      toast.success(`${files.length} file(s) uploaded successfully`)
    } catch (error) {
      toast.error('Failed to upload files')
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }

    setSaving(true)
    try {
      const itemData = {
        title: formData.title,
        category: selectedCategory,
        subCategory: selectedSubCategory,
        city: formData.city,
        country: formData.country,
        startDate: formData.startDate,
        endDate: formData.endDate,
        labels: formData.labels,
        notes: formData.notes,
        transferOptions: selectedCategory === "Transfer" ? selectedTransferOptions : [],
        basePrice: formData.basePrice ? parseFloat(formData.basePrice) : undefined,
        currency: formData.currency,
        availableFrom: formData.availableFrom ? new Date(formData.availableFrom) : undefined,
        availableUntil: formData.availableUntil ? new Date(formData.availableUntil) : undefined,
        variants: formData.variants,
        multimedia: uploadedFiles
      }

      if (isEditing) {
        // Update existing item
        const response = await fetch(`/api/library/${editingItem._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData)
        })
        if (!response.ok) throw new Error('Failed to update item')
      } else {
        await createItem(itemData)
      }
      onItemCreated()
      
      // Reset form
      setFormData({
        title: "",
        city: "Bangkok",
        country: "Thailand",
        startDate: "",
        endDate: "",
        labels: "",
        notes: "",
        basePrice: "",
        currency: "USD",
        availableFrom: "",
        availableUntil: "",
        variants: ""
      })
      setUploadedFiles([])
      setSelectedCategory("Flight")
      setSelectedSubCategory("Flight")
      setSelectedTransferOptions(["any"])
    } catch (error) {
      console.error('Error creating item:', error)
      toast.error('Failed to create library item')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto bg-white">
        <DialogHeader>
          <DialogTitle className="sr-only">Select Category</DialogTitle>
        </DialogHeader>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold text-gray-900">{isEditing ? 'Edit Library Item' : 'Select Category'}</h2>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Categories */}
          <div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {categories.map((category) => {
                const Icon = category.icon
                const isActive = selectedCategory === category.id
                return (
                  <Button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setSelectedSubCategory(subCategories[category.id as keyof typeof subCategories]?.[0]?.id || category.id)
                      setSelectedTransferOptions(category.id === "Transfer" ? ["any"] : [])
                    }}
                    className={`flex flex-col items-center space-y-2 px-3 py-4 rounded-lg text-sm font-medium transition-all h-20 ${
                      isActive
                        ? "bg-black text-white shadow-lg scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${category.id === "Activity" ? "text-yellow-500" : ""}`} />
                    <span className="text-xs leading-tight text-center">{category.label}</span>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Sub Categories */}
          {selectedCategory && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Sub-Category</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {subCategories[selectedCategory as keyof typeof subCategories]?.map((subCategory) => {
                  const Icon = subCategory.icon
                  const isActive = selectedSubCategory === subCategory.id
                  return (
                    <Button
                      key={subCategory.id}
                      onClick={() => setSelectedSubCategory(subCategory.id)}
                      className={`flex flex-col items-center space-y-2 px-3 py-4 rounded-lg text-sm font-medium transition-all h-20 ${
                        isActive
                          ? "bg-black text-white shadow-lg scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs leading-tight text-center">{subCategory.label}</span>
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Transfer Options */}
          {selectedCategory === "Transfer" && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Transfer Options</h3>
              <div className="grid grid-cols-3 gap-3">
                {transferOptions.map((option) => (
                  <div 
                    key={option.id}
                    className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Checkbox
                      id={option.id}
                      checked={selectedTransferOptions.includes(option.id)}
                      onCheckedChange={() => handleTransferOptionToggle(option.id)}
                      className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                    />
                    <Label 
                      htmlFor={option.id} 
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Title</Label>
              <Input
                placeholder="Add any extra details."
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            {/* City and Country */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">City</Label>
                <div className="relative">
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    autoComplete="off"
                    placeholder="Start typing a city name..."
                  />
                  {citySuggestions.length > 0 && (
                    <div className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 w-full max-h-60 overflow-y-auto shadow-lg">
                      {citySuggestions.map((city) => (
                        <div
                          key={city.key}
                          className="px-3 py-2 cursor-pointer hover:bg-yellow-100 flex flex-col"
                          onClick={() => handleCitySelect(city)}
                        >
                          <span className="font-medium">{city.name}</span>
                          <span className="text-sm text-gray-500">
                            {city.countryName}
                            {city.stateCode ? `, ${city.stateCode}` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Country</Label>
                <Input
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  className="mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Start Date</Label>
                <div className="relative mt-1">
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className="border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">End Date</Label>
                <div className="relative mt-1">
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    className="border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>
              </div>
            </div>

            {/* Labels */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Labels</Label>
              <Input
                placeholder="Type"
                value={formData.labels}
                onChange={(e) => handleInputChange("labels", e.target.value)}
                className="mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            {/* Notes */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Notes</Label>
              <Textarea
                placeholder="Add any extra details."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
                className="mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 resize-none"
              />
            </div>

            {/* Price */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Price</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-600">Base Price</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="0.00"
                      value={formData.basePrice}
                      onChange={(e) => handleInputChange("basePrice", e.target.value)}
                      className="pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Currency</Label>
                  <Input
                    placeholder="USD"
                    value={formData.currency}
                    onChange={(e) => handleInputChange("currency", e.target.value)}
                    className="mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>
              </div>
            </div>

            {/* Availability */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Availability</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-600">Available From</Label>
                  <div className="relative mt-1">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="date"
                      placeholder="Select date"
                      value={formData.availableFrom}
                      onChange={(e) => handleInputChange("availableFrom", e.target.value)}
                      className="pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Available Until</Label>
                  <div className="relative mt-1">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="date"
                      placeholder="Select date"
                      value={formData.availableUntil}
                      onChange={(e) => handleInputChange("availableUntil", e.target.value)}
                      className="pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Variants */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Variants</Label>
              <Textarea
                placeholder="Enter variant details..."
                value={formData.variants}
                onChange={(e) => handleInputChange("variants", e.target.value)}
                rows={3}
                className="border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 resize-none"
              />
            </div>

            {/* Multimedia */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Multimedia (Max 5 files, 7MB each)</Label>
              <div className="mt-1">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={uploading || uploadedFiles.length >= 5}
                />
                <label
                  htmlFor="file-upload"
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer block ${
                    uploading || uploadedFiles.length >= 5
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      : 'border-gray-300 hover:border-yellow-400'
                  }`}
                >
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {uploading ? 'Uploading...' : uploadedFiles.length >= 5 ? 'Maximum files reached' : 'Click to upload files'}
                  </p>
                </label>
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={file}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-16 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-2 bg-black hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
            >
              {saving ? (isEditing ? 'Updating...' : 'Adding to Library...') : (isEditing ? 'Update Library' : 'Add to Library')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
