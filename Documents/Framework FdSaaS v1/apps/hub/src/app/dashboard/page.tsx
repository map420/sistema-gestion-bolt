import { PRODUCTS } from '@/config/products'
import DashboardClient from './dashboard-client'

export type ProductMetrics = {
  product: string
  status: 'healthy' | 'degraded' | 'down'
  users: { total: number; newThisWeek: number }
  records: Array<{ label: string; total: number; thisWeek: number }>
  lastUpdated: string
  error?: string
}

async function fetchMetrics(metricsUrl: string, productName: string): Promise<ProductMetrics> {
  try {
    const res = await fetch(metricsUrl, {
      headers: { 'x-metrics-key': process.env.METRICS_SECRET ?? '' },
      next: { revalidate: 60 }, // cache 60s
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  } catch (err) {
    return {
      product: productName,
      status: 'down',
      users: { total: 0, newThisWeek: 0 },
      records: [],
      lastUpdated: new Date().toISOString(),
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

export default async function DashboardPage() {
  const results = await Promise.all(
    PRODUCTS.map((p) => fetchMetrics(p.metricsUrl, p.name))
  )

  const metricsMap: Record<string, ProductMetrics> = {}
  PRODUCTS.forEach((p, i) => { metricsMap[p.id] = results[i] })

  return <DashboardClient products={PRODUCTS} metricsMap={metricsMap} />
}
