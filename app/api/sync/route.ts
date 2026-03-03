import { NextRequest, NextResponse } from 'next/server'
import { getSheetData, updateRowStatus } from '@/lib/google-sheets'
import {
  getProtocolMetadata,
  insertProtocolMetadata,
  getProtocolCategory,
  insertProtocolCategory,
} from '@/database/api'
import { getCategorySlug } from '@/constants/categories'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const full = searchParams.get('full') === 'true'

  try {
    const rows = await getSheetData()

    if (full) {
      return NextResponse.json({ rows })
    }

    // Return only rows with status 'Done' (ready to sync)
    const doneRows = rows.filter((row) => row.status === 'Done')
    return NextResponse.json({ rows: doneRows, total: rows.length })
  } catch (error) {
    console.error('Error fetching sheet data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sheet data' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const rows = await getSheetData()
    const doneRows = rows.filter((row) => row.status === 'Done')

    const results: Array<{
      row: number
      company: string
      category: string
      status: 'synced' | 'duplicate' | 'error' | 'invalid_category'
      message?: string
    }> = []

    for (const row of doneRows) {
      const { rowIndex, companyName, website, category, description, logoUrl, twitter, projectPage } = row

      // Validate category
      const categorySlug = getCategorySlug(category)
      if (!categorySlug) {
        results.push({
          row: rowIndex,
          company: companyName,
          category,
          status: 'invalid_category',
          message: `Category "${category}" not found in CATEGORY_MAP`,
        })
        continue
      }

      const slug = generateSlug(companyName)

      try {
        // Check if protocol+category already exists
        const existingProtocolCategory = await getProtocolCategory(slug, categorySlug)
        if (existingProtocolCategory) {
          await updateRowStatus(rowIndex, 'Duplicate')
          results.push({
            row: rowIndex,
            company: companyName,
            category: categorySlug,
            status: 'duplicate',
          })
          continue
        }

        // Check if protocol metadata exists
        const existingMetadata = await getProtocolMetadata(slug)
        if (!existingMetadata) {
          // Insert new protocol metadata
          await insertProtocolMetadata({
            protocol: slug,
            name: companyName,
            description: description || null,
            logo: logoUrl || null,
            website: website || null,
            twitter: twitter || null,
            artemisProjectPage: projectPage || null,
          })
        }

        // Insert protocol+category
        await insertProtocolCategory({
          protocol: slug,
          category: categorySlug,
          description: description || null,
          website: website || null,
          twitter: twitter || null,
        })

        // Mark as synced in sheet
        await updateRowStatus(rowIndex, 'Synced')

        results.push({
          row: rowIndex,
          company: companyName,
          category: categorySlug,
          status: 'synced',
        })
      } catch (error) {
        console.error(`Error syncing row ${rowIndex}:`, error)
        results.push({
          row: rowIndex,
          company: companyName,
          category: categorySlug,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    const synced = results.filter((r) => r.status === 'synced').length
    const duplicates = results.filter((r) => r.status === 'duplicate').length
    const errors = results.filter((r) => r.status === 'error').length
    const invalidCategories = results.filter((r) => r.status === 'invalid_category').length

    return NextResponse.json({
      success: true,
      summary: { synced, duplicates, errors, invalidCategories },
      results,
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Sync failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
