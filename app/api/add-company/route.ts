import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, TABLES } from '@/lib/supabase'

interface CategoryEntry {
  category: string
  description: string
}

interface CompanyInput {
  protocol: string
  name: string
  website: string
  is_public: boolean
  categories: CategoryEntry[]
}

export async function POST(request: NextRequest) {
  try {
    const company: CompanyInput = await request.json()

    if (!company.protocol || !company.name || !company.categories?.length) {
      return NextResponse.json(
        { error: 'protocol, name, and categories are required' },
        { status: 400 }
      )
    }

    // Check if protocol already exists
    const { data: existing } = await supabaseAdmin
      .from(TABLES.protocols_metadata)
      .select('protocol')
      .eq('protocol', company.protocol)
      .single()

    const insertedCategories: string[] = []

    if (existing) {
      // Add new categories only
      for (const cat of company.categories) {
        const { data: existingCat } = await supabaseAdmin
          .from(TABLES.protocols_categories)
          .select('id')
          .eq('protocol', company.protocol)
          .eq('category', cat.category)
          .single()

        if (!existingCat) {
          const { error: catError } = await supabaseAdmin
            .from(TABLES.protocols_categories)
            .insert({
              protocol: company.protocol,
              category: cat.category,
              description: cat.description,
              website: company.website,
              twitter: null,
            })

          if (!catError) {
            insertedCategories.push(cat.category)
          }
        }
      }

      return NextResponse.json({
        success: true,
        company: company.name,
        status: insertedCategories.length > 0 ? 'updated' : 'skipped',
        categories: insertedCategories,
      })
    }

    // Insert new protocol metadata
    const { error: metaError } = await supabaseAdmin
      .from(TABLES.protocols_metadata)
      .insert({
        protocol: company.protocol,
        name: company.name,
        description: company.categories[0]?.description || null,
        logo: null,
        website: company.website,
        twitter: null,
        artemisProjectPage: null,
        is_public: company.is_public,
      })

    if (metaError) throw metaError

    // Insert protocol-category relationships
    for (const cat of company.categories) {
      const { error: catError } = await supabaseAdmin
        .from(TABLES.protocols_categories)
        .insert({
          protocol: company.protocol,
          category: cat.category,
          description: cat.description,
          website: company.website,
          twitter: null,
        })

      if (!catError) {
        insertedCategories.push(cat.category)
      }
    }

    return NextResponse.json({
      success: true,
      company: company.name,
      status: 'created',
      categories: insertedCategories,
    })
  } catch (error) {
    console.error('Add company error:', error)
    return NextResponse.json(
      { error: 'Failed to add company', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
