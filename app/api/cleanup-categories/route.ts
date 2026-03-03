import { NextResponse } from 'next/server'
import { supabaseAdmin, TABLES } from '@/lib/supabase'

// Consulting/services firms to remove entirely (no specific products)
const REMOVE_PROTOCOLS = [
  'accenture',
  'cognizant',
  'tcs-ai',
  'epam',
  'entrans',
  'suffescom',
  'sumatosoft',
  'dataroot-labs',
  'quickway',
  'innovacio',
]

// Descriptions to update with specific products
const DESCRIPTION_UPDATES: Array<{
  protocol: string
  category: string
  description: string
}> = [
  // Baseten
  { protocol: 'baseten', category: 'inference', description: 'Baseten platform and Truss open-source framework enable fast, scalable model deployment with optimized GPU utilization and autoscaling.' },
  { protocol: 'baseten', category: 'cloud-compute', description: 'Baseten provides serverless GPU infrastructure for deploying ML models, with built-in monitoring and one-click deployment.' },

  // Captions
  { protocol: 'captions', category: 'ai-applications', description: 'Captions app automatically generates captions, translations, eye contact correction, and visual effects for short-form video creators.' },

  // Clay
  { protocol: 'clay', category: 'ai-applications', description: 'Clay platform automates data enrichment from 100+ sources, AI-powered lead scoring, and personalized outreach sequences for sales teams.' },
  { protocol: 'clay', category: 'vertical-ai', description: 'Clay is purpose-built for go-to-market teams, combining Claygent AI research assistant with waterfall enrichment across data providers.' },

  // Coactive AI
  { protocol: 'coactive-ai', category: 'data-infrastructure', description: 'Coactive platform enables visual data labeling and search across millions of images/videos using natural language queries and custom classifiers.' },

  // Crusoe
  { protocol: 'crusoe', category: 'cloud-compute', description: 'Crusoe Cloud offers NVIDIA H100 and A100 GPU clusters for AI training and inference at 25-40% lower cost than hyperscalers.' },
  { protocol: 'crusoe', category: 'energy-datacenters', description: 'Crusoe data centers run on stranded natural gas and renewable energy, with their Digital Flare Mitigation reducing methane emissions.' },

  // DataRobot - remove weak ai-agents category
  { protocol: 'datarobot', category: 'fine-tuning-training', description: 'DataRobot AutoML platform automates model selection, feature engineering, and hyperparameter tuning across 100+ algorithms.' },
  { protocol: 'datarobot', category: 'data-infrastructure', description: 'DataRobot MLOps provides model monitoring, drift detection, and automated retraining pipelines for production AI systems.' },

  // Decagon
  { protocol: 'decagon', category: 'ai-agents', description: 'Decagon AI agents handle customer support end-to-end, integrating with Zendesk, Intercom, and Salesforce to resolve tickets autonomously.' },
  { protocol: 'decagon', category: 'vertical-ai', description: 'Decagon platform specializes in customer service automation, with AI agents trained on company knowledge bases and support history.' },

  // Fireworks AI
  { protocol: 'fireworks-ai', category: 'inference', description: 'Fireworks AI platform delivers sub-200ms inference for Llama, Mistral, and custom models with their FireAttention optimization engine.' },
  { protocol: 'fireworks-ai', category: 'fine-tuning-training', description: 'Fireworks fine-tuning service enables LoRA and full fine-tuning of open-source models with automatic optimization for inference.' },

  // Mercor
  { protocol: 'mercor', category: 'vertical-ai', description: 'Mercor platform uses AI to screen candidates via automated video interviews, skills assessments, and predictive matching algorithms.' },
  { protocol: 'mercor', category: 'ai-applications', description: 'Mercor Interview AI conducts and evaluates candidate interviews, providing hiring recommendations based on role-specific criteria.' },

  // Notion
  { protocol: 'notion', category: 'ai-applications', description: 'Notion AI assists with writing, summarization, and Q&A directly within Notion docs, databases, and wikis.' },
  { protocol: 'notion', category: 'ai-agents', description: 'Notion AI can search across workspaces, generate content from templates, and automate document creation workflows.' },

  // OpenEvidence
  { protocol: 'openevidence', category: 'vertical-ai', description: 'OpenEvidence search engine provides physicians with AI-summarized answers from medical literature, clinical trials, and guidelines.' },
  { protocol: 'openevidence', category: 'ai-applications', description: 'OpenEvidence app gives doctors a ChatGPT-style interface trained on peer-reviewed medical research with citation links.' },

  // Perplexity
  { protocol: 'perplexity-ai', category: 'ai-applications', description: 'Perplexity search engine provides direct answers with inline citations, powered by their pplx-7b and pplx-70b models.' },
  { protocol: 'perplexity-ai', category: 'vector-dbs-rag', description: 'Perplexity uses real-time web retrieval and RAG to ground responses in current sources, with Pro Search for deeper research.' },

  // Photoroom
  { protocol: 'photoroom', category: 'ai-applications', description: 'Photoroom app removes backgrounds instantly, generates product photos with AI Scene, and creates marketing visuals from templates.' },

  // Pika
  { protocol: 'pika', category: 'ai-applications', description: 'Pika 1.0 generates and edits videos from text/images with features like lip sync, sound effects, and cinematic camera movements.' },
  { protocol: 'pika', category: 'foundation-models', description: 'Pika develops proprietary video generation models capable of consistent motion, object permanence, and physics-aware rendering.' },

  // Runway
  { protocol: 'runway', category: 'ai-applications', description: 'Runway Gen-3 Alpha generates videos from text/images, with tools for motion brush, camera control, and style transfer.' },
  { protocol: 'runway', category: 'foundation-models', description: 'Runway develops Gen-1, Gen-2, and Gen-3 video models pushing state-of-the-art in temporal consistency and visual fidelity.' },

  // Sakana AI
  { protocol: 'sakana-ai', category: 'foundation-models', description: 'Sakana AI develops nature-inspired models using evolutionary algorithms, including their AI Scientist for automated research.' },
  { protocol: 'sakana-ai', category: 'vertical-ai', description: 'Sakana builds AI for scientific discovery, with models that can generate hypotheses, design experiments, and write papers.' },

  // Scale AI
  { protocol: 'scale-ai', category: 'data-infrastructure', description: 'Scale Data Engine provides human-labeled training data with Rapid (fast turnaround) and Studio (complex annotation) products.' },
  { protocol: 'scale-ai', category: 'fine-tuning-training', description: 'Scale offers RLHF services, red teaming via Scale Red Team, and model evaluation through Scale Evaluation benchmarks.' },

  // Sierra
  { protocol: 'sierra', category: 'ai-agents', description: 'Sierra Agent Cloud deploys conversational AI agents that handle customer inquiries with actions like order lookup and returns processing.' },
  { protocol: 'sierra', category: 'vertical-ai', description: 'Sierra platform (founded by Bret Taylor) builds customer service agents for brands like WeightWatchers and SiriusXM.' },

  // Skild AI
  { protocol: 'skild-ai', category: 'foundation-models', description: 'Skild develops foundation models for robotics that enable zero-shot generalization to new tasks and environments.' },
  { protocol: 'skild-ai', category: 'ai-applications', description: 'Skild Brain is a general-purpose robotics model that controls various robot form factors for manipulation and navigation.' },

  // Snorkel AI
  { protocol: 'snorkel-ai', category: 'data-infrastructure', description: 'Snorkel Flow platform uses programmatic labeling with labeling functions to create training data without manual annotation.' },
  { protocol: 'snorkel-ai', category: 'fine-tuning-training', description: 'Snorkel enables rapid model iteration through weak supervision, with Application Studio for building custom AI applications.' },

  // Speak
  { protocol: 'speak', category: 'ai-applications', description: 'Speak app provides AI conversation practice for English and Spanish, with real-time pronunciation feedback and personalized lessons.' },
  { protocol: 'speak', category: 'vertical-ai', description: 'Speak Tutor uses speech recognition and adaptive curriculum to teach language through conversation, not grammar drills.' },

  // StackBlitz
  { protocol: 'stackblitz', category: 'ai-applications', description: 'StackBlitz Bolt generates full-stack web applications from prompts, running entirely in the browser via WebContainers.' },
  { protocol: 'stackblitz', category: 'ai-agents', description: 'Bolt by StackBlitz can autonomously create, debug, and deploy React/Vue/Node apps with npm package management.' },

  // Suno
  { protocol: 'suno', category: 'ai-applications', description: 'Suno v3.5 generates full songs with vocals, instruments, and lyrics from text prompts in any genre or style.' },
  { protocol: 'suno', category: 'foundation-models', description: 'Suno develops Bark (text-to-audio) and Chirp (music generation) models capable of realistic singing and instrumentation.' },

  // Synthesia
  { protocol: 'synthesia', category: 'ai-applications', description: 'Synthesia Studio creates videos with AI avatars (140+ stock or custom clones) speaking in 130+ languages from scripts.' },
  { protocol: 'synthesia', category: 'vertical-ai', description: 'Synthesia serves enterprise L&D and marketing teams, with Expressive Avatars and one-click video translation features.' },

  // Thinking Machines Labs
  { protocol: 'thinking-machines-labs', category: 'foundation-models', description: 'Thinking Machines Labs (founded by former OpenAI researchers) develops next-generation AI systems focused on reasoning.' },

  // Together AI
  { protocol: 'together-ai', category: 'cloud-compute', description: 'Together Cloud provides GPU clusters for training with Together Train and inference with Together Inference APIs.' },
  { protocol: 'together-ai', category: 'inference', description: 'Together Inference serves 100+ open-source models including Llama, Mistral, and Mixtral with competitive per-token pricing.' },
  { protocol: 'together-ai', category: 'fine-tuning-training', description: 'Together Fine-tuning enables custom model training with full fine-tuning or LoRA on dedicated GPU clusters.' },

  // Vannevar Labs
  { protocol: 'vannevar-labs', category: 'vertical-ai', description: 'Vannevar Decrypt platform provides AI-powered intelligence analysis for defense and national security agencies.' },

  // VAST Data
  { protocol: 'vast-data', category: 'data-infrastructure', description: 'VAST DataStore and DataSpace provide unified storage for AI pipelines, with native support for GPU-direct storage access.' },
  { protocol: 'vast-data', category: 'cloud-compute', description: 'VAST Data Platform enables AI infrastructure with InsightEngine for vector search and VAST Database for structured data.' },

  // Windsurf (Codeium)
  { protocol: 'windsurf', category: 'ai-applications', description: 'Windsurf editor (by Codeium) provides AI autocomplete, code generation, and Cascade for multi-file agentic editing.' },
  { protocol: 'windsurf', category: 'ai-agents', description: 'Windsurf Cascade autonomously makes multi-file changes, runs terminal commands, and iterates on code based on errors.' },

  // World Labs
  { protocol: 'world-labs', category: 'foundation-models', description: 'World Labs develops Large World Models (LWMs) that understand 3D space, physics, and generate explorable environments.' },
  { protocol: 'world-labs', category: 'ai-applications', description: 'World Labs creates interactive 3D worlds from single images, enabling virtual exploration for gaming and simulation.' },

  // Writer
  { protocol: 'writer', category: 'ai-applications', description: 'Writer platform provides AI writing assistance with brand voice enforcement, content generation, and compliance checking.' },
  { protocol: 'writer', category: 'fine-tuning-training', description: 'Writer trains Palmyra LLMs (Palmyra-X, Palmyra-Med) customized to enterprise terminology and brand guidelines.' },

  // xAI
  { protocol: 'xai', category: 'foundation-models', description: 'xAI develops Grok-1 and Grok-2 models with real-time X (Twitter) data access and multi-modal capabilities.' },
]

// Categories to remove for specific protocols (weak associations)
const REMOVE_CATEGORIES: Array<{ protocol: string; category: string }> = [
  { protocol: 'datarobot', category: 'ai-agents' }, // Weak - generic "integrations with LLM orchestration"
]

export async function POST() {
  const results = {
    protocolsRemoved: [] as string[],
    categoriesRemoved: [] as Array<{ protocol: string; category: string }>,
    descriptionsUpdated: [] as Array<{ protocol: string; category: string }>,
    errors: [] as string[],
  }

  // 1. Remove consulting firms entirely
  for (const protocol of REMOVE_PROTOCOLS) {
    try {
      // Delete from protocols_categories first
      await supabaseAdmin
        .from(TABLES.protocols_categories)
        .delete()
        .eq('protocol', protocol)

      // Then delete from protocols_metadata
      await supabaseAdmin
        .from(TABLES.protocols_metadata)
        .delete()
        .eq('protocol', protocol)

      results.protocolsRemoved.push(protocol)
    } catch (error) {
      results.errors.push(`Failed to remove ${protocol}: ${error}`)
    }
  }

  // 2. Remove weak category associations
  for (const { protocol, category } of REMOVE_CATEGORIES) {
    try {
      await supabaseAdmin
        .from(TABLES.protocols_categories)
        .delete()
        .eq('protocol', protocol)
        .eq('category', category)

      results.categoriesRemoved.push({ protocol, category })
    } catch (error) {
      results.errors.push(`Failed to remove ${protocol}/${category}: ${error}`)
    }
  }

  // 3. Update descriptions with specific products
  for (const update of DESCRIPTION_UPDATES) {
    try {
      const { error } = await supabaseAdmin
        .from(TABLES.protocols_categories)
        .update({ description: update.description })
        .eq('protocol', update.protocol)
        .eq('category', update.category)

      if (!error) {
        results.descriptionsUpdated.push({ protocol: update.protocol, category: update.category })
      }
    } catch (error) {
      results.errors.push(`Failed to update ${update.protocol}/${update.category}: ${error}`)
    }
  }

  return NextResponse.json({
    success: results.errors.length === 0,
    summary: {
      protocolsRemoved: results.protocolsRemoved.length,
      categoriesRemoved: results.categoriesRemoved.length,
      descriptionsUpdated: results.descriptionsUpdated.length,
      errors: results.errors.length,
    },
    results,
  })
}
