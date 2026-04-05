export type ProductConfig = {
  id: string
  name: string
  description: string
  url: string
  metricsUrl: string
  color: string
}

export const PRODUCTS: ProductConfig[] = [
  {
    id: 'dentos',
    name: 'DentOS',
    description: 'Reducción de no-shows para clínicas dentales via WhatsApp',
    url: process.env.DENTOS_URL ?? '',
    metricsUrl: `${process.env.DENTOS_URL ?? ''}/api/metrics`,
    color: '#3B82F6',
  },
  {
    id: 'focal',
    name: 'Focal',
    description: 'Second brain + OKR tracker personal',
    url: process.env.FOCAL_URL ?? '',
    metricsUrl: `${process.env.FOCAL_URL ?? ''}/api/metrics`,
    color: '#22C55E',
  },
]
