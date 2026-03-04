import { NextRequest, NextResponse } from 'next/server'
import { deleteProtocol } from '@/database/api'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companies } = body as { companies: string[] }

    if (!companies || !Array.isArray(companies)) {
      return NextResponse.json(
        { error: 'companies array required' },
        { status: 400 }
      )
    }

    const results: Array<{ company: string; slug: string; status: 'deleted' | 'error'; message?: string }> = []

    for (const company of companies) {
      const slug = generateSlug(company)
      try {
        await deleteProtocol(slug)
        results.push({ company, slug, status: 'deleted' })
      } catch (error) {
        results.push({
          company,
          slug,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      results
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Delete failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
