import { NextRequest, NextResponse } from 'next/server'
import { appendCompanyRow, NewCompanyRow } from '@/lib/google-sheets'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as NewCompanyRow

    if (!body.companyName || !body.category) {
      return NextResponse.json(
        { error: 'companyName and category required' },
        { status: 400 }
      )
    }

    await appendCompanyRow(body)

    return NextResponse.json({
      success: true,
      company: body.companyName,
      category: body.category,
    })
  } catch (error) {
    console.error('Error adding to sheet:', error)
    return NextResponse.json(
      { error: 'Failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
