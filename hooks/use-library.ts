import { useState, useEffect } from 'react'

interface LibraryItem {
  _id: string
  title: string
  category: string
  subCategory: string
  city: string
  country: string
  startDate: string
  endDate: string
  labels: string
  notes: string
  transferOptions: string[]
  basePrice?: number
  currency: string
  availableFrom?: Date
  availableUntil?: Date
  variants: string
  multimedia: string[]
  createdAt: Date
  updatedAt: Date
}

export function useLibrary() {
  const [items, setItems] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/library')
      const data = await response.json()
      setItems(data)
    } catch (error) {
      console.error('Failed to fetch items:', error)
    } finally {
      setLoading(false)
    }
  }

  const createItem = async (itemData: any) => {
    const response = await fetch('/api/library', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    })
    if (response.ok) {
      await fetchItems() // Refresh the list
      return await response.json()
    } else {
      throw new Error('Failed to create item')
    }
  }

  const deleteItem = async (id: string) => {
    const response = await fetch(`/api/library/${id}`, {
      method: 'DELETE'
    })
    if (response.ok) {
      await fetchItems() // Refresh the list
      return await response.json()
    } else {
      throw new Error('Failed to delete item')
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const updateItem = async (id: string, itemData: any) => {
    const response = await fetch(`/api/library/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    })
    if (response.ok) {
      await fetchItems() // Refresh the list
      return await response.json()
    } else {
      throw new Error('Failed to update item')
    }
  }

  return { items, loading, createItem, updateItem, deleteItem, fetchItems }
}
