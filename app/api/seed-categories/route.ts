import { NextResponse } from 'next/server'
import { upsertCategory } from '@/database/api'
import { CATEGORIES } from '@/constants/categories'

export async function POST() {
  try {
    const results: Array<{ category: string; status: 'success' | 'error'; error?: string }> = []

    for (const category of CATEGORIES) {
      try {
        await upsertCategory(category)
        results.push({ category: category.category, status: 'success' })
      } catch (error) {
        results.push({
          category: category.category,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    const successful = results.filter((r) => r.status === 'success').length
    const failed = results.filter((r) => r.status === 'error').length

    return NextResponse.json({
      success: failed === 0,
      summary: { successful, failed, total: CATEGORIES.length },
      results,
    })
  } catch (error) {
    console.error('Seed categories error:', error)
    return NextResponse.json(
      { error: 'Failed to seed categories', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
