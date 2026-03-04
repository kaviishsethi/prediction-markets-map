import { supabase, supabaseAdmin, TABLES } from '@/lib/supabase'

export interface Category {
  id: number
  category: string
  label: string
  bucket: string
}

export interface ProtocolMetadata {
  id: number
  protocol: string
  name: string
  description: string | null
  logo: string | null
  website: string | null
  twitter: string | null
  artemisProjectPage: string | null
  is_public: boolean
  market_cap: number | null
  ticker: string | null  // Stock ticker (e.g., "NVDA") or crypto token symbol
  company_status: string | null  // 'active', 'acquired', 'merged', etc.
  created_at: string
}

export interface ProtocolCategory {
  id: number
  protocol: string
  category: string
  description: string | null
  website: string | null
  twitter: string | null
}

export interface ProtocolWithMetadata extends ProtocolCategory {
  metadata: ProtocolMetadata
}

export interface CategoryWithProtocols extends Category {
  protocols: ProtocolWithMetadata[]
}

// Fetch all categories
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from(TABLES.categories)
    .select('*')
    .order('id')

  if (error) throw error
  return data || []
}

// Fetch all protocols with their metadata and categories
export async function getProtocolsWithCategories(): Promise<ProtocolWithMetadata[]> {
  // Fetch protocols_categories
  const { data: protocolCategories, error: pcError } = await supabase
    .from(TABLES.protocols_categories)
    .select('*')

  if (pcError) throw pcError

  // Fetch all protocols_metadata
  const { data: metadata, error: metaError } = await supabase
    .from(TABLES.protocols_metadata)
    .select('*')

  if (metaError) throw metaError

  // Create a map for quick lookup
  const metadataMap = new Map<string, ProtocolMetadata>()
  for (const m of metadata || []) {
    metadataMap.set(m.protocol, m)
  }

  // Join the data
  const result: ProtocolWithMetadata[] = []
  for (const pc of protocolCategories || []) {
    const meta = metadataMap.get(pc.protocol)
    if (meta) {
      result.push({
        ...pc,
        metadata: meta,
      })
    }
  }

  return result
}

// Fetch categories with their protocols
export async function getCategoriesWithProtocols(): Promise<Record<string, CategoryWithProtocols>> {
  const [categories, protocols] = await Promise.all([
    getCategories(),
    getProtocolsWithCategories(),
  ])

  const result: Record<string, CategoryWithProtocols> = {}

  for (const category of categories) {
    result[category.category] = {
      ...category,
      protocols: protocols.filter((p) => p.category === category.category),
    }
  }

  return result
}

// Admin functions for syncing

export async function upsertCategory(category: Omit<Category, 'id'>): Promise<void> {
  const { error } = await supabaseAdmin
    .from(TABLES.categories)
    .upsert(category, { onConflict: 'category' })

  if (error) throw error
}

export async function getProtocolMetadata(protocol: string): Promise<ProtocolMetadata | null> {
  const { data, error } = await supabaseAdmin
    .from(TABLES.protocols_metadata)
    .select('*')
    .eq('protocol', protocol)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function insertProtocolMetadata(metadata: Omit<ProtocolMetadata, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabaseAdmin
    .from(TABLES.protocols_metadata)
    .insert(metadata)

  if (error) throw error
}

export async function updateProtocolMetadata(
  protocol: string,
  updates: Partial<Omit<ProtocolMetadata, 'id' | 'protocol' | 'created_at'>>
): Promise<void> {
  const { error } = await supabaseAdmin
    .from(TABLES.protocols_metadata)
    .update(updates)
    .eq('protocol', protocol)

  if (error) throw error
}

export async function getProtocolCategory(protocol: string, category: string): Promise<ProtocolCategory | null> {
  const { data, error } = await supabaseAdmin
    .from(TABLES.protocols_categories)
    .select('*')
    .eq('protocol', protocol)
    .eq('category', category)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function insertProtocolCategory(protocolCategory: Omit<ProtocolCategory, 'id'>): Promise<void> {
  const { error } = await supabaseAdmin
    .from(TABLES.protocols_categories)
    .insert(protocolCategory)

  if (error) throw error
}

export async function upsertProtocolMetadata(metadata: Omit<ProtocolMetadata, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabaseAdmin
    .from(TABLES.protocols_metadata)
    .upsert(metadata, { onConflict: 'protocol' })

  if (error) throw error
}

export async function upsertProtocolCategory(protocolCategory: Omit<ProtocolCategory, 'id'>): Promise<void> {
  const { error } = await supabaseAdmin
    .from(TABLES.protocols_categories)
    .upsert(protocolCategory, { onConflict: 'protocol,category' })

  if (error) throw error
}

export async function deleteProtocol(protocol: string): Promise<void> {
  // Delete from protocols_categories first (foreign key constraint)
  const { error: catError } = await supabaseAdmin
    .from(TABLES.protocols_categories)
    .delete()
    .eq('protocol', protocol)

  if (catError) throw catError

  // Then delete from protocols_metadata
  const { error: metaError } = await supabaseAdmin
    .from(TABLES.protocols_metadata)
    .delete()
    .eq('protocol', protocol)

  if (metaError) throw metaError
}

export async function deleteProtocolCategory(protocol: string, category: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from(TABLES.protocols_categories)
    .delete()
    .eq('protocol', protocol)
    .eq('category', category)

  if (error) throw error
}
