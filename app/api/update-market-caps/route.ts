import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, TABLES } from '@/lib/supabase'

// Market cap data in billions USD (as of March 2026)
const MARKET_CAPS: Record<string, number> = {
  // Mega caps (>$1T)
  'nvidia': 4314,
  'apple': 3882,
  'google': 3767,
  'google-cloud': 3767,
  'microsoft': 2930,
  'microsoft-azure-ai': 2930,
  'amazon': 2254,
  'aws': 2254,
  'tsmc': 1942,
  'meta': 1640,
  'broadcom': 1515,
  'samsung': 1005,

  // Large caps ($100B-$1T)
  'oracle': 425,
  'alibaba': 345,
  'palantir': 328,
  'amd': 326,
  'ge-vernova': 230,
  'intel': 228,
  'ibm': 225,
  'nextera-energy': 195,
  'salesforce': 180,
  'arista-networks': 178,
  'qualcomm': 150,
  'palo-alto-networks': 121,
  'constellation-energy': 118,
  'southern-company': 105,
  'crowdstrike': 105,
  'vertiv': 98,
  'equinix': 84,
  'kinder-morgan': 70,

  // Mid caps ($10B-$100B)
  'digital-realty': 60,
  'snowflake': 58,
  'cloudflare': 58,
  'vistra': 58,
  'dominion-energy': 56,
  'cameco': 50,
  'coreweave': 48,
  'datadog': 44,
  'eqt-corporation': 38,
  'mongodb': 25,
  'zscaler': 23,
  'pure-storage': 22,
  'check-point-software': 17,
  'confluent': 11,
  'elastic': 5.5,

  // Smaller caps
  'innodata': 1.7,
  'telus-international': 1.2,
  'taskus': 0.97,
  'appen': 0.25,

  // Crypto
  'akash-network': 0.09,  // AKT token market cap

  // Private companies (latest valuations as of Feb 2026)
  // Frontier AI Labs
  'openai': 730,
  'anthropic': 380,
  'xai': 250,
  'databricks': 134,
  'anysphere': 29.3,
  'scale-ai': 29,
  'cerebras': 23,
  'perplexity-ai': 20,
  'mistral-ai': 14,
  'moonshot-ai': 12,
  'elevenlabs': 11,
  'notion': 11,
  'midjourney': 10.5,
  'crusoe': 10,
  'replit': 9,
  'harvey': 8,
  'glean': 7.2,
  'cohere': 7,
  'groq': 6.9,
  'runway': 5.3,
  'baseten': 5,
  'hugging-face': 4.5,
  'canva': 42,
  'fireworks-ai': 4,
  'lambda': 4,
  'synthesia': 4,
  'deepseek': 3.4,
  'together-ai': 3.3,
  'sakana-ai': 2.65,
  'character-ai': 2.5,
  'suno': 2.45,
  'sambanova': 2.4,
  'writer': 1.9,
  'snorkel-ai': 1.3,
  'langchain': 1.25,
  'modal': 1.1,
  'labelbox': 1,
  'stability-ai': 1,
  'pinecone': 0.75,
  'pika': 0.7,
  'weaviate': 0.2,
  'qdrant': 0.05,
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to update market caps in database',
    marketCaps: MARKET_CAPS,
  })
}

export async function POST(request: NextRequest) {
  try {
    const results: Array<{ protocol: string; status: string; marketCap?: number }> = []

    for (const [protocol, marketCap] of Object.entries(MARKET_CAPS)) {
      const { data, error } = await supabaseAdmin
        .from(TABLES.protocols_metadata)
        .update({ market_cap: marketCap })
        .eq('protocol', protocol)
        .select('protocol')

      if (error) {
        results.push({ protocol, status: 'error: ' + error.message })
      } else if (data && data.length > 0) {
        results.push({ protocol, status: 'updated', marketCap })
      } else {
        results.push({ protocol, status: 'not found' })
      }
    }

    const updated = results.filter(r => r.status === 'updated').length
    const notFound = results.filter(r => r.status === 'not found').length
    const errors = results.filter(r => r.status.startsWith('error')).length

    return NextResponse.json({
      success: errors === 0,
      summary: { updated, notFound, errors, total: Object.keys(MARKET_CAPS).length },
      results,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update market caps', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
