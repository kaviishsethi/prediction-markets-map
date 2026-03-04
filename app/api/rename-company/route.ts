import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, TABLES } from '@/lib/supabase'

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
    const { oldName, newName, newWebsite, newDescription } = await request.json()

    if (!oldName || !newName) {
      return NextResponse.json({ error: 'oldName and newName required' }, { status: 400 })
    }

    const oldSlug = generateSlug(oldName)
    const newSlug = generateSlug(newName)

    const results: string[] = []

    // 1. Get current category data
    const { data: catData } = await supabaseAdmin
      .from(TABLES.protocols_categories)
      .select('*')
      .eq('protocol', oldSlug)
      .single()

    // 2. Delete old category entry
    if (catData) {
      const { error: delCatError } = await supabaseAdmin
        .from(TABLES.protocols_categories)
        .delete()
        .eq('protocol', oldSlug)

      if (delCatError) {
        results.push(`Error deleting old category: ${delCatError.message}`)
      } else {
        results.push(`Deleted old category entry for ${oldSlug}`)
      }
    }

    // 3. Update metadata with new slug and name
    const updateData: Record<string, string> = {
      protocol: newSlug,
      name: newName,
    }
    if (newWebsite) updateData.website = newWebsite
    if (newDescription) updateData.description = newDescription

    const { error: metaError } = await supabaseAdmin
      .from(TABLES.protocols_metadata)
      .update(updateData)
      .eq('protocol', oldSlug)

    if (metaError) {
      results.push(`Error updating metadata: ${metaError.message}`)
    } else {
      results.push(`Updated metadata: ${oldSlug} → ${newSlug}`)
    }

    // 4. Create new category entry
    if (catData) {
      const { error: insCatError } = await supabaseAdmin
        .from(TABLES.protocols_categories)
        .insert({
          protocol: newSlug,
          category: catData.category,
          description: newDescription || catData.description,
          website: newWebsite || catData.website,
          twitter: catData.twitter,
        })

      if (insCatError) {
        results.push(`Error creating new category: ${insCatError.message}`)
      } else {
        results.push(`Created new category entry for ${newSlug}`)
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
