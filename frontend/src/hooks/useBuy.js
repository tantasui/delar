import { useState } from 'react'
import { useDAppKit, useCurrentClient, useCurrentAccount } from '@mysten/dapp-kit-react'
import { Transaction, coinWithBalance } from '@mysten/sui/transactions'
import { useQueryClient } from '@tanstack/react-query'

const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID
const FEE_CONFIG_ID = import.meta.env.VITE_FEE_CONFIG_ID
const USDC_TYPE = import.meta.env.VITE_USDC_TYPE

export function useBuy() {
  const dAppKit = useDAppKit()
  const client = useCurrentClient()
  const account = useCurrentAccount()
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState(null)

  async function buy(productId, priceUsdc) {
    if (!account) return
    setIsPending(true)
    setError(null)

    try {
      const tx = new Transaction()
      tx.setSender(account.address)

      const payment = await coinWithBalance({
        balance: priceUsdc,
        type: USDC_TYPE,
      })

      tx.moveCall({
        target: `${PACKAGE_ID}::checkout::buy`,
        typeArguments: [USDC_TYPE],
        arguments: [
          tx.object(productId),
          tx.object(FEE_CONFIG_ID),
          payment,
          tx.object.clock(),
        ],
      })

      const result = await dAppKit.signAndExecuteTransaction({ transaction: tx })
      if (result.FailedTransaction) {
        throw new Error(result.FailedTransaction.status.error?.message || 'Purchase failed')
      }

      await client.waitForTransaction({ digest: result.Transaction.digest })
      await queryClient.invalidateQueries({ queryKey: ['receipts', account.address] })
      await queryClient.invalidateQueries({ queryKey: ['productObjects'] })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsPending(false)
    }
  }

  return { buy, isPending, error }
}
