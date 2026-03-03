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

// Big tech companies with specific AI products
const BIG_TECH_AI: CompanyEntry[] = [
  {
    name: 'AWS',
    protocol: 'aws',
    website: 'https://aws.amazon.com',
    is_public: true, // Amazon is public (AMZN)
    categories: [
      {
        category: 'ai-agents',
        description:
          'Amazon Bedrock AgentCore is an agentic platform to build, deploy, and operate AI agents at scale with policy controls, quality monitoring, and memory capabilities.',
      },
      {
        category: 'fine-tuning-training',
        description:
          'Amazon SageMaker AI provides fully managed ML training and fine-tuning with HyperPod for distributed training, checkpointless recovery, and elastic scaling.',
      },
      {
        category: 'inference',
        description:
          'Amazon Bedrock provides managed inference for 100+ foundation models from Anthropic, Meta, Mistral, and others with Guardrails for safety and Intelligent Prompt Routing.',
      },
      {
        category: 'cloud-compute',
        description:
          'AWS AI infrastructure includes P5/P4d GPU instances and Trainium/Inferentia clusters, powering 100,000+ organizations building AI applications.',
      },
      {
        category: 'chips-hardware',
        description:
          'AWS Trainium chips for training and AWS Inferentia chips for inference - custom silicon delivering up to 50% better price-performance for AI workloads.',
      },
    ],
  },
  {
    name: 'Amazon',
    protocol: 'amazon',
    website: 'https://amazon.com',
    is_public: true, // AMZN
    categories: [
      {
        category: 'ai-applications',
        description:
          'Rufus is an AI shopping assistant used by 250M+ customers, providing conversational product discovery and recommendations. Alexa+ offers generative AI-powered voice assistance with Nova Sonic.',
      },
      {
        category: 'ai-agents',
        description:
          'Rufus uses agentic AI to autonomously add products to cart, handle reordering ("reorder everything for pumpkin pie"), and execute multi-step shopping tasks.',
      },
    ],
  },
  {
    name: 'Cloudflare',
    protocol: 'cloudflare',
    website: 'https://cloudflare.com',
    is_public: true, // NET
    categories: [
      {
        category: 'inference',
        description:
          'Workers AI provides serverless GPU inference on Cloudflare\'s global network, powered by their custom Infire engine built in Rust for 2-4x faster inference than vLLM.',
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

  for (const company of BIG_TECH_AI) {
    try {
      // Check if protocol already exists
      const { data: existing } = await supabaseAdmin
        .from(TABLES.protocols_metadata)
        .select('protocol')
        .eq('protocol', company.protocol)
        .single()

      if (existing) {
        // Still add new category relationships if they don't exist
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
