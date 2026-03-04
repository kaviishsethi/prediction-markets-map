import { NextResponse } from 'next/server'
import { getLogosData } from '@/lib/google-sheets'
import { supabaseAdmin, TABLES } from '@/lib/supabase'

export async function GET() {
  try {
    // Fetch logos from Google Sheet
    const logos = await getLogosData()

    // Count how many have logo URLs
    const withLogos = logos.filter(l => l.logoUrl && l.logoUrl.includes('http'))

    return NextResponse.json({
      total: logos.length,
      withLogos: withLogos.length,
      sample: logos.slice(0, 10),
    })
  } catch (error) {
    console.error('Error fetching logos:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Fetch logos from Google Sheet
    const logos = await getLogosData()

    const results = {
      total: logos.length,
      updated: 0,
      notFound: [] as string[],
      errors: [] as string[],
    }

    // Update each company's logo in Supabase
    for (const logo of logos) {
      try {
        // Try to find the protocol by name (case-insensitive)
        const { data: existing, error: findError } = await supabaseAdmin
          .from(TABLES.protocols_metadata)
          .select('protocol, name, logo')
          .ilike('name', logo.companyName)
          .limit(1)
          .single()

        if (findError || !existing) {
          results.notFound.push(logo.companyName)
          continue
        }

        // Update the logo and twitter
        const updateData: { logo: string; twitter?: string } = { logo: logo.logoUrl }
        if (logo.twitter) {
          updateData.twitter = logo.twitter
        }

        const { error: updateError } = await supabaseAdmin
          .from(TABLES.protocols_metadata)
          .update(updateData)
          .eq('protocol', existing.protocol)

        if (updateError) {
          results.errors.push(`${logo.companyName}: ${updateError.message}`)
        } else {
          results.updated++
        }
      } catch (err) {
        results.errors.push(`${logo.companyName}: ${String(err)}`)
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error syncing logos:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
