import { useQuery } from '@tanstack/react-query'
import { useCurrentAccount } from '@mysten/dapp-kit-react'
import { queryPurchaseEvents } from '../services/tatum'

const USDC_DECIMALS = 1_000_000

export function useSalesHistory() {
  const account = useCurrentAccount()

  return useQuery({
    queryKey: ['salesHistory', account?.address],
    queryFn: async () => {
      const res = await queryPurchaseEvents(null, 100)
      const events = res?.data || []
      return events
        .filter((e) => e.parsedJson?.creator === account.address)
        .map((e) => ({
          txDigest: e.id?.txDigest,
          productId: e.parsedJson.product_id,
          buyer: e.parsedJson.buyer,
          amountPaid: Number(e.parsedJson.amount_paid),
          amountPaidUsdc: Number(e.parsedJson.amount_paid) / USDC_DECIMALS,
          feeAmount: Number(e.parsedJson.fee_amount),
          affiliate: e.parsedJson.affiliate ?? null,
          affiliateAmount: Number(e.parsedJson.affiliate_amount),
          timestamp: Number(e.parsedJson.timestamp),
        }))
        .sort((a, b) => b.timestamp - a.timestamp)
    },
    enabled: !!account,
    refetchInterval: 30_000,
  })
}
