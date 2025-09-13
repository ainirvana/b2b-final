import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import LibraryItem from '@/models/LibraryItem'

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    await LibraryItem.findByIdAndDelete(id)
    return NextResponse.json({ message: 'Item deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const data = await request.json()
    const item = await LibraryItem.findByIdAndUpdate(id, data, { new: true })
    return NextResponse.json(item)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}
