import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, TABLES } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { protocol, category, description, website } = body

    if (!protocol || !category || !description) {
      return NextResponse.json(
        { error: 'protocol, category, and description are required' },
        { status: 400 }
      )
    }

    // Check if protocol exists
    const { data: existing } = await supabaseAdmin
      .from(TABLES.protocols_metadata)
      .select('protocol, website')
      .eq('protocol', protocol)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: `Protocol "${protocol}" not found` },
        { status: 404 }
      )
    }

    // Check if category entry already exists
    const { data: existingCat } = await supabaseAdmin
      .from(TABLES.protocols_categories)
      .select('id')
      .eq('protocol', protocol)
      .eq('category', category)
      .single()

    if (existingCat) {
      return NextResponse.json(
        { error: `Protocol "${protocol}" already has category "${category}"` },
        { status: 409 }
      )
    }

    // Insert the category
    const { error: insertError } = await supabaseAdmin
      .from(TABLES.protocols_categories)
      .insert({
        protocol,
        category,
        description,
        website: website || existing.website,
        twitter: null,
      })

    if (insertError) throw insertError

    return NextResponse.json({
      success: true,
      protocol,
      category,
      description,
    })
  } catch (error) {
    console.error('Add category error:', error)
    return NextResponse.json(
      { error: 'Failed to add category', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
