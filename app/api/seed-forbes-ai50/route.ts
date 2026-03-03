import { NextResponse } from 'next/server'
import { supabaseAdmin, TABLES } from '@/lib/supabase'

interface CompanyEntry {
  name: string
  protocol: string
  website: string
  categories: Array<{
    category: string
    description: string
  }>
}

const FORBES_AI50: CompanyEntry[] = [
  {
    name: 'Abridge',
    protocol: 'abridge',
    website: 'https://abridge.com',
    categories: [
      { category: 'vertical-ai', description: 'AI notetaker that automatically generates clinical documentation for doctors, reducing administrative burden in healthcare settings.' },
      { category: 'ai-applications', description: 'End-user medical documentation app that transcribes and summarizes patient-doctor conversations in real-time.' },
    ],
  },
  {
    name: 'Anthropic',
    protocol: 'anthropic',
    website: 'https://anthropic.com',
    categories: [
      { category: 'foundation-models', description: 'Creator of Claude, a family of large language models known for safety, helpfulness, and advanced reasoning capabilities.' },
      { category: 'fine-tuning-training', description: 'Develops constitutional AI training methods and RLHF techniques for building safer, more aligned AI systems.' },
    ],
  },
  {
    name: 'Anysphere',
    protocol: 'anysphere',
    website: 'https://cursor.com',
    categories: [
      { category: 'ai-applications', description: 'Builds Cursor, an AI-powered code editor that enables developers to write and edit code using natural language instructions.' },
      { category: 'ai-agents', description: 'Cursor\'s AI can autonomously navigate codebases, make multi-file edits, and execute complex refactoring tasks.' },
    ],
  },
  {
    name: 'Baseten',
    protocol: 'baseten',
    website: 'https://baseten.co',
    categories: [
      { category: 'inference', description: 'Model deployment platform that enables fast, scalable inference for ML models with optimized GPU utilization.' },
      { category: 'cloud-compute', description: 'Provides serverless infrastructure for deploying and scaling AI applications in production environments.' },
    ],
  },
  {
    name: 'Captions',
    protocol: 'captions',
    website: 'https://captions.ai',
    categories: [
      { category: 'ai-applications', description: 'AI-powered video editor that automatically generates captions, translations, and visual effects for content creators.' },
    ],
  },
  {
    name: 'Clay',
    protocol: 'clay',
    website: 'https://clay.com',
    categories: [
      { category: 'ai-applications', description: 'AI-powered go-to-market platform that automates data enrichment, lead scoring, and outreach personalization for sales teams.' },
      { category: 'vertical-ai', description: 'Purpose-built for sales and marketing teams, integrating 100+ data sources for comprehensive prospect intelligence.' },
    ],
  },
  {
    name: 'Coactive AI',
    protocol: 'coactive-ai',
    website: 'https://coactive.ai',
    categories: [
      { category: 'data-infrastructure', description: 'Visual data labeling platform that helps enterprises organize, search, and analyze unstructured image and video data at scale.' },
    ],
  },
  {
    name: 'Cohere',
    protocol: 'cohere',
    website: 'https://cohere.com',
    categories: [
      { category: 'foundation-models', description: 'Enterprise-focused LLM provider offering Command, Embed, and Rerank models optimized for business applications and RAG.' },
      { category: 'fine-tuning-training', description: 'Provides model customization and fine-tuning capabilities for enterprises to adapt models to domain-specific use cases.' },
    ],
  },
  {
    name: 'Crusoe',
    protocol: 'crusoe',
    website: 'https://crusoe.ai',
    categories: [
      { category: 'cloud-compute', description: 'AI cloud infrastructure provider offering GPU clusters for training and inference at competitive prices.' },
      { category: 'energy-datacenters', description: 'Operates data centers powered by stranded natural gas and renewable energy, reducing the carbon footprint of AI compute.' },
    ],
  },
  {
    name: 'Databricks',
    protocol: 'databricks',
    website: 'https://databricks.com',
    categories: [
      { category: 'data-infrastructure', description: 'Unified data analytics platform combining data warehousing, ETL, and machine learning on a lakehouse architecture.' },
      { category: 'fine-tuning-training', description: 'Mosaic ML integration enables enterprise model training and fine-tuning with MLflow for experiment tracking.' },
    ],
  },
  {
    name: 'Decagon',
    protocol: 'decagon',
    website: 'https://decagon.ai',
    categories: [
      { category: 'ai-agents', description: 'Builds AI agents that autonomously handle customer support tickets, resolving issues end-to-end without human intervention.' },
      { category: 'vertical-ai', description: 'Enterprise customer service platform that integrates with existing support tools to automate ticket resolution.' },
    ],
  },
  {
    name: 'DeepL',
    protocol: 'deepl',
    website: 'https://deepl.com',
    categories: [
      { category: 'ai-applications', description: 'AI-powered translation service known for producing more natural, nuanced translations than competitors across 30+ languages.' },
      { category: 'foundation-models', description: 'Develops proprietary neural machine translation models trained specifically for high-quality language translation.' },
    ],
  },
  {
    name: 'ElevenLabs',
    protocol: 'elevenlabs',
    website: 'https://elevenlabs.io',
    categories: [
      { category: 'ai-applications', description: 'Voice AI platform offering realistic text-to-speech, voice cloning, and dubbing across 29 languages for content creators.' },
      { category: 'foundation-models', description: 'Develops proprietary voice synthesis models capable of capturing emotion, tone, and speaking style with high fidelity.' },
    ],
  },
  {
    name: 'Figure AI',
    protocol: 'figure-ai',
    website: 'https://figure.ai',
    categories: [
      { category: 'ai-applications', description: 'Develops Figure 01 and Figure 02 humanoid robots designed for manufacturing, logistics, and warehouse automation.' },
      { category: 'chips-hardware', description: 'Builds physical AI systems combining advanced robotics hardware with foundation models for real-world task execution.' },
    ],
  },
  {
    name: 'Fireworks AI',
    protocol: 'fireworks-ai',
    website: 'https://fireworks.ai',
    categories: [
      { category: 'inference', description: 'Fast inference platform delivering sub-second response times for LLMs through optimized serving infrastructure.' },
      { category: 'fine-tuning-training', description: 'Offers model fine-tuning and optimization services to improve performance and reduce inference costs.' },
    ],
  },
  {
    name: 'Glean',
    protocol: 'glean',
    website: 'https://glean.com',
    categories: [
      { category: 'ai-applications', description: 'Enterprise AI search platform that unifies company knowledge across 100+ apps including Slack, Google Drive, and Confluence.' },
      { category: 'vector-dbs-rag', description: 'Uses retrieval-augmented generation to provide accurate, sourced answers from enterprise documents and data.' },
    ],
  },
  {
    name: 'Harvey',
    protocol: 'harvey',
    website: 'https://harvey.ai',
    categories: [
      { category: 'vertical-ai', description: 'Legal AI platform handling document review, case analysis, contract negotiation, and regulatory compliance for law firms.' },
      { category: 'ai-agents', description: 'Deploys AI agents that autonomously manage legal workflows from research through document drafting and review.' },
    ],
  },
  {
    name: 'Hebbia',
    protocol: 'hebbia',
    website: 'https://hebbia.ai',
    categories: [
      { category: 'vertical-ai', description: 'AI platform for finance and legal professionals to analyze thousands of documents and extract insights for due diligence.' },
      { category: 'vector-dbs-rag', description: 'Matrix product enables complex multi-document analysis and reasoning across large document sets with citations.' },
    ],
  },
  {
    name: 'Hugging Face',
    protocol: 'hugging-face',
    website: 'https://huggingface.co',
    categories: [
      { category: 'fine-tuning-training', description: 'The GitHub of machine learning, hosting 500K+ models and providing tools for training, fine-tuning, and deploying AI.' },
      { category: 'foundation-models', description: 'Distributes open-source models including Llama, Mistral, and thousands of community-trained models via the Hub.' },
      { category: 'data-infrastructure', description: 'Hosts 100K+ datasets and provides tools for data processing, versioning, and collaboration.' },
    ],
  },
  {
    name: 'Lambda',
    protocol: 'lambda',
    website: 'https://lambdalabs.com',
    categories: [
      { category: 'cloud-compute', description: 'GPU cloud provider offering on-demand NVIDIA H100 and A100 clusters for AI training and inference workloads.' },
    ],
  },
  {
    name: 'LangChain',
    protocol: 'langchain',
    website: 'https://langchain.com',
    categories: [
      { category: 'ai-agents', description: 'Open-source framework for building LLM applications with tools, memory, and agent capabilities via LangGraph.' },
      { category: 'vector-dbs-rag', description: 'Provides abstractions for building RAG pipelines with support for 50+ vector stores and retrieval strategies.' },
    ],
  },
  {
    name: 'Luminance',
    protocol: 'luminance',
    website: 'https://luminance.com',
    categories: [
      { category: 'vertical-ai', description: 'AI platform for legal teams that automates contract review, negotiation, and lifecycle management.' },
      { category: 'ai-agents', description: 'Autopilot feature autonomously reviews, redlines, and negotiates contracts based on company playbooks.' },
    ],
  },
  {
    name: 'Mercor',
    protocol: 'mercor',
    website: 'https://mercor.com',
    categories: [
      { category: 'vertical-ai', description: 'AI-powered hiring platform that screens, interviews, and matches candidates to roles using automated assessments.' },
      { category: 'ai-applications', description: 'End-to-end recruiting tool that handles job posting, candidate sourcing, and interview scheduling autonomously.' },
    ],
  },
  {
    name: 'Midjourney',
    protocol: 'midjourney',
    website: 'https://midjourney.com',
    categories: [
      { category: 'ai-applications', description: 'Leading AI image generation service creating photorealistic and artistic images from text prompts via Discord.' },
      { category: 'foundation-models', description: 'Develops proprietary diffusion models known for exceptional aesthetic quality and artistic style control.' },
    ],
  },
  {
    name: 'Mistral AI',
    protocol: 'mistral-ai',
    website: 'https://mistral.ai',
    categories: [
      { category: 'foundation-models', description: 'European AI lab developing open-weight LLMs including Mistral 7B, Mixtral, and Mistral Large competing with GPT-4.' },
    ],
  },
  {
    name: 'Notion',
    protocol: 'notion',
    website: 'https://notion.so',
    categories: [
      { category: 'ai-applications', description: 'Productivity platform with Notion AI that helps users write, summarize, and organize information across workspaces.' },
      { category: 'ai-agents', description: 'AI assistant that can search across workspace content, answer questions, and automate document creation.' },
    ],
  },
  {
    name: 'OpenEvidence',
    protocol: 'openevidence',
    website: 'https://openevidence.com',
    categories: [
      { category: 'vertical-ai', description: 'AI search platform for physicians that summarizes medical literature and provides evidence-based clinical answers.' },
      { category: 'ai-applications', description: 'ChatGPT-style interface trained on medical research to help doctors make informed treatment decisions.' },
    ],
  },
  {
    name: 'Perplexity AI',
    protocol: 'perplexity-ai',
    website: 'https://perplexity.ai',
    categories: [
      { category: 'ai-applications', description: 'AI-powered search engine that provides direct answers with citations, combining LLMs with real-time web search.' },
      { category: 'vector-dbs-rag', description: 'Uses retrieval-augmented generation to ground responses in current web content with source attribution.' },
    ],
  },
  {
    name: 'Photoroom',
    protocol: 'photoroom',
    website: 'https://photoroom.com',
    categories: [
      { category: 'ai-applications', description: 'AI photo editing app that automatically removes backgrounds, generates product photos, and creates marketing visuals.' },
    ],
  },
  {
    name: 'Pika',
    protocol: 'pika',
    website: 'https://pika.art',
    categories: [
      { category: 'ai-applications', description: 'AI video generation platform that creates and edits videos from text prompts or images with cinematic quality.' },
      { category: 'foundation-models', description: 'Develops video generation models capable of creating coherent motion and visual effects from text descriptions.' },
    ],
  },
  {
    name: 'Runway',
    protocol: 'runway',
    website: 'https://runwayml.com',
    categories: [
      { category: 'ai-applications', description: 'Creative AI suite offering Gen-3 video generation, image editing, and visual effects tools for filmmakers and artists.' },
      { category: 'foundation-models', description: 'Develops Gen-1, Gen-2, and Gen-3 video generation models pushing the frontier of AI-generated video quality.' },
    ],
  },
  {
    name: 'Sakana AI',
    protocol: 'sakana-ai',
    website: 'https://sakana.ai',
    categories: [
      { category: 'foundation-models', description: 'Tokyo-based AI lab developing nature-inspired foundation models for scientific research and discovery.' },
      { category: 'vertical-ai', description: 'Focuses on AI models for science applications including materials discovery and biological research.' },
    ],
  },
  {
    name: 'SambaNova',
    protocol: 'sambanova',
    website: 'https://sambanova.ai',
    categories: [
      { category: 'chips-hardware', description: 'Develops Reconfigurable Dataflow Architecture (RDA) chips optimized for AI training and inference workloads.' },
      { category: 'inference', description: 'SambaNova Suite provides full-stack AI platform with custom silicon for enterprise model deployment.' },
    ],
  },
  {
    name: 'Scale AI',
    protocol: 'scale-ai',
    website: 'https://scale.com',
    categories: [
      { category: 'data-infrastructure', description: 'Leading data labeling platform providing human-annotated training data for AI models across industries.' },
      { category: 'fine-tuning-training', description: 'Offers RLHF services, red teaming, and evaluation infrastructure for improving model quality and safety.' },
    ],
  },
  {
    name: 'Sierra',
    protocol: 'sierra',
    website: 'https://sierra.ai',
    categories: [
      { category: 'ai-agents', description: 'Enterprise customer service platform deploying AI agents that handle support conversations end-to-end.' },
      { category: 'vertical-ai', description: 'Founded by Bret Taylor, builds conversational AI specifically for customer experience automation.' },
    ],
  },
  {
    name: 'Skild AI',
    protocol: 'skild-ai',
    website: 'https://skild.ai',
    categories: [
      { category: 'foundation-models', description: 'Develops foundation models for robotics that enable general-purpose physical task learning and execution.' },
      { category: 'ai-applications', description: 'Creates AI systems for robots that can adapt to new environments and tasks without specific training.' },
    ],
  },
  {
    name: 'Snorkel AI',
    protocol: 'snorkel-ai',
    website: 'https://snorkel.ai',
    categories: [
      { category: 'data-infrastructure', description: 'Programmatic data labeling platform that uses weak supervision to create training datasets without manual annotation.' },
      { category: 'fine-tuning-training', description: 'Enables enterprises to rapidly build and iterate on AI models using data-centric development approaches.' },
    ],
  },
  {
    name: 'Speak',
    protocol: 'speak',
    website: 'https://speak.com',
    categories: [
      { category: 'ai-applications', description: 'AI language learning app with 10M+ users that provides conversational practice and personalized tutoring.' },
      { category: 'vertical-ai', description: 'Education-focused AI that adapts to individual learning styles for English and Spanish language acquisition.' },
    ],
  },
  {
    name: 'StackBlitz',
    protocol: 'stackblitz',
    website: 'https://stackblitz.com',
    categories: [
      { category: 'ai-applications', description: 'Browser-based development environment with Bolt AI that generates full-stack web applications from prompts.' },
      { category: 'ai-agents', description: 'Bolt can autonomously create, debug, and deploy web applications directly in the browser.' },
    ],
  },
  {
    name: 'Suno',
    protocol: 'suno',
    website: 'https://suno.com',
    categories: [
      { category: 'ai-applications', description: 'AI music generation platform that creates original songs with vocals, instruments, and lyrics from text prompts.' },
      { category: 'foundation-models', description: 'Develops audio generation models capable of producing full-length, multi-instrument musical compositions.' },
    ],
  },
  {
    name: 'Synthesia',
    protocol: 'synthesia',
    website: 'https://synthesia.io',
    categories: [
      { category: 'ai-applications', description: 'AI video generation platform creating professional videos with digital avatars for training, marketing, and communications.' },
      { category: 'vertical-ai', description: 'Enterprise-focused tool used by Fortune 500 companies for scalable video content production.' },
    ],
  },
  {
    name: 'Thinking Machines Labs',
    protocol: 'thinking-machines-labs',
    website: 'https://thinkingmachines.ai',
    categories: [
      { category: 'foundation-models', description: 'AI research company founded by former OpenAI researchers focused on developing next-generation AI systems.' },
    ],
  },
  {
    name: 'Together AI',
    protocol: 'together-ai',
    website: 'https://together.ai',
    categories: [
      { category: 'cloud-compute', description: 'AI cloud platform providing infrastructure for training and deploying open-source models at scale.' },
      { category: 'inference', description: 'Offers fast inference APIs for 100+ open-source models including Llama, Mistral, and custom fine-tuned models.' },
      { category: 'fine-tuning-training', description: 'Enables custom model training and fine-tuning on dedicated GPU clusters with full reproducibility.' },
    ],
  },
  {
    name: 'Vannevar Labs',
    protocol: 'vannevar-labs',
    website: 'https://vannevarlabs.com',
    categories: [
      { category: 'vertical-ai', description: 'Defense and national security AI platform providing intelligence analysis and decision support for government agencies.' },
    ],
  },
  {
    name: 'VAST Data',
    protocol: 'vast-data',
    website: 'https://vastdata.com',
    categories: [
      { category: 'data-infrastructure', description: 'AI data platform providing high-performance storage infrastructure optimized for training and inference workloads.' },
      { category: 'cloud-compute', description: 'VAST DataSpace enables unified data management across on-prem and cloud AI infrastructure.' },
    ],
  },
  {
    name: 'Windsurf',
    protocol: 'windsurf',
    website: 'https://codeium.com/windsurf',
    categories: [
      { category: 'ai-applications', description: 'AI-powered code editor (formerly Codeium) offering intelligent autocomplete, code generation, and refactoring.' },
      { category: 'ai-agents', description: 'Cascade feature enables agentic coding with multi-file edits and autonomous problem-solving capabilities.' },
    ],
  },
  {
    name: 'World Labs',
    protocol: 'world-labs',
    website: 'https://worldlabs.ai',
    categories: [
      { category: 'foundation-models', description: 'Founded by Fei-Fei Li, develops Large World Models for spatial intelligence and 3D world understanding.' },
      { category: 'ai-applications', description: 'Generates explorable 3D environments from images for simulations, gaming, and virtual experiences.' },
    ],
  },
  {
    name: 'Writer',
    protocol: 'writer',
    website: 'https://writer.com',
    categories: [
      { category: 'ai-applications', description: 'Enterprise AI platform for content generation, helping teams create on-brand marketing copy and documents.' },
      { category: 'fine-tuning-training', description: 'Trains proprietary Palmyra models customized to each enterprise\'s brand voice and compliance requirements.' },
    ],
  },
  {
    name: 'xAI',
    protocol: 'xai',
    website: 'https://x.ai',
    categories: [
      { category: 'foundation-models', description: 'Elon Musk\'s AI company developing Grok, a large language model integrated with X (Twitter) for real-time information.' },
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

  for (const company of FORBES_AI50) {
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
          logo: null, // Will need to be added later
          website: company.website,
          twitter: null,
          artemisProjectPage: null,
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
