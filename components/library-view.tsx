"use client"

import { useState } from "react"
import { useLibrary } from "@/hooks/use-library"
import { Search, Edit, PlaneLanding, Hotel, MapPin, Car, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { SelectCategoryModal } from "@/components/select-category-modal"
import { AddEditEventModal } from "@/components/add-edit-event-modal"
import { Sidebar } from "@/components/sidebar"
import { toast } from "sonner"

interface ILibraryItem {
  id: string
  title: string
  type: 'arrival' | 'transport' | 'activity' | 'hotel'
  date: string
  location?: string
  multimedia?: string[]
}

type LibraryItemInput = Partial<ILibraryItem>

export function LibraryView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showSelectCategoryModal, setShowSelectCategoryModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [activeLibrary, setActiveLibrary] = useState<'personal' | 'institutional' | 'public'>('personal')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const { items: dbItems, loading, deleteItem } = useLibrary()
  
  // Transform DB items to component format
  const items: ILibraryItem[] = dbItems.map(item => {
    const createdDate = item.createdAt ? new Date(item.createdAt) : new Date()
    const isValidDate = createdDate instanceof Date && !isNaN(createdDate.getTime())
    
    return {
      id: item._id,
      title: item.title,
      type: (item.category || 'activity').toLowerCase() as 'arrival' | 'transport' | 'activity' | 'hotel',
      date: isValidDate ? createdDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      location: item.city || item.country,
      multimedia: item.multimedia || []
    }
  })

  const getIcon = (type: ILibraryItem['type']) => {
    switch (type) {
      case 'arrival':
        return <PlaneLanding className="h-4 w-4" />
      case 'transport':
        return <Car className="h-4 w-4" />
      case 'activity':
        return <MapPin className="h-4 w-4" />
      case 'hotel':
        return <Hotel className="h-4 w-4" />
    }
  }

  const categories = ['all', 'flight', 'hotel', 'activity', 'transfer', 'ancillaries', 'package', 'others', 'meal']

  const filteredItems = items
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || item.type === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })

  const handleSelectItem = (id: string) => {
    if (isEditMode) {
      setSelectedItems(prev => 
        prev.includes(id) 
          ? prev.filter(itemId => itemId !== id)
          : [...prev, id]
      )
    }
  }

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(items.map(item => item.id))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedItems.length > 0) {
      if (confirm(`Are you sure you want to delete ${selectedItems.length} selected items?`)) {
        try {
          await Promise.all(selectedItems.map(id => deleteItem(id)))
          setSelectedItems([])
          setIsEditMode(false)
          toast.success(`${selectedItems.length} items deleted`)
        } catch (error) {
          toast.error('Failed to delete items')
        }
      }
    }
  }

  const handleEditItem = (item: any) => {
    setEditingItem(item)
    setShowAddModal(true)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activeView="library" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Library Type Tabs */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex space-x-1">
            {[
              { id: 'personal', label: 'My Library' },
              { id: 'institutional', label: 'MY LIVE WEBLINKS' },
              { id: 'public', label: 'Global Library' }
            ].map((library) => (
              <Button
                key={library.id}
                onClick={() => setActiveLibrary(library.id as any)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeLibrary === library.id
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {library.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Library Content */}
        <div className="flex-1 p-6 overflow-auto">
          {activeLibrary === 'personal' ? (
            <div>
              {/* Personal Library Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">My Library</h2>
                    <p className="text-sm text-gray-600">Manage your personal travel library items</p>
                  </div>
                  <Button 
                    onClick={() => setShowSelectCategoryModal(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    + Add Library
                  </Button>
                </div>
                
                {/* Filters */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Category Filter */}
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Category:</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Sort Filter */}
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Sort:</label>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      placeholder="Search library items..." 
                      className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Library Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {loading ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-sm text-gray-500">Loading library items...</p>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-sm text-gray-500">No library items found</p>
                    <p className="text-xs text-gray-400 mt-1">Create your first library item to get started</p>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <Card key={item.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="relative mb-3">
                          {item.multimedia && item.multimedia.length > 0 ? (
                            <img
                              src={item.multimedia[0]}
                              alt={item.title}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                              {getIcon(item.type)}
                            </div>
                          )}
                          <div className="absolute top-2 right-2 flex space-x-1">
                            <Button
                              onClick={() => handleEditItem(dbItems.find(dbItem => dbItem._id === item.id))}
                              className="bg-white/80 hover:bg-white text-gray-700 p-1 rounded"
                              size="sm"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => deleteItem(item.id)}
                              className="bg-white/80 hover:bg-white text-red-600 p-1 rounded"
                              size="sm"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">{item.title}</h3>
                          {item.location && (
                            <p className="text-xs text-gray-500 mb-2">{item.location}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {format(new Date(item.date), 'MMM dd, yyyy')}
                            </span>
                            {item.multimedia && item.multimedia.length > 1 && (
                              <span className="text-xs text-gray-400">+{item.multimedia.length - 1} more</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ) : activeLibrary === 'institutional' ? (
            <div className="py-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">my live channels</h2>
              <div className="space-y-2">
                <a href="#" className="block text-blue-600 hover:text-blue-800">link 1</a>
                <a href="#" className="block text-blue-600 hover:text-blue-800">link 2</a>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Global Library</h2>
              <p className="text-sm text-gray-500">Coming Soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Select Category Modal */}
      <SelectCategoryModal
        isOpen={showSelectCategoryModal}
        onClose={() => setShowSelectCategoryModal(false)}
        onItemCreated={() => {
          setShowSelectCategoryModal(false)
          toast.success('Library item created successfully')
        }}
      />

      {/* Add/Edit Modal */}
      {editingItem && (
        <SelectCategoryModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false)
            setEditingItem(null)
          }}
          onItemCreated={() => {
            setShowAddModal(false)
            setEditingItem(null)
            toast.success('Library item updated successfully')
          }}
          editingItem={editingItem}
        />
      )}
    </div>
  )
}
