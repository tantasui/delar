import { useCurrentAccount } from '@mysten/dapp-kit-react'
import { useQuery } from '@tanstack/react-query'
import { fetchOwnedObjects } from '../services/tatum'

export function useReceipts() {
  const account = useCurrentAccount()

  return useQuery({
    queryKey: ['receipts', account?.address],
    queryFn: async () => {
      const res = await fetchOwnedObjects(account.address, {
        filter: { StructType: `${import.meta.env.VITE_PACKAGE_ID}::receipt::PurchaseReceipt` },
      })
      const objects = res?.data || []
      return objects
        .filter((o) => o?.data?.content?.fields)
        .map((o) => {
          const f = o.data.content.fields
          return {
            id: o.data.objectId,
            productId: f.product_id,
            buyer: f.buyer,
            creator: f.creator,
            productTitle: f.product_title,
            blobId: f.blob_id,
            sealId: f.seal_id,
            amountPaid: Number(f.amount_paid),
            affiliate: f.affiliate,
            purchasedAt: Number(f.purchased_at),
            downloadCount: Number(f.download_count),
          }
        })
    },
    enabled: !!account,
  })
}
