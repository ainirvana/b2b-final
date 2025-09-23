import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Quotation from "@/models/Quotation"
import { isValidObjectId } from "mongoose"
import { recalculateQuotationTotals } from "@/lib/pricing-utils"

// GET /api/quotations/[id]
export async function GET(
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

    const quotation = await Quotation.findById(id)

    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 })
    }

    return NextResponse.json(quotation)
  } catch (error) {
    console.error("Error fetching quotation:", error)
    return NextResponse.json({ error: "Failed to fetch quotation" }, { status: 500 })
  }
}

// PUT /api/quotations/[id]
export async function PUT(
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

    const updateData = await request.json()

    // Check if quotation exists
    const quotation = await Quotation.findById(id)
    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 })
    }

    // Update pricing options if provided
    if (updateData.pricingOptions) {
      // Use the recalculation function to get updated pricing
      const recalculatedQuotation = recalculateQuotationTotals({
        ...quotation.toObject(),
        pricingOptions: {
          ...quotation.pricingOptions,
          ...updateData.pricingOptions
        }
      });
      
      // Update all the pricing fields
      updateData.pricingOptions = recalculatedQuotation.pricingOptions;
      updateData.subtotal = recalculatedQuotation.subtotal;
      updateData.markup = recalculatedQuotation.markup;
      updateData.total = recalculatedQuotation.total;
      updateData.totalPrice = recalculatedQuotation.total; // For backward compatibility
    }

    // Get the current version
    const currentVersion = quotation.currentVersion || 1
    const versionIndex = quotation.versionHistory?.findIndex(
      (v: any) => v.versionNumber === currentVersion
    )

    // If this version is locked, prevent updates
    if (versionIndex !== -1 && quotation.versionHistory[versionIndex].isLocked) {
      return NextResponse.json({ error: "Cannot update a locked version" }, { status: 400 })
    }

    // Set the draft flag
    updateData.isDraft = true
    if (versionIndex !== -1) {
      quotation.versionHistory[versionIndex].isDraft = true
    }

    // Update quotation
    const updatedQuotation = await Quotation.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })

    return NextResponse.json(updatedQuotation)
  } catch (error) {
    console.error("Error updating quotation:", error)
    return NextResponse.json({ error: "Failed to update quotation" }, { status: 500 })
  }
}

// DELETE /api/quotations/[id]
export async function DELETE(
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

    const quotation = await Quotation.findByIdAndDelete(id)

    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Quotation deleted successfully" })
  } catch (error) {
    console.error("Error deleting quotation:", error)
    return NextResponse.json({ error: "Failed to delete quotation" }, { status: 500 })
  }
}