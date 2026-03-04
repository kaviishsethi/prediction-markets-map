import { NextRequest, NextResponse } from 'next/server'
import { upsertProtocolCategory, getProtocolMetadata } from '@/database/api'
import { getCategorySlug } from '@/constants/categories'

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
    const { company, category } = body as { company: string; category: string }

    if (!company || !category) {
      return NextResponse.json(
        { error: 'company and category required' },
        { status: 400 }
      )
    }

    const slug = generateSlug(company)
    const categorySlug = getCategorySlug(category)

    if (!categorySlug) {
      return NextResponse.json(
        { error: `Invalid category: ${category}` },
        { status: 400 }
      )
    }

    // Verify company exists
    const metadata = await getProtocolMetadata(slug)
    if (!metadata) {
      return NextResponse.json(
        { error: `Company not found: ${company} (slug: ${slug})` },
        { status: 404 }
      )
    }

    // Add company to category
    await upsertProtocolCategory({
      protocol: slug,
      category: categorySlug,
      description: metadata.description,
      website: metadata.website,
      twitter: metadata.twitter,
    })

    return NextResponse.json({
      success: true,
      company,
      category: categorySlug,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
