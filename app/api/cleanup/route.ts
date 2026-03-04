import { NextResponse } from 'next/server'
import { supabaseAdmin, TABLES } from '@/lib/supabase'
import { getSheetData, getGoogleSheetsClient } from '@/lib/google-sheets'

// Companies to remove completely
const COMPANIES_TO_REMOVE = [
  'Captions',
  'Centraleyes',
  'Gable',
  'Indexify',
  'Lexy',
  'Log10',
  'Lumenova AI',
  'MOSTLY AI',
  'Nomic',
  'OpenEvidence',
  'Pydantic AI',
  'Radiant',
  'TELUS International',
  'Vellum',
]

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// GET: Preview what will be changed
export async function GET() {
  try {
    const sheetRows = await getSheetData()

    // Find companies to remove in sheet
    const toRemoveInSheet = sheetRows.filter(row =>
      COMPANIES_TO_REMOVE.some(name =>
        row.companyName.toLowerCase() === name.toLowerCase()
      )
    )

    // Check Supabase for companies to remove
    const { data: supabaseCompanies } = await supabaseAdmin
      .from(TABLES.protocols_metadata)
      .select('protocol, name')

    const toRemoveInSupabase = (supabaseCompanies || []).filter(c =>
      COMPANIES_TO_REMOVE.some(name =>
        c.name.toLowerCase() === name.toLowerCase()
      )
    )

    // Check for Fixie, NEON, OctoML
    const { data: fixie } = await supabaseAdmin
      .from(TABLES.protocols_metadata)
      .select('*')
      .ilike('name', '%fixie%')

    const { data: neon } = await supabaseAdmin
      .from(TABLES.protocols_metadata)
      .select('*')
      .ilike('name', '%neon%')

    const { data: octoml } = await supabaseAdmin
      .from(TABLES.protocols_metadata)
      .select('*')
      .or('name.ilike.%octoml%,name.ilike.%octoai%')

    return NextResponse.json({
      preview: true,
      toRemove: {
        sheet: toRemoveInSheet.map(r => ({ row: r.rowIndex, name: r.companyName })),
        supabase: toRemoveInSupabase,
      },
      toUpdate: {
        fixie,
        neon,
        octoml,
      },
      totalSheetRows: sheetRows.length,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

// POST: Execute cleanup
export async function POST() {
  const results: string[] = []

  try {
    // 1. Delete companies from Supabase
    for (const name of COMPANIES_TO_REMOVE) {
      const slug = generateSlug(name)

      // Delete from protocols_categories first
      const { error: catError } = await supabaseAdmin
        .from(TABLES.protocols_categories)
        .delete()
        .eq('protocol', slug)

      if (catError) {
        results.push(`Error deleting ${name} from categories: ${catError.message}`)
      }

      // Delete from protocols_metadata
      const { error: metaError } = await supabaseAdmin
        .from(TABLES.protocols_metadata)
        .delete()
        .eq('protocol', slug)

      if (metaError) {
        results.push(`Error deleting ${name} from metadata: ${metaError.message}`)
      } else {
        results.push(`Deleted ${name} (slug: ${slug})`)
      }
    }

    // 2. Rename Fixie to Ultravox
    const { error: fixieError } = await supabaseAdmin
      .from(TABLES.protocols_metadata)
      .update({
        name: 'Ultravox',
        description: 'Speech-native voice AI platform. Open-source multimodal LLM for real-time voice conversations without separate ASR. Formerly Fixie.ai.',
        website: 'https://ultravox.ai',
      })
      .eq('protocol', 'fixie')

    if (fixieError) {
      results.push(`Error updating Fixie: ${fixieError.message}`)
    } else {
      // Also update the slug
      await supabaseAdmin
        .from(TABLES.protocols_categories)
        .update({ protocol: 'ultravox' })
        .eq('protocol', 'fixie')

      await supabaseAdmin
        .from(TABLES.protocols_metadata)
        .update({ protocol: 'ultravox' })
        .eq('protocol', 'fixie')

      results.push('Renamed Fixie to Ultravox')
    }

    // 3. Mark NEON as acquired by Databricks
    const { error: neonError } = await supabaseAdmin
      .from(TABLES.protocols_metadata)
      .update({
        company_status: 'acquired',
        description: 'Serverless Postgres database. Acquired by Databricks in May 2025 for ~$1B. Enables AI agents to spin up databases programmatically.',
      })
      .eq('protocol', 'neon')

    if (neonError) {
      results.push(`Error updating Neon: ${neonError.message}`)
    } else {
      results.push('Marked Neon as acquired by Databricks')
    }

    // 4. Mark OctoML/OctoAI as acquired by NVIDIA
    const { error: octoError } = await supabaseAdmin
      .from(TABLES.protocols_metadata)
      .update({
        company_status: 'acquired',
        description: 'ML model optimization and deployment platform. Acquired by NVIDIA in September 2024 for $250M. Services shut down October 2024.',
      })
      .or('protocol.eq.octoml,protocol.eq.octoai')

    if (octoError) {
      results.push(`Error updating OctoML: ${octoError.message}`)
    } else {
      results.push('Marked OctoML as acquired by NVIDIA')
    }

    // 5. Delete from Google Sheet
    const sheets = await getGoogleSheetsClient()
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID
    const sheetRows = await getSheetData()

    // Find rows to delete (in reverse order to maintain row indices)
    const rowsToDelete = sheetRows
      .filter(row => COMPANIES_TO_REMOVE.some(name =>
        row.companyName.toLowerCase() === name.toLowerCase()
      ))
      .sort((a, b) => b.rowIndex - a.rowIndex) // Reverse order

    for (const row of rowsToDelete) {
      // Mark as "Removed" instead of deleting to preserve data
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `companies!L${row.rowIndex}`,
        valueInputOption: 'RAW',
        requestBody: { values: [['Removed']] },
      })
      results.push(`Marked row ${row.rowIndex} (${row.companyName}) as Removed in sheet`)
    }

    // 6. Update Fixie to Ultravox in sheet
    const fixieRow = sheetRows.find(r => r.companyName.toLowerCase() === 'fixie')
    if (fixieRow) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `companies!B${fixieRow.rowIndex}`,
        valueInputOption: 'RAW',
        requestBody: { values: [['Ultravox']] },
      })
      results.push(`Renamed Fixie to Ultravox in sheet (row ${fixieRow.rowIndex})`)
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { error: 'Cleanup failed', details: error instanceof Error ? error.message : 'Unknown', results },
      { status: 500 }
    )
  }
}
