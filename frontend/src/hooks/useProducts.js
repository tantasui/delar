import { useQuery } from '@tanstack/react-query'
import { queryPublishedEvents, fetchObjects } from '../services/tatum'
import { useState, useEffect } from 'react'

const USDC_DECIMALS = 1_000_000

function parseProductListing(obj) {
  const f = obj.data.content.fields
  return {
    id: obj.data.objectId,
    type: f.product_type,
    title: f.title,
    description: f.description,
    blobId: f.blob_id,
    thumbnailBlobId: f.thumbnail_blob_id,
    creator: f.creator,
    priceUsdc: Number(f.price_usdc),
    price: Number(f.price_usdc) / USDC_DECIMALS,
    isActive: f.is_active,
    affiliateBps: Number(f.affiliate_bps),
    affiliates: f.affiliates?.fields?.contents || f.affiliates?.contents || [],
    totalSales: Number(f.total_sales),
    createdAt: Number(f.created_at),
    updatedAt: Number(f.updated_at),
  }
}

export function useProducts() {
  const [productIds, setProductIds] = useState([])

  const events = useQuery({
    queryKey: ['productPublishedEvents'],
    queryFn: () => queryPublishedEvents(),
    refetchInterval: 30_000,
  })

  useEffect(() => {
    if (events.data?.data) {
      const ids = events.data.data.map((e) => e.parsedJson.product_id)
      setProductIds((prev) => {
        const set = new Set(prev)
        ids.forEach((id) => set.add(id))
        return [...set]
      })
    }
  }, [events.data])

  const products = useQuery({
    queryKey: ['productObjects', productIds],
    queryFn: async () => {
      const res = await fetchObjects(productIds)
      const objects = res || []
      return objects
        .filter((o) => o?.data?.content?.fields)
        .map(parseProductListing)
    },
    enabled: productIds.length > 0,
  })

  return {
    products: products.data || [],
    isLoading: events.isPending || products.isPending,
    error: events.error || products.error,
    refetch: () => { events.refetch(); products.refetch() },
  }
}

export function useProductById(id) {
  return useQuery({
    queryKey: ['productObject', id],
    queryFn: async () => {
      const res = await fetchObjects([id])
      const obj = res?.[0]
      if (!obj?.data?.content?.fields) return null
      return parseProductListing(obj)
    },
    enabled: !!id,
  })
}
