import { getCategoriesWithProtocols } from '@/database/api'
import type { CategoryWithProtocols } from '@/database/api'

export async function fetchCategoriesWithProtocols(): Promise<Record<string, CategoryWithProtocols>> {
  return getCategoriesWithProtocols()
}
