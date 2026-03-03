// Category definitions for AI Landscape Map
export const CATEGORIES = [
  // Application Layer
  { category: 'consumer-ai', label: 'Consumer', bucket: 'APPLICATION' },
  { category: 'enterprise-ai', label: 'Enterprise', bucket: 'APPLICATION' },
  { category: 'ai-agents', label: 'Agent Platforms/Frameworks', bucket: 'APPLICATION' },
  { category: 'vertical-ai', label: 'Vertical AI', bucket: 'APPLICATION' },
  // Model Layer
  { category: 'foundation-models', label: 'Foundation Models', bucket: 'MODEL' },
  { category: 'post-training', label: 'Post-Training', bucket: 'MODEL' },
  // Data Layer
  { category: 'data-storage-retrieval', label: 'Storage & Retrieval', bucket: 'DATA' },
  { category: 'data-labeling', label: 'Labeling', bucket: 'DATA' },
  { category: 'data-pipelines', label: 'Pipelines', bucket: 'DATA' },
  // Infrastructure Layer
  { category: 'cloud-hosting', label: 'Cloud & Hosting', bucket: 'INFRA' },
  { category: 'inference', label: 'Inference', bucket: 'INFRA' },
  { category: 'chips-hardware', label: 'Chips & Hardware', bucket: 'INFRA' },
  { category: 'energy-datacenters', label: 'Energy & Datacenters', bucket: 'INFRA' },
  // Security Layer
  { category: 'model-security', label: 'Model Security', bucket: 'SECURITY' },
  { category: 'infra-security', label: 'Infrastructure Security', bucket: 'SECURITY' },
  { category: 'ai-governance', label: 'AI Governance', bucket: 'SECURITY' },
]

// Map sheet values (column D) to category slugs
// Add variations here to handle different spellings in the sheet
export const CATEGORY_MAP: Record<string, string> = {
  // Application Layer
  'Consumer': 'consumer-ai',
  'Consumer AI': 'consumer-ai',
  'Enterprise': 'enterprise-ai',
  'Enterprise AI': 'enterprise-ai',
  'AI Agents': 'ai-agents',
  'Agents': 'ai-agents',
  'Agent Platforms/Frameworks': 'ai-agents',
  'Agent Frameworks': 'ai-agents',
  'Agent Platforms': 'ai-agents',
  'Vertical AI': 'vertical-ai',
  'Verticals': 'vertical-ai',
  // Model Layer
  'Foundation Models': 'foundation-models',
  'Models': 'foundation-models',
  'LLMs': 'foundation-models',
  'Post-Training': 'post-training',
  'Post-Training & Fine-tuning': 'post-training',
  'Training & Fine-tuning': 'post-training',
  'Fine-tuning': 'post-training',
  'Inference': 'inference',
  // Data Layer
  'Storage & Retrieval': 'data-storage-retrieval',
  'Storage': 'data-storage-retrieval',
  'Retrieval': 'data-storage-retrieval',
  'Data Storage': 'data-storage-retrieval',
  'Data Retrieval': 'data-storage-retrieval',
  'Vector DBs & RAG': 'data-storage-retrieval',
  'Vector DBs': 'data-storage-retrieval',
  'RAG': 'data-storage-retrieval',
  'Labeling': 'data-labeling',
  'Data Labeling': 'data-labeling',
  'Annotation': 'data-labeling',
  'Pipelines': 'data-pipelines',
  'Data Pipelines': 'data-pipelines',
  'Data Infrastructure': 'data-pipelines',
  'Observability': 'data-pipelines',
  // Infrastructure Layer
  'Cloud & Hosting': 'cloud-hosting',
  'Cloud & Compute': 'cloud-hosting',
  'Cloud': 'cloud-hosting',
  'Hosting': 'cloud-hosting',
  'Inference': 'inference',
  'Chips & Hardware': 'chips-hardware',
  'Chips': 'chips-hardware',
  'Hardware': 'chips-hardware',
  'Energy & Datacenters': 'energy-datacenters',
  'Energy': 'energy-datacenters',
  'Datacenters': 'energy-datacenters',
  // Security Layer
  'Model Security': 'model-security',
  'Model Security & Integrity': 'model-security',
  'MLSecOps': 'model-security',
  'Infrastructure Security': 'infra-security',
  'AI Infrastructure Security': 'infra-security',
  'Cloud Security': 'infra-security',
  'AI Governance': 'ai-governance',
  'AI Governance & Data Privacy': 'ai-governance',
  'Data Privacy': 'ai-governance',
  'LLM Firewall': 'ai-governance',
}

// Category descriptions (shown on hover and in categories sheet)
// Max 220 characters each
export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'consumer-ai':
    'AI products for individual consumers. Includes chatbots, image/video generators, music tools, translation, and AI search. Direct-to-consumer business models with freemium or subscription pricing.',

  'enterprise-ai':
    'AI products sold to businesses via B2B sales. Includes enterprise search, CRM, HR/finance software, sales tools, and vertical solutions. Distinguished by enterprise contracts and team-based pricing.',

  'ai-agents':
    'Tools and platforms for building AI agents. Includes orchestration frameworks (LangChain, LlamaIndex), agent deployment platforms, and agent marketplaces. Pure-play companies focused on the agentic ecosystem.',

  'vertical-ai':
    'Industry-specific AI requiring deep domain expertise. Covers healthcare, legal, financial, and other specialized domains. Combines foundation models with proprietary data and regulatory knowledge.',

  'foundation-models':
    'Companies building large-scale AI models (LLMs, multimodal, vision, audio). Includes frontier labs and open-weight providers. These companies CREATE the models others build upon, via API or open weights.',

  'post-training':
    'Work done after pre-training: RLHF, alignment, instruction tuning, and fine-tuning on proprietary data. Includes MLOps and experiment tracking. Distinct from Foundation Models (pre-training).',

  'data-storage-retrieval':
    'Infrastructure for AI-optimized data storage and retrieval. Includes vector databases, embedding services, semantic search, and RAG. Enables LLMs to access knowledge beyond their training data.',

  'data-labeling':
    'Platforms for creating training datasets via human annotation, synthetic generation, or auto-labeling. Includes annotation tools and RLHF data collection. Critical for supervised learning and alignment.',

  'data-pipelines':
    'Tools for orchestrating and monitoring AI data flows. Includes ML pipeline orchestrators, feature stores, and observability. Handles feature engineering, model monitoring, and drift detection.',

  'cloud-hosting':
    'GPU cloud providers and managed platforms for AI workloads. Includes hyperscalers and GPU specialists. Provides compute capacity (instances, managed K8s) rather than model serving optimization.',

  'inference':
    'Platforms optimizing model serving in production. Includes inference engines, serving platforms, quantization, and edge deployment. Focused on latency, throughput, and cost-per-token efficiency.',

  'chips-hardware':
    'AI accelerator and silicon designers. Includes GPUs, custom AI chips, TPUs, and AI networking. Hardware-first companies where the physical chip or system is the primary product.',

  'energy-datacenters':
    'Power and cooling infrastructure for AI compute. Includes datacenter operators and power generation. AI clusters consume 100+ MW, making this a critical bottleneck for scaling.',

  'model-security':
    'Protecting models from adversarial attacks. Covers prompt injection defense, jailbreak prevention, red-teaming, and model theft protection. Focused on model-layer security and safe behavior.',

  'infra-security':
    'Securing AI infrastructure: cloud posture, training data protection, GPU cluster security. Focused on infrastructure layer (data, compute, network) rather than the model itself.',

  'ai-governance':
    'AI compliance, privacy, and access control. Includes LLM firewalls, access management, audit trails, and regulatory compliance. Focused on policy enforcement, not technical attack prevention.',
}

// Categories to exclude from display (kept in DB for future use)
export const HIDDEN_CATEGORIES = ['vertical-ai', 'ai-applications']

// Layout: define which categories share rows
// Each inner array is one row, categories are displayed left-to-right
export const LAYOUT_ROWS = [
  ['consumer-ai', 'enterprise-ai'],
  ['ai-agents'],
  ['foundation-models'],
  ['post-training'],
  ['data-storage-retrieval', 'data-labeling', 'data-pipelines'],
  ['cloud-hosting', 'inference'],
  ['chips-hardware', 'energy-datacenters'],
  ['model-security', 'infra-security', 'ai-governance'],
]

// Custom ordering within categories (optional)
// Protocols not listed here are sorted by creation date
export const CATEGORY_ORDERING: Record<string, string[]> = {
  'foundation-models': ['openai', 'anthropic', 'google', 'meta'],
  'chips-hardware': ['nvidia', 'amd', 'intel'],
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
