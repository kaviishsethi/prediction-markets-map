import { NextRequest, NextResponse } from 'next/server'
import { deleteProtocolCategory, getProtocolCategory } from '@/database/api'

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const protocol = searchParams.get('protocol')
  const category = searchParams.get('category')

  if (!protocol || !category) {
    return NextResponse.json(
      { error: 'protocol and category parameters required' },
      { status: 400 }
    )
  }

  try {
    // Check if the entry exists
    const existing = await getProtocolCategory(protocol, category)
    if (!existing) {
      return NextResponse.json(
        { error: `Protocol "${protocol}" does not have category "${category}"` },
        { status: 404 }
      )
    }

    // Delete the category entry
    await deleteProtocolCategory(protocol, category)

    return NextResponse.json({
      success: true,
      removed: { protocol, category },
    })
  } catch (error) {
    console.error('Remove category error:', error)
    return NextResponse.json(
      { error: 'Failed to remove category', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
