import { NextResponse } from 'next/server'
import { supabaseAdmin, TABLES } from '@/lib/supabase'
import { getLogosData } from '@/lib/google-sheets'

export async function GET() {
  try {
    // Get all logos from sheet
    const sheetLogos = await getLogosData()

    // Get all protocols from Supabase
    const { data: protocols, error } = await supabaseAdmin
      .from(TABLES.protocols_metadata)
      .select('protocol, name, logo')

    if (error) throw error

    // Create lookup by company name (lowercase)
    const sheetLogoMap = new Map<string, string>()
    for (const row of sheetLogos) {
      sheetLogoMap.set(row.companyName.toLowerCase(), row.logoUrl)
    }

    // Find protocols without logos that have logos in sheet
    const missingLogos: Array<{name: string, hasInSheet: boolean, sheetLogo?: string}> = []
    const withLogos: string[] = []

    for (const p of protocols || []) {
      if (!p.logo) {
        const sheetLogo = sheetLogoMap.get(p.name.toLowerCase())
        missingLogos.push({
          name: p.name,
          hasInSheet: !!sheetLogo,
          sheetLogo: sheetLogo || undefined
        })
      } else {
        withLogos.push(p.name)
      }
    }

    return NextResponse.json({
      totalProtocols: protocols?.length || 0,
      withLogos: withLogos.length,
      missingLogos: missingLogos.length,
      sheetLogosCount: sheetLogos.length,
      missingButInSheet: missingLogos.filter(m => m.hasInSheet),
      missingNotInSheet: missingLogos.filter(m => !m.hasInSheet).map(m => m.name),
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
