import { useState } from 'react'
import { useDAppKit, useCurrentClient, useCurrentAccount } from '@mysten/dapp-kit-react'
import { Transaction } from '@mysten/sui/transactions'
import { useQueryClient } from '@tanstack/react-query'

const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID

export function useAffiliates() {
  const dAppKit = useDAppKit()
  const client = useCurrentClient()
  const account = useCurrentAccount()
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState(null)

  async function addAffiliate(productId, affiliateAddress) {
    if (!account) return
    setIsPending(true)
    setError(null)
    try {
      const tx = new Transaction()
      tx.moveCall({
        target: `${PACKAGE_ID}::product::add_affiliate`,
        arguments: [tx.object(productId), tx.pure.address(affiliateAddress), tx.object.clock()],
      })
      const result = await dAppKit.signAndExecuteTransaction({ transaction: tx })
      if (result.FailedTransaction) {
        throw new Error(result.FailedTransaction.status.error?.message || 'Failed to add affiliate')
      }
      await client.waitForTransaction({ digest: result.Transaction.digest })
      await queryClient.invalidateQueries({ queryKey: ['productObjects'] })
      await queryClient.invalidateQueries({ queryKey: ['productObject', productId] })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsPending(false)
    }
  }

  async function removeAffiliate(productId, affiliateAddress) {
    if (!account) return
    setIsPending(true)
    setError(null)
    try {
      const tx = new Transaction()
      tx.moveCall({
        target: `${PACKAGE_ID}::product::remove_affiliate`,
        arguments: [tx.object(productId), tx.pure.address(affiliateAddress), tx.object.clock()],
      })
      const result = await dAppKit.signAndExecuteTransaction({ transaction: tx })
      if (result.FailedTransaction) {
        throw new Error(result.FailedTransaction.status.error?.message || 'Failed to remove affiliate')
      }
      await client.waitForTransaction({ digest: result.Transaction.digest })
      await queryClient.invalidateQueries({ queryKey: ['productObjects'] })
      await queryClient.invalidateQueries({ queryKey: ['productObject', productId] })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsPending(false)
    }
  }

  return { addAffiliate, removeAffiliate, isPending, error, setError }
}
