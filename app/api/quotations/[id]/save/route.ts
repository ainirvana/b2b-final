import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Quotation from "@/models/Quotation"
import { isValidObjectId } from "mongoose"

// POST /api/quotations/[id]/save
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Connect to database
    await connectDB()

    // Await params before accessing properties
    const { id } = await params

    // Validate if the ID is a valid MongoDB ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid quotation ID format" }, { status: 400 })
    }

    // Check if quotation exists
    const quotation = await Quotation.findById(id)
    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 })
    }

    // Get the current version
    const currentVersion = quotation.currentVersion || 1
    const versionIndex = quotation.versionHistory?.findIndex(
      (v: any) => v.versionNumber === currentVersion
    )

    if (versionIndex === -1) {
      return NextResponse.json({ error: "Current version not found in history" }, { status: 404 })
    }

    // If this version is locked, prevent updates
    if (quotation.versionHistory[versionIndex].isLocked) {
      return NextResponse.json({ error: "Cannot update a locked version" }, { status: 400 })
    }

    // Update the version state with current values and mark as not draft
    quotation.versionHistory[versionIndex].state = {
      days: quotation.days,
      pricingOptions: quotation.pricingOptions,
      subtotal: quotation.subtotal,
      markup: quotation.markup,
      total: quotation.total,
      currencySettings: quotation.currencySettings
    }
    quotation.versionHistory[versionIndex].isDraft = false
    quotation.isDraft = false

    // Save changes
    await quotation.save()

    return NextResponse.json(quotation)
  } catch (error) {
    console.error("Error saving quotation version:", error)
    return NextResponse.json({ error: "Failed to save version" }, { status: 500 })
  }
}