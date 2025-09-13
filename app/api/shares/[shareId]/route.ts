import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import PublicShare, { ShareView } from "@/models/PublicShare"

// GET /api/shares/[shareId] - Get specific share
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    await connectToDatabase()
    
    const { shareId } = await params
    
    const share = await PublicShare.findOne({ shareId, isActive: true })
      .populate({
        path: 'itineraryId',
        select: 'title description type productId destination duration totalPrice currency days highlights images gallery branding fixedDates cartItems htmlBlocks'
      })
      .populate({
        path: 'itineraryIds',
        select: 'title description type productId destination duration totalPrice currency days highlights images gallery branding fixedDates cartItems htmlBlocks'
      })

    if (!share) {
      return NextResponse.json(
        { error: "Share not found or inactive" },
        { status: 404 }
      )
    }

    // Check if share has expired
    if (share.expiresAt && new Date() > share.expiresAt) {
      return NextResponse.json(
        { error: "Share has expired" },
        { status: 410 }
      )
    }

    // Transform the data to match frontend expectations
    const transformedShare = {
      ...share.toObject(),
      itinerary: share.shareType === "individual" ? share.itineraryId : undefined,
      itineraries: share.shareType === "collection" ? share.itineraryIds : undefined
    }

    // Remove the original populated fields to avoid confusion
    delete transformedShare.itineraryId
    delete transformedShare.itineraryIds

    return NextResponse.json({ share: transformedShare })

  } catch (error) {
    console.error("Error fetching share:", error)
    return NextResponse.json(
      { error: "Failed to fetch share" },
      { status: 500 }
    )
  }
}

// PUT /api/shares/[shareId] - Update share
export async function PUT(
  request: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    await connectToDatabase()
    
    const { shareId } = params
    const body = await request.json()
    
    const share = await PublicShare.findOne({ shareId })
    
    if (!share) {
      return NextResponse.json(
        { error: "Share not found" },
        { status: 404 }
      )
    }

    // TODO: Add authorization check - only creator can update
    
    // Update allowed fields
    const updateData: any = {}
    
    if (body.title) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.expiresAt !== undefined) {
      updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null
    }
    if (body.settings) updateData.settings = { ...share.settings, ...body.settings }
    
    // Handle password updates
    if (body.passwordProtected !== undefined) {
      updateData.passwordProtected = body.passwordProtected
      if (body.passwordProtected && body.password) {
        updateData.password = body.password // Simple storage for now
      } else if (!body.passwordProtected) {
        updateData.password = undefined
      }
    }

    const updatedShare = await PublicShare.findOneAndUpdate(
      { shareId },
      updateData,
      { new: true }
    ).populate([
      {
        path: 'itineraryId',
        select: 'title description type productId totalPrice currency'
      },
      {
        path: 'itineraryIds',
        select: 'title description type productId totalPrice currency'
      }
    ])

    return NextResponse.json({
      message: "Share updated successfully",
      share: updatedShare
    })

  } catch (error) {
    console.error("Error updating share:", error)
    return NextResponse.json(
      { error: "Failed to update share" },
      { status: 500 }
    )
  }
}

// DELETE /api/shares/[shareId] - Delete share
export async function DELETE(
  request: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    await connectToDatabase()
    
    const { shareId } = params
    
    const share = await PublicShare.findOne({ shareId })
    
    if (!share) {
      return NextResponse.json(
        { error: "Share not found" },
        { status: 404 }
      )
    }

    // TODO: Add authorization check - only creator can delete
    
    await PublicShare.findOneAndDelete({ shareId })
    
    // Optional: Also delete related share views
    await ShareView.deleteMany({ shareId })

    return NextResponse.json({
      message: "Share deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting share:", error)
    return NextResponse.json(
      { error: "Failed to delete share" },
      { status: 500 }
    )
  }
}
