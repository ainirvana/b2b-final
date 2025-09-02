import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import LibraryItem from '@/models/LibraryItem'

export async function GET() {
  try {
    await dbConnect()
    const items = await LibraryItem.find({}).sort({ createdAt: -1 })
    return NextResponse.json(items)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const data = await request.json()
    
    // Clean undefined values
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined && value !== '')
    )
    
    const item = await LibraryItem.create(cleanData)
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating library item:', error)
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }
}
