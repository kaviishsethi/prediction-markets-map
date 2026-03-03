import { NextResponse } from 'next/server'
import { supabaseAdmin, TABLES } from '@/lib/supabase'

interface CompanyEntry {
  name: string
  protocol: string
  website: string
  logo: string
  twitter?: string
  categories: Array<{
    category: string
    description: string
  }>
}

const COMPANIES: CompanyEntry[] = [
  // 1. OpenAI - Foundation model leader
  {
    name: 'OpenAI',
    protocol: 'openai',
    website: 'https://openai.com',
    logo: 'https://pbs.twimg.com/profile_images/1634058036934500352/b4F1eVpJ_400x400.jpg',
    twitter: 'OpenAI',
    categories: [
      {
        category: 'foundation-models',
        description: 'Creator of GPT-4, GPT-4o, and the GPT series of large language models that set industry benchmarks for conversational AI and reasoning capabilities.',
      },
      {
        category: 'ai-applications',
        description: 'Builds ChatGPT, the leading AI assistant used by hundreds of millions, and DALL-E for AI image generation.',
      },
      {
        category: 'ai-agents',
        description: 'Pioneered custom GPTs and the Assistants API, enabling developers to build autonomous agents with tool use, code execution, and retrieval capabilities.',
      },
      {
        category: 'fine-tuning-training',
        description: 'Offers fine-tuning APIs allowing enterprises to customize GPT models on proprietary data for specialized applications.',
      },
    ],
  },

  // 2. Google DeepMind - Research powerhouse
  {
    name: 'Google DeepMind',
    protocol: 'google-deepmind',
    website: 'https://deepmind.google',
    logo: 'https://pbs.twimg.com/profile_images/1754036299516375040/hleZGEOC_400x400.jpg',
    twitter: 'GoogleDeepMind',
    categories: [
      {
        category: 'foundation-models',
        description: 'Develops Gemini, Google\'s most capable multimodal AI model family, competing directly with GPT-4 across text, image, audio, and video understanding.',
      },
      {
        category: 'ai-applications',
        description: 'Powers Google\'s Gemini chat interface and integrates AI capabilities across Google Workspace, Search, and consumer products.',
      },
      {
        category: 'vertical-ai',
        description: 'Created AlphaFold for protein structure prediction revolutionizing drug discovery, and develops specialized AI for robotics and scientific research.',
      },
    ],
  },

  // 3. NVIDIA - Hardware and software platform
  {
    name: 'NVIDIA',
    protocol: 'nvidia',
    website: 'https://nvidia.com',
    logo: 'https://pbs.twimg.com/profile_images/1879293312/nvlogo_400x400.png',
    twitter: 'nvidia',
    categories: [
      {
        category: 'chips-hardware',
        description: 'Designs and manufactures the H100, A100, and upcoming Blackwell GPUs that power the vast majority of AI training and inference workloads globally.',
      },
      {
        category: 'inference',
        description: 'Provides TensorRT and Triton Inference Server for optimized model deployment, enabling 10-100x speedups in production AI serving.',
      },
      {
        category: 'cloud-compute',
        description: 'Offers NVIDIA AI Enterprise platform and DGX Cloud, providing end-to-end infrastructure for building and deploying AI applications.',
      },
      {
        category: 'fine-tuning-training',
        description: 'NVIDIA NeMo framework enables enterprise-grade LLM customization, training, and alignment with guardrails for safe deployment.',
      },
    ],
  },

  // 4. Microsoft Azure AI - Enterprise cloud AI
  {
    name: 'Microsoft Azure AI',
    protocol: 'microsoft-azure-ai',
    website: 'https://azure.microsoft.com/en-us/solutions/ai',
    logo: 'https://pbs.twimg.com/profile_images/1718220737126760448/B9XwT5wa_400x400.jpg',
    twitter: 'Microsoft',
    categories: [
      {
        category: 'cloud-compute',
        description: 'Azure provides enterprise-grade GPU infrastructure and AI services, deeply integrated with OpenAI models for scalable cloud AI deployments.',
      },
      {
        category: 'ai-applications',
        description: 'Microsoft Copilot brings AI assistance to Office 365, Windows, GitHub, and Dynamics 365, reaching billions of enterprise users.',
      },
      {
        category: 'ai-agents',
        description: 'Copilot Studio enables low-code development of enterprise AI agents with built-in governance, security, and compliance controls.',
      },
      {
        category: 'fine-tuning-training',
        description: 'Azure Machine Learning provides comprehensive MLOps pipelines for model training, fine-tuning, and deployment at enterprise scale.',
      },
    ],
  },

  // 5. DataRobot - AutoML platform
  {
    name: 'DataRobot',
    protocol: 'datarobot',
    website: 'https://datarobot.com',
    logo: 'https://pbs.twimg.com/profile_images/1461013610004312068/a8C-mFgP_400x400.png',
    twitter: 'DataRobot',
    categories: [
      {
        category: 'fine-tuning-training',
        description: 'Industry-leading AutoML platform that automates model selection, feature engineering, and hyperparameter tuning, reducing ML development time from months to days.',
      },
      {
        category: 'data-infrastructure',
        description: 'Provides end-to-end data preparation, model monitoring, and MLOps capabilities for production AI systems with automated drift detection.',
      },
      {
        category: 'ai-agents',
        description: 'Recent integrations with LLM orchestration and vector databases enable building agentic workflows on top of traditional ML models.',
      },
    ],
  },

  // 6. Accenture Applied Intelligence - Global consulting
  {
    name: 'Accenture Applied Intelligence',
    protocol: 'accenture',
    website: 'https://accenture.com/us-en/services/applied-intelligence-index',
    logo: 'https://pbs.twimg.com/profile_images/1615411917539white328/0tWjhqj9_400x400.jpg',
    twitter: 'Accenture',
    categories: [
      {
        category: 'vertical-ai',
        description: 'Delivers industry-specific AI transformations across banking, healthcare, retail, and manufacturing with deep domain expertise and change management.',
      },
      {
        category: 'ai-agents',
        description: 'Implements enterprise automation and agentic AI workflows, helping organizations redesign processes around AI-powered decision making.',
      },
      {
        category: 'cloud-compute',
        description: 'Partners with AWS, Azure, and Google Cloud to architect and implement large-scale cloud AI infrastructure for Fortune 500 enterprises.',
      },
    ],
  },

  // 7. TCS AI - Global IT services
  {
    name: 'TCS AI',
    protocol: 'tcs-ai',
    website: 'https://tcs.com/what-we-do/services/tcs-ai',
    logo: 'https://pbs.twimg.com/profile_images/1571422663233155072/eqG1u7m4_400x400.jpg',
    twitter: 'TCS',
    categories: [
      {
        category: 'vertical-ai',
        description: 'Delivers AI solutions purpose-built for healthcare diagnostics, banking fraud detection, retail personalization, and manufacturing optimization at global scale.',
      },
      {
        category: 'ai-applications',
        description: 'TCS ignio is an AI-powered enterprise automation platform that handles IT operations, business processes, and customer service autonomously.',
      },
    ],
  },

  // 8. Cognizant - Engineering-first AI
  {
    name: 'Cognizant',
    protocol: 'cognizant',
    website: 'https://cognizant.com/us/en/services/ai',
    logo: 'https://pbs.twimg.com/profile_images/1400507021787181059/hdcfOZ8w_400x400.jpg',
    twitter: 'Cognizant',
    categories: [
      {
        category: 'vertical-ai',
        description: 'Specializes in AI solutions for heavily regulated industries including healthcare claims processing, insurance underwriting, and financial compliance.',
      },
      {
        category: 'data-infrastructure',
        description: 'Strong focus on data governance, legacy system integration, and operational readiness that moves AI projects from pilots to production.',
      },
    ],
  },

  // 9. EPAM Systems - Technical depth
  {
    name: 'EPAM Systems',
    protocol: 'epam',
    website: 'https://epam.com/services/artificial-intelligence',
    logo: 'https://pbs.twimg.com/profile_images/1477330761023442944/lCvAgmUj_400x400.jpg',
    twitter: 'EPABORRAR',
    categories: [
      {
        category: 'data-infrastructure',
        description: 'Deep expertise in building custom data pipelines, optimizing vector databases, and developing middleware for complex AI system integrations.',
      },
      {
        category: 'vector-dbs-rag',
        description: 'Specializes in vector database optimization and retrieval-augmented generation architectures for enterprise knowledge management systems.',
      },
      {
        category: 'fine-tuning-training',
        description: 'Conducts specialized research into model architectures and provides engineering-focused fine-tuning services for performance-critical applications.',
      },
    ],
  },

  // 10. Suffescom Solutions - Full-service AI development
  {
    name: 'Suffescom Solutions',
    protocol: 'suffescom',
    website: 'https://suffescom.com',
    logo: 'https://pbs.twimg.com/profile_images/1461978627843502084/cATL4E8T_400x400.jpg',
    twitter: 'suffaborrar',
    categories: [
      {
        category: 'vertical-ai',
        description: 'Delivers end-to-end AI solutions across healthcare, finance, e-commerce, manufacturing, and logistics with deep industry-specific expertise.',
      },
      {
        category: 'ai-agents',
        description: 'Builds agentic AI workflows using LangChain and custom frameworks, enabling autonomous multi-step task execution for enterprise clients.',
      },
      {
        category: 'ai-applications',
        description: 'Develops custom LLM applications and conversational AI using DialogFlow, GPT, and Claude for customer-facing chatbots and internal tools.',
      },
    ],
  },

  // 11. SumatoSoft - Industry-focused custom solutions
  {
    name: 'SumatoSoft',
    protocol: 'sumatosoft',
    website: 'https://sumatosoft.com',
    logo: 'https://pbs.twimg.com/profile_images/1536263692553707520/LqN9eEq__400x400.jpg',
    twitter: 'SumatoSoft',
    categories: [
      {
        category: 'vertical-ai',
        description: 'Serves 11 industries including e-commerce, banking, healthcare, and education with custom AI solutions built using AutoML, PyTorch, and TensorFlow.',
      },
      {
        category: 'data-infrastructure',
        description: 'Provides big data analysis and machine learning pipeline development for organizations processing large-scale datasets.',
      },
      {
        category: 'fine-tuning-training',
        description: 'Builds custom ML models using PyTorch, TensorFlow, and AutoML platforms, delivering effective solutions within budget constraints.',
      },
    ],
  },

  // 12. DataRoot Labs - Research-driven development
  {
    name: 'DataRoot Labs',
    protocol: 'dataroot-labs',
    website: 'https://datarootlabs.com',
    logo: 'https://pbs.twimg.com/profile_images/1372858879247888386/tHSfNaAE_400x400.jpg',
    twitter: 'DataRootLabs',
    categories: [
      {
        category: 'fine-tuning-training',
        description: 'Research-driven AI development firm specializing in AI MVPs and scalable model architectures, combining academic rigor with practical implementation.',
      },
      {
        category: 'ai-applications',
        description: 'Develops AI products from concept to production for startups and enterprises, with expertise in emerging AI techniques and novel approaches.',
      },
    ],
  },

  // 13. Quickway Infosystems - Future-ready solutions
  {
    name: 'Quickway Infosystems',
    protocol: 'quickway',
    website: 'https://quickwayinfosystems.com',
    logo: 'https://pbs.twimg.com/profile_images/1479079478516875267/OZZy0kUQ_400x400.jpg',
    twitter: 'QuickwayInfo',
    categories: [
      {
        category: 'ai-applications',
        description: 'Builds AI chatbots, predictive analytics dashboards, and automation tools using advanced LLMs and generative AI for enterprise clients.',
      },
      {
        category: 'vertical-ai',
        description: 'Delivers AI solutions for healthcare diagnostics, financial forecasting, e-commerce personalization, and logistics optimization.',
      },
      {
        category: 'ai-agents',
        description: 'Develops AI automation systems and edge-AI applications that enable autonomous decision-making in production environments.',
      },
    ],
  },

  // 14. Innovacio Technologies - Enterprise AI at scale
  {
    name: 'Innovacio Technologies',
    protocol: 'innovacio',
    website: 'https://innovacio.io',
    logo: 'https://pbs.twimg.com/profile_images/1438793857654775809/Ow3P8QPB_400x400.jpg',
    twitter: 'innovaborrar',
    categories: [
      {
        category: 'vertical-ai',
        description: 'Trusted by Coca-Cola, Bajaj, Haldiram\'s, and Lacoste for operationalizing AI at scale across consumer goods, automotive, and retail industries.',
      },
      {
        category: 'ai-applications',
        description: 'Delivers production-grade AI applications that move reliably from concept to deployment for established enterprise brands.',
      },
    ],
  },

  // 15. Entrans - Enterprise agent integration
  {
    name: 'Entrans',
    protocol: 'entrans',
    website: 'https://entrans.ai',
    logo: 'https://pbs.twimg.com/profile_images/1706666115568386048/f2Aaborrar0j_400x400.jpg',
    twitter: 'entransai',
    categories: [
      {
        category: 'ai-agents',
        description: 'Specializes in integrating AI agents into enterprise legacy systems with focus on security constraints, governance requirements, and reliability testing.',
      },
      {
        category: 'vertical-ai',
        description: 'Provides AI-first solutions for enterprises with complex existing infrastructure, navigating integration challenges across regulated industries.',
      },
      {
        category: 'data-infrastructure',
        description: 'Engineering-led approach to connecting AI systems with legacy data sources while respecting security and compliance requirements.',
      },
    ],
  },
]

export async function POST() {
  const results: Array<{
    company: string
    status: 'success' | 'error'
    categories: string[]
    error?: string
  }> = []

  for (const company of COMPANIES) {
    try {
      // Check if protocol already exists
      const { data: existing } = await supabaseAdmin
        .from(TABLES.protocols_metadata)
        .select('protocol')
        .eq('protocol', company.protocol)
        .single()

      if (!existing) {
        // Insert protocol metadata
        const { error: metaError } = await supabaseAdmin
          .from(TABLES.protocols_metadata)
          .insert({
            protocol: company.protocol,
            name: company.name,
            description: company.categories[0]?.description || null,
            logo: company.logo,
            website: company.website,
            twitter: company.twitter || null,
            artemisProjectPage: null,
          })

        if (metaError) throw metaError
      }

      // Insert protocol-category relationships
      const insertedCategories: string[] = []
      for (const cat of company.categories) {
        // Check if already exists
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
              twitter: company.twitter || null,
            })

          if (catError) throw catError
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
  const failed = results.filter((r) => r.status === 'error').length
  const totalCategories = results.reduce((sum, r) => sum + r.categories.length, 0)

  return NextResponse.json({
    success: failed === 0,
    summary: { companies: successful, failed, totalCategoryEntries: totalCategories },
    results,
  })
}
