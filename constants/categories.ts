// Category definitions for Prediction Markets Landscape Map
export const CATEGORIES = [
  // Platforms Layer
  { category: 'regulated-us-exchanges', label: 'Regulated US Exchanges (DCMs)', bucket: 'PLATFORMS' },
  { category: 'crypto-defi-markets', label: 'Crypto / DeFi Markets', bucket: 'PLATFORMS' },
  { category: 'sportsbook-tradfi', label: 'Sportsbook & TradFi Entrants', bucket: 'PLATFORMS' },
  // Distribution Layer
  { category: 'broker-distribution', label: 'Broker Distribution', bucket: 'DISTRIBUTION' },
  { category: 'aggregators-apis', label: 'Aggregators & APIs', bucket: 'DISTRIBUTION' },
  // Liquidity Layer
  { category: 'institutional-market-makers', label: 'Institutional Market Makers', bucket: 'LIQUIDITY' },
  // Data Layer
  { category: 'analytics-platforms', label: 'Analytics Platforms', bucket: 'DATA' },
  { category: 'media-research', label: 'Media & Research', bucket: 'DATA' },
  // Oracle Layer
  { category: 'onchain-oracles', label: 'On-Chain Oracles', bucket: 'ORACLE' },
  { category: 'benchmarks-pricing', label: 'Benchmarks & Pricing', bucket: 'ORACLE' },
  // Infrastructure Layer
  { category: 'settlement-chains', label: 'Settlement Chains', bucket: 'INFRA' },
  { category: 'clearing-exchange-infra', label: 'Clearing & Exchange Infra', bucket: 'INFRA' },
  { category: 'compliance-kyc-aml', label: 'Compliance & KYC/AML', bucket: 'INFRA' },
  // Regulatory & Capital Layer
  { category: 'regulators', label: 'Regulators', bucket: 'CAPITAL' },
  { category: 'investors', label: 'Investors', bucket: 'CAPITAL' },
]

// Map sheet values (column D) to category slugs
export const CATEGORY_MAP: Record<string, string> = {
  'Regulated US Exchanges (DCMs)': 'regulated-us-exchanges',
  'Regulated US Exchanges': 'regulated-us-exchanges',
  'DCMs': 'regulated-us-exchanges',
  'Crypto / DeFi Markets': 'crypto-defi-markets',
  'Crypto Markets': 'crypto-defi-markets',
  'DeFi Markets': 'crypto-defi-markets',
  'Sportsbook & TradFi Entrants': 'sportsbook-tradfi',
  'TradFi Entrants': 'sportsbook-tradfi',
  'Sportsbook': 'sportsbook-tradfi',
  'Broker Distribution': 'broker-distribution',
  'Brokers': 'broker-distribution',
  'Aggregators & APIs': 'aggregators-apis',
  'APIs': 'aggregators-apis',
  'Aggregators': 'aggregators-apis',
  'Institutional Market Makers': 'institutional-market-makers',
  'Market Makers': 'institutional-market-makers',
  'Analytics Platforms': 'analytics-platforms',
  'Analytics': 'analytics-platforms',
  'Media & Research': 'media-research',
  'Media': 'media-research',
  'Research': 'media-research',
  'On-Chain Oracles': 'onchain-oracles',
  'Oracles': 'onchain-oracles',
  'Benchmarks & Pricing': 'benchmarks-pricing',
  'Benchmarks': 'benchmarks-pricing',
  'Settlement Chains': 'settlement-chains',
  'Chains': 'settlement-chains',
  'Clearing & Exchange Infra': 'clearing-exchange-infra',
  'Clearing': 'clearing-exchange-infra',
  'Exchange Infra': 'clearing-exchange-infra',
  'Compliance & KYC/AML': 'compliance-kyc-aml',
  'Compliance': 'compliance-kyc-aml',
  'KYC/AML': 'compliance-kyc-aml',
  'Regulators': 'regulators',
  'Regulatory': 'regulators',
  'Investors': 'investors',
  'Capital': 'investors',
}

// Category descriptions (shown on hover)
export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'regulated-us-exchanges':
    'CFTC-regulated Designated Contract Markets (DCMs) offering event contracts to US participants. Includes exchanges with full regulatory approval for prediction market trading.',
  'crypto-defi-markets':
    'Decentralized and crypto-native prediction market platforms. Built on-chain using smart contracts, offering permissionless market creation and settlement.',
  'sportsbook-tradfi':
    'Traditional sportsbooks and financial services firms entering the prediction markets space. Leveraging existing user bases and regulatory frameworks.',
  'broker-distribution':
    'Brokerage platforms distributing prediction market access to retail investors. Serve as the front-end through which users access event contracts.',
  'aggregators-apis':
    'Platforms aggregating odds and data across prediction markets. Provide APIs for developers and data feeds for media and research.',
  'institutional-market-makers':
    'Quantitative trading firms providing liquidity to prediction markets. Supply continuous two-sided quotes enabling efficient price discovery.',
  'analytics-platforms':
    'Data analytics and intelligence platforms tracking prediction market activity. Provide dashboards, metrics, and insights across protocols.',
  'media-research':
    'News, research, and media organizations covering prediction markets. Provide analysis, commentary, and data visualization.',
  'onchain-oracles':
    'Decentralized oracle networks that resolve prediction market outcomes. Bridge real-world event data on-chain for smart contract settlement.',
  'benchmarks-pricing':
    'Financial data providers offering benchmark pricing and index services. Supply reference data for prediction market settlement and valuation.',
  'settlement-chains':
    'Layer 1 and Layer 2 blockchains used for prediction market settlement. Provide the base infrastructure for on-chain market operations.',
  'clearing-exchange-infra':
    'Clearinghouses and exchange technology providers. Handle trade matching, clearing, settlement, and risk management for prediction markets.',
  'compliance-kyc-aml':
    'Compliance technology providers for identity verification, KYC, and anti-money laundering. Enable prediction markets to meet regulatory requirements.',
  'regulators':
    'Government agencies and regulatory bodies overseeing prediction markets. Set rules for market operation, participant eligibility, and contract types.',
  'investors':
    'Venture capital firms and institutional investors backing prediction market companies. Provide growth capital and strategic support to the ecosystem.',
}

// Categories to exclude from display
export const HIDDEN_CATEGORIES: string[] = []

// Layout: define which categories share rows
export const LAYOUT_ROWS = [
  ['regulated-us-exchanges', 'crypto-defi-markets', 'sportsbook-tradfi'],
  ['broker-distribution', 'aggregators-apis'],
  ['institutional-market-makers'],
  ['analytics-platforms', 'media-research'],
  ['onchain-oracles', 'benchmarks-pricing'],
  ['settlement-chains', 'clearing-exchange-infra', 'compliance-kyc-aml'],
  ['regulators', 'investors'],
]

// Custom ordering within categories
export const CATEGORY_ORDERING: Record<string, string[]> = {
  'regulated-us-exchanges': ['kalshi', 'predictit', 'forecastex', 'cme-group'],
  'crypto-defi-markets': ['polymarket', 'drift', 'limitless'],
  'analytics-platforms': ['artemis', 'dune-analytics', 'defillama'],
}

// Helper to get category slug from sheet value
export function getCategorySlug(sheetValue: string): string | null {
  return CATEGORY_MAP[sheetValue] || null
}

// Helper to get category label from slug
export function getCategoryLabel(slug: string): string | null {
  const cat = CATEGORIES.find((c) => c.category === slug)
  return cat?.label || null
}
