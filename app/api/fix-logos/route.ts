import { NextResponse } from 'next/server'
import { supabaseAdmin, TABLES } from '@/lib/supabase'

const LOGO_FIXES: Record<string, string> = {
  'openai': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/OpenAI_Logo.svg/512px-OpenAI_Logo.svg.png',
  'google-deepmind': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/DeepMind_new_logo.svg/512px-DeepMind_new_logo.svg.png',
  'nvidia': 'https://upload.wikimedia.org/wikipedia/sco/thumb/2/21/Nvidia_logo.svg/512px-Nvidia_logo.svg.png',
  'microsoft-azure-ai': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Microsoft_Azure_Logo.svg/512px-Microsoft_Azure_Logo.svg.png',
  'datarobot': 'https://www.datarobot.com/wp-content/uploads/2021/07/DataRobot-Logo-Color-RGB.svg',
  'accenture': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Accenture.svg/512px-Accenture.svg.png',
  'tcs-ai': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Tata_Consultancy_Services_Logo.svg/512px-Tata_Consultancy_Services_Logo.svg.png',
  'cognizant': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Cognizant_logo.svg/512px-Cognizant_logo.svg.png',
  'epam': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/EPAM_logo.svg/512px-EPAM_logo.svg.png',
  'suffescom': 'https://www.suffescom.com/assets/img/logo-dark.svg',
  'sumatosoft': 'https://sumatosoft.com/wp-content/uploads/2023/05/SumatoSoft-Logo.svg',
  'dataroot-labs': 'https://datarootlabs.com/assets/images/logo.svg',
  'quickway': 'https://quickwayinfosystems.com/images/logo.png',
  'innovacio': 'https://innovacio.io/wp-content/uploads/2023/01/innovacio-logo.png',
  'entrans': 'https://entrans.ai/wp-content/uploads/2023/09/entrans-logo.svg',
}

export async function POST() {
  const results: Array<{ protocol: string; status: string; logo?: string }> = []

  for (const [protocol, logo] of Object.entries(LOGO_FIXES)) {
    try {
      const { error } = await supabaseAdmin
        .from(TABLES.protocols_metadata)
        .update({ logo })
        .eq('protocol', protocol)

      if (error) throw error
      results.push({ protocol, status: 'updated', logo })
    } catch (error) {
      results.push({ protocol, status: 'error' })
    }
  }

  return NextResponse.json({ results })
}
