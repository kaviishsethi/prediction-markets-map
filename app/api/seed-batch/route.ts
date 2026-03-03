import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, TABLES } from '@/lib/supabase'

interface CategoryEntry {
  category: string
  description: string
}

interface CompanyInput {
  protocol: string
  name: string
  website: string
  is_public: boolean
  categories: CategoryEntry[]
}

const COMPANIES: CompanyInput[] = [
  // ============ CHIPS & HARDWARE ============
  {
    name: 'AMD',
    protocol: 'amd',
    website: 'https://amd.com',
    is_public: true, // AMD
    categories: [
      {
        category: 'chips-hardware',
        description:
          'AMD Instinct MI300X/MI325X GPUs with 192-256GB HBM3E memory power AI training at Meta, OpenAI, Microsoft. MI350 series (2025) delivers 4.2x performance over MI300X.',
      },
      {
        category: 'fine-tuning-training',
        description:
          'ROCm 7 software stack delivers 3.5x performance gains over ROCm 6, with PyTorch/TensorFlow/vLLM support. AMD Developer Cloud provides training infrastructure.',
      },
    ],
  },
  {
    name: 'Intel',
    protocol: 'intel',
    website: 'https://intel.com',
    is_public: true, // INTC
    categories: [
      {
        category: 'chips-hardware',
        description:
          'Intel Gaudi 3 AI accelerators deliver 2x price/performance vs H100 with 128GB HBM2e. Xeon 6 processors feature AI acceleration in every core with 128-core designs.',
      },
      {
        category: 'inference',
        description:
          'Gaudi 3 PCIe cards enable scalable AI inference for Llama models from 8B to 405B parameters. Dell AI platform with Gaudi 3 offers 70% better price-performance than H100.',
      },
    ],
  },
  {
    name: 'Cerebras',
    protocol: 'cerebras',
    website: 'https://cerebras.ai',
    is_public: false,
    categories: [
      {
        category: 'chips-hardware',
        description:
          'WSE-3 is the largest AI chip ever built with 4 trillion transistors, 900K AI cores, and 44GB on-chip SRAM delivering 7,000x more memory bandwidth than H100.',
      },
      {
        category: 'inference',
        description:
          'Cerebras inference delivers 2,500+ tokens/sec on Llama 4 Maverick 400B, beating Blackwell by 2x. Powers Mistral Le Chat at 1,000 words/sec and Perplexity instant search.',
      },
    ],
  },
  {
    name: 'Groq',
    protocol: 'groq',
    website: 'https://groq.com',
    is_public: false, // Acquired by NVIDIA Dec 2025
    categories: [
      {
        category: 'chips-hardware',
        description:
          'Groq LPU (Language Processing Unit) delivers 300 tokens/sec on Llama 2 70B - 10x faster than H100 clusters. Acquired by NVIDIA for $20B in December 2025.',
      },
      {
        category: 'inference',
        description:
          'GroqCloud provides ultra-low-latency inference at $0.11-0.79/M tokens. 1.9M+ developers using the platform with enterprise deployments at Dropbox, Volkswagen, Riot Games.',
      },
    ],
  },
  {
    name: 'Qualcomm',
    protocol: 'qualcomm',
    website: 'https://qualcomm.com',
    is_public: true, // QCOM
    categories: [
      {
        category: 'chips-hardware',
        description:
          'Cloud AI 100 Ultra delivers 400+ INT8 TOPs for datacenter inference. Snapdragon X Elite features 45 TOPS Hexagon NPU powering Microsoft Copilot+ PCs.',
      },
      {
        category: 'inference',
        description:
          'Dell Pro Max with dual Cloud AI 100 NPUs runs 120B parameter models locally with 64GB dedicated AI memory. Powers on-device inference across smartphones, PCs, and automotive.',
      },
    ],
  },
  {
    name: 'Samsung',
    protocol: 'samsung',
    website: 'https://samsung.com',
    is_public: true, // 005930.KS
    categories: [
      {
        category: 'chips-hardware',
        description:
          'Industry-first commercial HBM4 with 36GB capacity and 3.3 TB/s bandwidth. Exynos 2600 on 2nm GAA process delivers 113% better NPU performance for on-device AI.',
      },
      {
        category: 'data-infrastructure',
        description:
          'Samsung HBM3E supplies 60%+ of Google AI chip memory. Building AI Factory with NVIDIA using 50,000+ GPUs to transform semiconductor manufacturing.',
      },
    ],
  },
  {
    name: 'TSMC',
    protocol: 'tsmc',
    website: 'https://tsmc.com',
    is_public: true, // TSM
    categories: [
      {
        category: 'chips-hardware',
        description:
          'Manufactures AI chips for NVIDIA, AMD, Apple, Google on 3nm/2nm processes. CoWoS advanced packaging capacity doubled to 75K wafers/month, fully booked through 2026.',
      },
    ],
  },
  {
    name: 'Huawei',
    protocol: 'huawei',
    website: 'https://huawei.com',
    is_public: false,
    categories: [
      {
        category: 'chips-hardware',
        description:
          'Ascend 910C delivers 800 TFLOPS FP16 with 128GB HBM, manufactured by SMIC on 7nm. Powers AI infrastructure for Baidu, ByteDance, and Tencent in China.',
      },
      {
        category: 'fine-tuning-training',
        description:
          'MindSpore open-source ML framework and CANN compute architecture for Ascend chips. Going fully open source by December 2025 to expand developer ecosystem.',
      },
    ],
  },

  // ============ CLOUD & COMPUTE ============
  {
    name: 'CoreWeave',
    protocol: 'coreweave',
    website: 'https://coreweave.com',
    is_public: true, // IPO March 2025
    categories: [
      {
        category: 'cloud-compute',
        description:
          'First cloud provider to deploy NVIDIA GB200 and GB300 NVL72. $12B OpenAI contract and $14.2B Meta commitment. 43 data centers with 850MW active power.',
      },
      {
        category: 'fine-tuning-training',
        description:
          'Acquired Weights & Biases for $1.7B. Achieved MLPerf record training Llama 3.1 405B in 27.3 minutes using 2,500 GB200 Superchips. Only Platinum-rated GPU cloud by SemiAnalysis.',
      },
    ],
  },
  {
    name: 'Oracle',
    protocol: 'oracle',
    website: 'https://oracle.com',
    is_public: true, // ORCL
    categories: [
      {
        category: 'cloud-compute',
        description:
          'OCI Supercluster offers up to 131,072 NVIDIA GPUs with GB200 NVL72 systems delivering 2.4 zettaFLOPS. First to adopt AMD MI355X for zettascale AI clusters.',
      },
      {
        category: 'inference',
        description:
          'OCI Generative AI service integrates Google Gemini 2.5 and 160+ NVIDIA NIM microservices. Agent Hub enables building and deploying AI agents at enterprise scale.',
      },
    ],
  },

  // ============ FOUNDATION MODELS ============
  {
    name: 'IBM',
    protocol: 'ibm',
    website: 'https://ibm.com',
    is_public: true, // IBM
    categories: [
      {
        category: 'foundation-models',
        description:
          'Granite 4.0 models are open, performant enterprise AI models with top Stanford Transparency Index rating. Powers IBM products for code generation and application development.',
      },
      {
        category: 'ai-agents',
        description:
          'watsonx.ai AgentOps provides end-to-end AI agent lifecycle management. Model Gateway eliminates vendor lock-in by integrating Granite with Anthropic and OpenAI models.',
      },
      {
        category: 'inference',
        description:
          'First cloud provider to offer Intel Gaudi 3 accelerators. Partnered with Anthropic to integrate Claude models into watsonx orchestration layer.',
      },
    ],
  },
  {
    name: 'Alibaba',
    protocol: 'alibaba',
    website: 'https://alibabacloud.com',
    is_public: true, // BABA
    categories: [
      {
        category: 'foundation-models',
        description:
          'Qwen3 family includes dense (0.6B-32B) and MoE models (235B with 22B active). 300+ open-source models with 600M+ downloads. Qwen3-Omni generates text, images, audio, and video.',
      },
      {
        category: 'cloud-compute',
        description:
          'Alibaba Cloud Model Studio hosts Qwen models with 90,000+ enterprise deployments. Supports 119 languages and Model Context Protocol for agentic AI applications.',
      },
    ],
  },

  // ============ AI APPLICATIONS ============
  {
    name: 'Salesforce',
    protocol: 'salesforce',
    website: 'https://salesforce.com',
    is_public: true, // CRM
    categories: [
      {
        category: 'ai-applications',
        description:
          'Einstein GPT generates AI content directly in Salesforce CRM, adapting to customer data. Embedded in Sales Cloud, Service Cloud, and Marketing Cloud.',
      },
      {
        category: 'ai-agents',
        description:
          'Agentforce deploys autonomous AI agents (Sales Agent, Service Agent) that handle complex tasks without human oversight, powered by the Atlas Reasoning Engine.',
      },
    ],
  },
  {
    name: 'Canva',
    protocol: 'canva',
    website: 'https://canva.com',
    is_public: false,
    categories: [
      {
        category: 'ai-applications',
        description:
          'Magic Studio suite used 16B+ times includes Magic Design (AI design generator), Magic Write (OpenAI-powered text), Magic Media (text-to-image/video), and Magic Edit.',
      },
    ],
  },
  {
    name: 'Character.AI',
    protocol: 'character-ai',
    website: 'https://character.ai',
    is_public: false,
    categories: [
      {
        category: 'ai-applications',
        description:
          'AI chatbot platform with 250M+ monthly visits. Users create custom AI characters for roleplay and conversation. AvatarFX generates videos of AI characters.',
      },
      {
        category: 'foundation-models',
        description:
          'Develops proprietary LLMs optimized for persona-driven conversations. Average session duration of 17 minutes is 2x longer than ChatGPT.',
      },
    ],
  },
  {
    name: 'Replit',
    protocol: 'replit',
    website: 'https://replit.com',
    is_public: false,
    categories: [
      {
        category: 'ai-applications',
        description:
          'Ghostwriter provides AI code completion, review, and transformation in a browser-based IDE. Replit Agent builds complete apps from natural language descriptions.',
      },
      {
        category: 'ai-agents',
        description:
          'Replit Agent autonomously creates full applications with one-click deployment. Zero-setup environments with instant sharing and collaboration.',
      },
    ],
  },

  // ============ DATA INFRASTRUCTURE ============
  {
    name: 'Snowflake',
    protocol: 'snowflake',
    website: 'https://snowflake.com',
    is_public: true, // SNOW
    categories: [
      {
        category: 'data-infrastructure',
        description:
          'Snowflake AI Data Cloud with Cortex AI provides serverless LLM functions on enterprise data. Cortex Agents orchestrate multi-step tasks. Feature Store is GA for MLOps.',
      },
      {
        category: 'ai-agents',
        description:
          'Snowflake Intelligence enables natural language queries across structured/unstructured data. Cortex Code is an AI coding agent for data engineering and ML.',
      },
    ],
  },
  {
    name: 'Datadog',
    protocol: 'datadog',
    website: 'https://datadoghq.com',
    is_public: true, // DDOG
    categories: [
      {
        category: 'data-infrastructure',
        description:
          'LLM Observability provides end-to-end tracing for AI agents with latency, token usage, and error tracking. Named Leader in Forrester AIOps Platforms Q2 2025.',
      },
      {
        category: 'ai-agents',
        description:
          'AI Agent Monitoring, LLM Experiments, and AI Agents Console provide visibility into agentic AI. Charlotte Agentic SOAR orchestrates AI-powered security workflows.',
      },
    ],
  },
  {
    name: 'Palantir',
    protocol: 'palantir',
    website: 'https://palantir.com',
    is_public: true, // PLTR
    categories: [
      {
        category: 'ai-applications',
        description:
          'AIP (Artificial Intelligence Platform) connects AI to enterprise data and operations. U.S. commercial revenue up 71% YoY, breaking $1B ARR in Q1 2025.',
      },
      {
        category: 'ai-agents',
        description:
          'AIP Agent Studio builds production-ready AI agents on the Ontology. Walgreens deployed AI workflows to 4,000 stores in 8 months. AIG accelerates underwriting 5X.',
      },
    ],
  },

  // ============ VERTICAL AI (SECURITY) ============
  {
    name: 'CrowdStrike',
    protocol: 'crowdstrike',
    website: 'https://crowdstrike.com',
    is_public: true, // CRWD
    categories: [
      {
        category: 'vertical-ai',
        description:
          'Charlotte AI is an agentic security analyst trained on elite CrowdStrike threat hunters. FedRAMP High authorized. Powers autonomous threat detection and response.',
      },
      {
        category: 'ai-agents',
        description:
          'Charlotte Agentic SOAR orchestrates AI agents across the security lifecycle. AgentWorks is a no-code platform to build custom security agents. 7 new mission-ready AI agents launched in Fall 2025.',
      },
    ],
  },

  // ============ ENERGY & DATACENTERS ============
  {
    name: 'Constellation Energy',
    protocol: 'constellation-energy',
    website: 'https://constellationenergy.com',
    is_public: true, // CEG
    categories: [
      {
        category: 'energy-datacenters',
        description:
          'Largest U.S. nuclear fleet with 24/7 baseload for AI data centers. Restarting Three Mile Island for Microsoft (835 MW, 20-year PPA). $26.6B Calpine acquisition adds 55 GW total capacity.',
      },
    ],
  },
  {
    name: 'Vistra',
    protocol: 'vistra',
    website: 'https://vistracorp.com',
    is_public: true, // VST
    categories: [
      {
        category: 'energy-datacenters',
        description:
          'Nuclear plants powering AI data centers. Meta deal for 2.1+ GW from Ohio and Pennsylvania nuclear plants. 695% stock price increase since 2021. 95% of 2025 generation hedged.',
      },
    ],
  },
  {
    name: 'NextEra Energy',
    protocol: 'nextera-energy',
    website: 'https://nexteraenergy.com',
    is_public: true, // NEE
    categories: [
      {
        category: 'energy-datacenters',
        description:
          'World\'s largest renewable energy company. Restarting Duane Arnold nuclear plant for Google (615 MW, 25-year deal). 2.5+ GW clean energy contracts with Meta across 11 PPAs.',
      },
    ],
  },
  {
    name: 'Dominion Energy',
    protocol: 'dominion-energy',
    website: 'https://dominionenergy.com',
    is_public: true, // D
    categories: [
      {
        category: 'energy-datacenters',
        description:
          '47.1 GW of data center contracted capacity. Amazon partnership for 5 GW nuclear including 300 MW SMR near North Anna. 50+ substations under construction for data centers alone.',
      },
    ],
  },
  {
    name: 'Southern Company',
    protocol: 'southern-company',
    website: 'https://southerncompany.com',
    is_public: true, // SO
    categories: [
      {
        category: 'energy-datacenters',
        description:
          'Vogtle nuclear units now fully operational. $81B five-year capex plan (2026-2030). 8 GW large load contracts with 50+ GW pipeline. 8% annual sales growth forecast through 2029.',
      },
    ],
  },
  {
    name: 'EQT Corporation',
    protocol: 'eqt',
    website: 'https://eqt.com',
    is_public: true, // EQT
    categories: [
      {
        category: 'energy-datacenters',
        description:
          'Largest U.S. natural gas producer. Exclusive supplier for Homer City 4.4 GW AI data center campus - one of largest single-site gas purchases in North American history (665K MMBtu/day).',
      },
    ],
  },
  {
    name: 'Kinder Morgan',
    protocol: 'kinder-morgan',
    website: 'https://kindermorgan.com',
    is_public: true, // KMI
    categories: [
      {
        category: 'energy-datacenters',
        description:
          'Largest U.S. natural gas transmission network (66K miles, 40% of U.S. gas). Project backlog surged from $1.4B to $9.3B for data center power. $3.5B Copper State Connector for Arizona AI clusters.',
      },
    ],
  },
  {
    name: 'Cameco',
    protocol: 'cameco',
    website: 'https://cameco.com',
    is_public: true, // CCJ
    categories: [
      {
        category: 'energy-datacenters',
        description:
          'World\'s largest uranium producer with 230M lbs under long-term contracts. 49% stake in Westinghouse. Part of $80B U.S. government nuclear partnership for AI-era power infrastructure.',
      },
    ],
  },
]

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const dryRun = searchParams.get('dryRun') === 'true'

  const results: Array<{
    company: string
    status: 'success' | 'skipped' | 'error' | 'dry-run'
    categories: string[]
    error?: string
  }> = []

  for (const company of COMPANIES) {
    if (dryRun) {
      results.push({
        company: company.name,
        status: 'dry-run',
        categories: company.categories.map((c) => c.category),
      })
      continue
    }

    try {
      // Check if protocol already exists
      const { data: existing } = await supabaseAdmin
        .from(TABLES.protocols_metadata)
        .select('protocol')
        .eq('protocol', company.protocol)
        .single()

      const insertedCategories: string[] = []

      if (existing) {
        // Add new categories only
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
    dryRun,
    summary: { companies: successful, skipped, failed, totalCategoryEntries: totalCategories },
    results,
  })
}
