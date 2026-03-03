import { FilterableMarketMap } from '@/components/FilterableMarketMap'
import { fetchCategoriesWithProtocols } from '@/constants/protocols'

export const revalidate = 60 // Revalidate every 60 seconds

export default async function Home() {
  const categories = await fetchCategoriesWithProtocols()

  // Count unique companies (a company can appear in multiple categories)
  const uniqueCompanies = new Set(
    Object.values(categories).flatMap((cat) => cat.protocols.map((p) => p.protocol))
  )
  const totalCompanies = uniqueCompanies.size

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Landscape Map
          </h1>
          <p className="text-gray-600">
            A comprehensive view of the AI ecosystem
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {totalCompanies} companies across {Object.keys(categories).length} categories
          </p>
        </div>

        {/* Market Map */}
        <FilterableMarketMap categories={categories} />

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-400">
          <p>
            Built by{' '}
            <a
              href="https://www.artemis.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Artemis
            </a>
          </p>
        </footer>
      </div>
    </main>
  )
}
