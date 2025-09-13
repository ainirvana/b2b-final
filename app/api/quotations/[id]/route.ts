import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Quotation from "@/models/Quotation"
import { isValidObjectId } from "mongoose"

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
      // Calculate final price based on markup
      let finalTotalPrice = updateData.pricingOptions.originalTotalPrice || quotation.pricingOptions.originalTotalPrice
      
      if (updateData.pricingOptions.markupType === "percentage" && updateData.pricingOptions.markupValue) {
        finalTotalPrice = finalTotalPrice * (1 + updateData.pricingOptions.markupValue / 100)
      } else if (updateData.pricingOptions.markupType === "fixed" && updateData.pricingOptions.markupValue) {
        finalTotalPrice = finalTotalPrice + updateData.pricingOptions.markupValue
      }
      
      // Update final total price
      updateData.pricingOptions.finalTotalPrice = finalTotalPrice
      // Update total price field as well
      updateData.totalPrice = finalTotalPrice
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