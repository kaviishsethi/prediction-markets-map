import { NextRequest, NextResponse } from 'next/server'
import { deleteProtocol, getProtocolMetadata } from '@/database/api'

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const protocol = searchParams.get('protocol')
  const confirm = searchParams.get('confirm')

  if (!protocol) {
    return NextResponse.json({ error: 'Protocol parameter required' }, { status: 400 })
  }

  if (confirm !== 'yes') {
    return NextResponse.json(
      { error: 'Add ?confirm=yes to confirm deletion' },
      { status: 400 }
    )
  }

  try {
    // Check if protocol exists
    const existing = await getProtocolMetadata(protocol)
    if (!existing) {
      return NextResponse.json(
        { error: `Protocol "${protocol}" not found` },
        { status: 404 }
      )
    }

    // Delete the protocol
    await deleteProtocol(protocol)

    return NextResponse.json({
      success: true,
      deleted: protocol,
      metadata: existing,
    })
  } catch (error) {
    console.error('Delete protocol error:', error)
    return NextResponse.json(
      { error: 'Failed to delete protocol', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
