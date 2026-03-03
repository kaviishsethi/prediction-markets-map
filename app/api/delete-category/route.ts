import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, TABLES } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { category } = await request.json()

    if (!category) {
      return NextResponse.json({ error: 'category is required' }, { status: 400 })
    }

    // First delete all protocol-category associations
    const { data: deletedAssociations, error: assocError } = await supabaseAdmin
      .from(TABLES.protocols_categories)
      .delete()
      .eq('category', category)
      .select('protocol')

    if (assocError) throw assocError

    // Then delete the category itself
    const { data: deletedCategory, error: catError } = await supabaseAdmin
      .from(TABLES.categories)
      .delete()
      .eq('category', category)
      .select()

    if (catError) throw catError

    return NextResponse.json({
      success: true,
      message: `Deleted category "${category}"`,
      associations_deleted: deletedAssociations?.length || 0,
      category_deleted: deletedCategory?.length || 0,
    })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
