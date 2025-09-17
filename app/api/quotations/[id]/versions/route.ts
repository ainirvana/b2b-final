import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Quotation from "@/models/Quotation"
import { isValidObjectId } from "mongoose"

// POST /api/quotations/[id]/versions
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

    // Get the version description from the request body
    const { description } = await request.json()

    if (!description || typeof description !== "string") {
      return NextResponse.json({ error: "Version description is required" }, { status: 400 })
    }

    // Check if quotation exists
    const quotation = await Quotation.findById(id)
    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 })
    }

    // Check if current version is locked
    if (quotation.isLocked) {
      return NextResponse.json({ error: "Cannot create a new version because the current version is locked" }, { status: 400 })
    }

    // Initialize version history if it doesn't exist
    if (!quotation.versionHistory) {
      quotation.versionHistory = []
    }

    // Determine the next version number
    const currentVersion = quotation.currentVersion || 1
    const nextVersion = currentVersion + 1

    // Create a new version entry with current data
    quotation.versionHistory.push({
      versionNumber: currentVersion,
      createdAt: new Date(),
      description,
      isLocked: false
    })

    // Update current version
    quotation.currentVersion = nextVersion

    // Save changes
    await quotation.save()

    return NextResponse.json(quotation)
  } catch (error) {
    console.error("Error creating new quotation version:", error)
    return NextResponse.json({ error: "Failed to create new version" }, { status: 500 })
  }
}