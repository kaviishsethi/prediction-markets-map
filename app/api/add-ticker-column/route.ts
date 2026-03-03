import { NextResponse } from 'next/server'
import { supabaseAdmin, TABLES } from '@/lib/supabase'

// Stock tickers for public companies
const TICKERS: Record<string, string> = {
  // Mega caps
  'nvidia': 'NVDA',
  'apple': 'AAPL',
  'google': 'GOOGL',
  'google-cloud': 'GOOGL',
  'microsoft-azure-ai': 'MSFT',
  'amazon': 'AMZN',
  'aws': 'AMZN',
  'tsmc': 'TSM',
  'meta': 'META',
  'broadcom': 'AVGO',
  'samsung': '005930.KS',

  // Large caps
  'oracle': 'ORCL',
  'alibaba': 'BABA',
  'palantir': 'PLTR',
  'amd': 'AMD',
  'ge-vernova': 'GEV',
  'intel': 'INTC',
  'ibm': 'IBM',
  'nextera-energy': 'NEE',
  'salesforce': 'CRM',
  'arista-networks': 'ANET',
  'qualcomm': 'QCOM',
  'palo-alto-networks': 'PANW',
  'constellation-energy': 'CEG',
  'southern-company': 'SO',
  'crowdstrike': 'CRWD',
  'vertiv': 'VRT',
  'equinix': 'EQIX',
  'kinder-morgan': 'KMI',
  'american-tower': 'AMT',
  'huawei': '002502.SZ',

  // Mid caps
  'digital-realty': 'DLR',
  'snowflake': 'SNOW',
  'cloudflare': 'NET',
  'vistra': 'VST',
  'dominion-energy': 'D',
  'cameco': 'CCJ',
  'coreweave': 'CRWV',
  'datadog': 'DDOG',
  'mongodb': 'MDB',
  'zscaler': 'ZS',
  'pure-storage': 'PSTG',
  'check-point-software': 'CHKP',
  'confluent': 'CFLT',
  'elastic': 'ESTC',
  'servicenow': 'NOW',
  'workday': 'WDAY',
  'autodesk': 'ADSK',
  'intuit': 'INTU',
  'adobe': 'ADBE',
  'cadence': 'CDNS',
  'synopsys': 'SNPS',
  'tesla': 'TSLA',
  'applovin': 'APP',
  'iron-mountain': 'IRM',
  'applied-digital': 'APLD',
  'core-scientific': 'CORZ',

  // Smaller caps
  'innodata': 'INOD',
  'telus-international': 'TIXT',
  'taskus': 'TASK',
  'appen': 'APX.AX',

  // Hardware
  'arm': 'ARM',
  'micron': 'MU',
  'marvell': 'MRVL',
  'asml': 'ASML',

  // Recent IPOs
  'figma': 'FIGM',
  'zhipu-ai': '2510.HK',

  // Crypto tokens
  'akash-network': 'AKT',
}

export async function POST() {
  try {
    const results: Array<{ protocol: string; status: string; ticker?: string }> = []

    for (const [protocol, ticker] of Object.entries(TICKERS)) {
      const { data, error } = await supabaseAdmin
        .from(TABLES.protocols_metadata)
        .update({ ticker })
        .eq('protocol', protocol)
        .select('protocol')

      if (error) {
        results.push({ protocol, status: 'error: ' + error.message })
      } else if (data && data.length > 0) {
        results.push({ protocol, status: 'updated', ticker })
      } else {
        results.push({ protocol, status: 'not found' })
      }
    }

    const updated = results.filter(r => r.status === 'updated').length
    const notFound = results.filter(r => r.status === 'not found').length
    const errors = results.filter(r => r.status.startsWith('error')).length

    return NextResponse.json({
      success: errors === 0,
      summary: { updated, notFound, errors, total: Object.keys(TICKERS).length },
      results,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add tickers', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to add tickers to database',
    tickers: TICKERS,
  })
}
