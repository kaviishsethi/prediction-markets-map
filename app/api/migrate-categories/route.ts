import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, TABLES } from '@/lib/supabase'

// Category migration mapping
const MIGRATIONS: Record<string, string> = {
  'cloud-compute': 'cloud-hosting',
  'fine-tuning-training': 'post-training',
  'data-storage': 'data-storage-retrieval',
  'data-retrieval': 'data-storage-retrieval',
  // data-infrastructure and vector-dbs-rag need manual mapping per company
}

export async function GET() {
  // Show current state before migration
  const { data: categories } = await supabaseAdmin
    .from(TABLES.protocols_categories)
    .select('category, protocol')
    .in('category', ['cloud-compute', 'data-infrastructure', 'vector-dbs-rag'])
    .order('category')

  const grouped: Record<string, string[]> = {}
  for (const row of categories || []) {
    if (!grouped[row.category]) grouped[row.category] = []
    grouped[row.category].push(row.protocol)
  }

  return NextResponse.json({
    message: 'Categories to migrate (use POST to execute)',
    toMigrate: grouped,
    migrations: {
      'cloud-compute': '→ cloud-hosting (automatic)',
      'data-infrastructure': '→ data-pipelines (review needed)',
      'vector-dbs-rag': '→ data-retrieval (automatic)',
    },
  })
}

export async function POST(request: NextRequest) {
  const results: Array<{ category: string; action: string; count: number; error?: string }> = []

  try {
    // 0. First, add new categories to the categories table (foreign key requirement)
    const newCategories = [
      { category: 'cloud-hosting', label: 'Cloud & Hosting', bucket: 'INFRA' },
      { category: 'data-storage', label: 'Storage', bucket: 'DATA' },
      { category: 'data-retrieval', label: 'Retrieval', bucket: 'DATA' },
      { category: 'data-labeling', label: 'Labeling', bucket: 'DATA' },
      { category: 'data-pipelines', label: 'Pipelines', bucket: 'DATA' },
      { category: 'post-training', label: 'Post-Training', bucket: 'MODEL' },
    ]

    for (const cat of newCategories) {
      const { error } = await supabaseAdmin
        .from(TABLES.categories)
        .upsert(cat, { onConflict: 'category' })

      if (error) {
        results.push({
          category: `add ${cat.category}`,
          action: 'upsert',
          count: 0,
          error: error.message,
        })
      }
    }

    // 1. Rename cloud-compute → cloud-hosting
    const { data: cloudCompute, error: ccError } = await supabaseAdmin
      .from(TABLES.protocols_categories)
      .update({ category: 'cloud-hosting' })
      .eq('category', 'cloud-compute')
      .select()

    results.push({
      category: 'cloud-compute → cloud-hosting',
      action: 'renamed',
      count: cloudCompute?.length || 0,
      error: ccError?.message,
    })

    // 1b. Rename fine-tuning-training → post-training
    const { data: finetuning, error: ftError } = await supabaseAdmin
      .from(TABLES.protocols_categories)
      .update({ category: 'post-training' })
      .eq('category', 'fine-tuning-training')
      .select()

    results.push({
      category: 'fine-tuning-training → post-training',
      action: 'renamed',
      count: finetuning?.length || 0,
      error: ftError?.message,
    })

    // 2. Rename vector-dbs-rag → data-storage-retrieval
    const { data: vectorDbs, error: vdbError } = await supabaseAdmin
      .from(TABLES.protocols_categories)
      .update({ category: 'data-storage-retrieval' })
      .eq('category', 'vector-dbs-rag')
      .select()

    results.push({
      category: 'vector-dbs-rag → data-storage-retrieval',
      action: 'renamed',
      count: vectorDbs?.length || 0,
      error: vdbError?.message,
    })

    // 2b. Rename data-storage → data-storage-retrieval
    const { data: dataStorage, error: dsError } = await supabaseAdmin
      .from(TABLES.protocols_categories)
      .update({ category: 'data-storage-retrieval' })
      .eq('category', 'data-storage')
      .select()

    results.push({
      category: 'data-storage → data-storage-retrieval',
      action: 'renamed',
      count: dataStorage?.length || 0,
      error: dsError?.message,
    })

    // 2c. Rename data-retrieval → data-storage-retrieval
    const { data: dataRetrieval, error: drError } = await supabaseAdmin
      .from(TABLES.protocols_categories)
      .update({ category: 'data-storage-retrieval' })
      .eq('category', 'data-retrieval')
      .select()

    results.push({
      category: 'data-retrieval → data-storage-retrieval',
      action: 'renamed',
      count: dataRetrieval?.length || 0,
      error: drError?.message,
    })

    // 3. Migrate data-infrastructure to appropriate subcategories
    const dataInfraMapping: Record<string, string> = {
      // Storage
      'snowflake': 'data-storage',
      'databricks': 'data-storage',
      'vast-data': 'data-storage',
      'samsung': 'data-storage', // HBM memory
      // Labeling
      'scale-ai': 'data-labeling',
      'snorkel-ai': 'data-labeling',
      'coactive-ai': 'data-labeling',
      // Pipelines (observability, orchestration)
      'datadog': 'data-pipelines',
      'datarobot': 'data-pipelines',
      'hugging-face': 'data-pipelines', // Hub/datasets
      'cloudflare': 'data-pipelines', // AI Gateway
    }

    let dataInfraCount = 0
    for (const [protocol, newCategory] of Object.entries(dataInfraMapping)) {
      const { data, error } = await supabaseAdmin
        .from(TABLES.protocols_categories)
        .update({ category: newCategory })
        .eq('category', 'data-infrastructure')
        .eq('protocol', protocol)
        .select()

      if (data?.length) dataInfraCount += data.length
      if (error) {
        results.push({
          category: `data-infrastructure/${protocol}`,
          action: 'error',
          count: 0,
          error: error.message,
        })
      }
    }

    // Move any remaining data-infrastructure to data-pipelines as default
    const { data: remaining, error: remainingError } = await supabaseAdmin
      .from(TABLES.protocols_categories)
      .update({ category: 'data-pipelines' })
      .eq('category', 'data-infrastructure')
      .select()

    results.push({
      category: 'data-infrastructure → various',
      action: 'migrated',
      count: dataInfraCount + (remaining?.length || 0),
      error: remainingError?.message,
    })

    // 4. Also update the categories table if it exists
    const { error: catTableError } = await supabaseAdmin
      .from(TABLES.categories)
      .upsert([
        { category: 'cloud-hosting', label: 'Cloud & Hosting', bucket: 'INFRA' },
        { category: 'data-storage-retrieval', label: 'Storage & Retrieval', bucket: 'DATA' },
        { category: 'data-labeling', label: 'Labeling', bucket: 'DATA' },
        { category: 'data-pipelines', label: 'Pipelines', bucket: 'DATA' },
      ], { onConflict: 'category' })

    if (catTableError) {
      results.push({
        category: 'categories table',
        action: 'upsert',
        count: 0,
        error: catTableError.message,
      })
    }

    // 5. Delete old categories from categories table
    await supabaseAdmin
      .from(TABLES.categories)
      .delete()
      .in('category', ['cloud-compute', 'data-infrastructure', 'vector-dbs-rag', 'data-storage', 'data-retrieval'])

    const totalMigrated = results.reduce((sum, r) => sum + r.count, 0)

    return NextResponse.json({
      success: results.every((r) => !r.error),
      totalMigrated,
      results,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
