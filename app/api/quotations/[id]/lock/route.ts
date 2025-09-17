import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Quotation from "@/models/Quotation"
import { isValidObjectId } from "mongoose"

// POST /api/quotations/[id]/lock
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

    // Get the user information (for tracking who locked the version)
    const { userName } = await request.json()

    // Check if quotation exists
    const quotation = await Quotation.findById(id)
    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 })
    }

    // Check if current version is already locked
    if (quotation.isLocked) {
      return NextResponse.json({ error: "This version is already locked" }, { status: 400 })
    }

    // Lock the current version
    quotation.isLocked = true

    // Initialize version history if it doesn't exist
    if (!quotation.versionHistory) {
      quotation.versionHistory = []
    }

    // Find the current version in history
    const currentVersion = quotation.currentVersion || 1
    const versionIndex = quotation.versionHistory.findIndex(
      (v: any) => v.versionNumber === currentVersion
    )

    if (versionIndex >= 0) {
      // Update existing version entry
      quotation.versionHistory[versionIndex].isLocked = true
      quotation.versionHistory[versionIndex].lockedBy = userName || "Unknown user"
      quotation.versionHistory[versionIndex].lockedAt = new Date()
    } else {
      // Add current version to history if not found
      quotation.versionHistory.push({
        versionNumber: currentVersion,
        createdAt: new Date(),
        description: "Version locked",
        isLocked: true,
        lockedBy: userName || "Unknown user",
        lockedAt: new Date()
      })
    }

    // Save changes
    await quotation.save()

    return NextResponse.json(quotation)
  } catch (error) {
    console.error("Error locking quotation version:", error)
    return NextResponse.json({ error: "Failed to lock version" }, { status: 500 })
  }
}