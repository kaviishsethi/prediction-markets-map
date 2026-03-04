import { NextResponse } from 'next/server'
import { getCategoriesWithProtocols } from '@/database/api'

export async function GET() {
  try {
    const data = await getCategoriesWithProtocols()

    // Count totals
    let totalCompanies = 0
    const categoryCounts: Record<string, number> = {}

    for (const [slug, category] of Object.entries(data)) {
      categoryCounts[category.label] = category.protocols.length
      totalCompanies += category.protocols.length
    }

    return NextResponse.json({
      success: true,
      totalCompanies,
      categoryCounts,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
