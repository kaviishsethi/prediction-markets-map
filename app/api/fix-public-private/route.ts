import { NextResponse } from 'next/server'
import { supabaseAdmin, TABLES } from '@/lib/supabase'

// Companies that are publicly traded (or subsidiaries of public companies)
const PUBLIC_COMPANIES: Record<string, string> = {
  // Major tech companies
  'google-deepmind': 'GOOGL',
  'nvidia': 'NVDA',
  'microsoft-azure-ai': 'MSFT',
  'databricks': 'Private', // Actually still private as of 2026

  // Public consulting/services firms
  'accenture': 'ACN',
  'tcs-ai': 'TCS.NS',
  'cognizant': 'CTSH',
  'epam': 'EPAM',

  // Other public companies
  'notion': 'Private', // Still private
  'deepl': 'Private', // Still private
}

// All Forbes AI50 companies are private startups except those listed above
const KNOWN_PUBLIC = [
  'google-deepmind',
  'nvidia',
  'microsoft-azure-ai',
  'accenture',
  'tcs-ai',
  'cognizant',
  'epam',
]

export async function POST() {
  try {
    // First, set all to private (default for startups)
    const { error: resetError } = await supabaseAdmin
      .from(TABLES.protocols_metadata)
      .update({ is_public: false })
      .neq('protocol', '')

    if (resetError) throw resetError

    // Then set known public companies
    const results: Array<{ protocol: string; is_public: boolean }> = []

    for (const protocol of KNOWN_PUBLIC) {
      const { error } = await supabaseAdmin
        .from(TABLES.protocols_metadata)
        .update({ is_public: true })
        .eq('protocol', protocol)

      results.push({ protocol, is_public: !error })
    }

    // Get counts
    const { data: publicCount } = await supabaseAdmin
      .from(TABLES.protocols_metadata)
      .select('protocol')
      .eq('is_public', true)

    const { data: privateCount } = await supabaseAdmin
      .from(TABLES.protocols_metadata)
      .select('protocol')
      .eq('is_public', false)

    return NextResponse.json({
      success: true,
      publicCompanies: publicCount?.length || 0,
      privateCompanies: privateCount?.length || 0,
      updated: results,
    })
  } catch (error) {
    console.error('Fix public/private error:', error)
    return NextResponse.json(
      { error: 'Update failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
