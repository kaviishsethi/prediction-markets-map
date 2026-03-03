import { NextResponse } from 'next/server'
import { supabaseAdmin, TABLES } from '@/lib/supabase'

interface CompanyEntry {
  name: string
  protocol: string
  website: string
  is_public: boolean
  categories: Array<{
    category: string
    description: string
  }>
}

const MORE_COMPANIES: CompanyEntry[] = [
  {
    name: 'Exo Labs',
    protocol: 'exo-labs',
    website: 'https://github.com/exo-explore/exo',
    is_public: false,
    categories: [
      {
        category: 'inference',
        description:
          'Exo enables distributed AI inference across heterogeneous devices using pipeline parallelism. Pools compute from Macs, NVIDIA GPUs, and phones into a unified cluster with P2P networking and Thunderbolt 5 RDMA.',
      },
    ],
  },
  {
    name: 'Apple',
    protocol: 'apple',
    website: 'https://apple.com',
    is_public: true, // AAPL
    categories: [
      {
        category: 'ai-applications',
        description:
          'Apple Intelligence provides on-device AI features including Writing Tools, Image Playground, Genmoji, and an enhanced Siri across iPhone, iPad, Mac, and Vision Pro.',
      },
      {
        category: 'foundation-models',
        description:
          'Apple develops on-device foundation models available via the Foundation Models API, enabling third-party apps to use local AI inference with structured responses and tool calling.',
      },
      {
        category: 'inference',
        description:
          'MLX is Apple\'s machine learning framework optimized for Apple Silicon, enabling local model inference with unified memory architecture. Powers on-device AI with zero cloud dependency.',
      },
      {
        category: 'chips-hardware',
        description:
          'M-series chips (M1-M5) feature dedicated Neural Engine for AI workloads. M5 delivers up to 4x MLX performance improvement with Neural Accelerator support in macOS 26.2.',
      },
    ],
  },
  {
    name: 'Prime Intellect',
    protocol: 'prime-intellect',
    website: 'https://primeintellect.ai',
    is_public: false,
    categories: [
      {
        category: 'foundation-models',
        description:
          'Develops INTELLECT series: INTELLECT-1 (10B), INTELLECT-2 (32B), and INTELLECT-3 (100B+ MoE) - the first globally distributed trained models achieving state-of-the-art on math, code, and reasoning.',
      },
      {
        category: 'fine-tuning-training',
        description:
          'OpenDiLoCo enables globally distributed training with 400x communication reduction via int8 gradient quantization. Prime framework provides fault-tolerant training with dynamic compute on/off-ramping.',
      },
      {
        category: 'cloud-compute',
        description:
          'Operates a decentralized compute network where anyone can contribute heterogeneous GPU resources for distributed training. Achieved 83-96% compute utilization across 3 continents.',
      },
    ],
  },
  {
    name: 'Nous Research',
    protocol: 'nous-research',
    website: 'https://nousresearch.com',
    is_public: false,
    categories: [
      {
        category: 'foundation-models',
        description:
          'Creates the Hermes model family (Hermes 4: 14B, 70B, 405B) with hybrid reasoning capabilities. Hermes 4 405B scores 96.3% on MATH-500 and 81.9% on AIME\'24 in reasoning mode.',
      },
      {
        category: 'fine-tuning-training',
        description:
          'Develops DataForge (graph-based synthetic data generator) and Atropos (open-source RL framework). Trained on 5M samples / 60B tokens with novel reasoning length control techniques.',
      },
    ],
  },
]

export async function POST() {
  const results: Array<{
    company: string
    status: 'success' | 'skipped' | 'error'
    categories: string[]
    error?: string
  }> = []

  for (const company of MORE_COMPANIES) {
    try {
      // Check if protocol already exists
      const { data: existing } = await supabaseAdmin
        .from(TABLES.protocols_metadata)
        .select('protocol')
        .eq('protocol', company.protocol)
        .single()

      if (existing) {
        const insertedCategories: string[] = []
        for (const cat of company.categories) {
          const { data: existingCat } = await supabaseAdmin
            .from(TABLES.protocols_categories)
            .select('id')
            .eq('protocol', company.protocol)
            .eq('category', cat.category)
            .single()

          if (!existingCat) {
            const { error: catError } = await supabaseAdmin
              .from(TABLES.protocols_categories)
              .insert({
                protocol: company.protocol,
                category: cat.category,
                description: cat.description,
                website: company.website,
                twitter: null,
              })

            if (!catError) {
              insertedCategories.push(cat.category)
            }
          }
        }

        results.push({
          company: company.name,
          status: insertedCategories.length > 0 ? 'success' : 'skipped',
          categories: insertedCategories,
        })
        continue
      }

      // Insert new protocol metadata
      const { error: metaError } = await supabaseAdmin
        .from(TABLES.protocols_metadata)
        .insert({
          protocol: company.protocol,
          name: company.name,
          description: company.categories[0]?.description || null,
          logo: null,
          website: company.website,
          twitter: null,
          artemisProjectPage: null,
          is_public: company.is_public,
        })

      if (metaError) throw metaError

      // Insert protocol-category relationships
      const insertedCategories: string[] = []
      for (const cat of company.categories) {
        const { error: catError } = await supabaseAdmin
          .from(TABLES.protocols_categories)
          .insert({
            protocol: company.protocol,
            category: cat.category,
            description: cat.description,
            website: company.website,
            twitter: null,
          })

        if (!catError) {
          insertedCategories.push(cat.category)
        }
      }

      results.push({
        company: company.name,
        status: 'success',
        categories: insertedCategories,
      })
    } catch (error) {
      results.push({
        company: company.name,
        status: 'error',
        categories: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  const successful = results.filter((r) => r.status === 'success').length
  const skipped = results.filter((r) => r.status === 'skipped').length
  const failed = results.filter((r) => r.status === 'error').length
  const totalCategories = results.reduce((sum, r) => sum + r.categories.length, 0)

  return NextResponse.json({
    success: failed === 0,
    summary: { companies: successful, skipped, failed, totalCategoryEntries: totalCategories },
    results,
  })
}
