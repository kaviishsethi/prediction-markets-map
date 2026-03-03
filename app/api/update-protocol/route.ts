import { NextRequest, NextResponse } from 'next/server'
import { updateProtocolMetadata, getProtocolMetadata } from '@/database/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { protocol, updates } = body

    if (!protocol || !updates) {
      return NextResponse.json(
        { error: 'Protocol and updates are required' },
        { status: 400 }
      )
    }

    // Check if protocol exists
    const existing = await getProtocolMetadata(protocol)
    if (!existing) {
      return NextResponse.json(
        { error: `Protocol "${protocol}" not found` },
        { status: 404 }
      )
    }

    // Update the protocol
    await updateProtocolMetadata(protocol, updates)

    // Fetch updated data
    const updated = await getProtocolMetadata(protocol)

    return NextResponse.json({
      success: true,
      protocol,
      before: existing,
      after: updated,
    })
  } catch (error) {
    console.error('Update protocol error:', error)
    return NextResponse.json(
      { error: 'Failed to update protocol', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
