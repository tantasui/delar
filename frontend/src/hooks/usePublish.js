import { useState } from 'react'
import { useDAppKit, useCurrentClient, useCurrentAccount } from '@mysten/dapp-kit-react'
import { Transaction } from '@mysten/sui/transactions'
import { uploadBlob } from '../services/walrus'
import { encryptFile } from '../services/seal'
import { useQueryClient } from '@tanstack/react-query'

const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID

export function usePublish() {
  const dAppKit = useDAppKit()
  const client = useCurrentClient()
  const account = useCurrentAccount()
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState(null)
  const [step, setStep] = useState(null)

  async function publish({ file, thumbnail, title, description, priceUsdc, productType, affiliateBps }) {
    if (!account) {
      console.warn('[publish] aborted: no connected account')
      return
    }
    console.log('[publish] start', {
      account: account.address,
      title,
      priceUsdc,
      productType,
      affiliateBps,
      hasThumbnail: !!thumbnail,
      file: { name: file.name, size: file.size, type: file.type },
    })
    setIsPending(true)
    setError(null)

    try {
      setStep('encrypt')
      console.log('[publish] step=encrypt')
      const { encryptedBlob, sealId } = await encryptFile(file)
      console.log('[publish] encrypt done', {
        ciphertextBytes: encryptedBlob.size,
        sealIdBytes: sealId.length,
      })

      setStep('upload')
      console.log('[publish] step=upload (file)')
      const blobId = await uploadBlob(encryptedBlob)
      console.log('[publish] file blobId', blobId)
      let thumbnailBlobId = ''
      if (thumbnail) {
        console.log('[publish] step=upload (thumbnail)', {
          size: thumbnail.size,
          type: thumbnail.type,
        })
        thumbnailBlobId = await uploadBlob(thumbnail)
        console.log('[publish] thumbnail blobId', thumbnailBlobId)
      }

      setStep('publish')
      console.log('[publish] step=publish — building tx')
      const tx = new Transaction()
      const product = tx.moveCall({
        target: `${PACKAGE_ID}::product::publish_product`,
        arguments: [
          tx.pure.string(title),
          tx.pure.string(description),
          tx.pure.u64(priceUsdc),
          tx.pure.string(blobId),
          tx.pure.vector('u8', sealId),
          tx.pure.u8(productType),
          tx.pure.string(thumbnailBlobId),
          tx.pure.u64(affiliateBps),
          tx.object.clock(),
        ],
      })
      tx.moveCall({
        target: '0x2::transfer::public_share_object',
        typeArguments: [`${PACKAGE_ID}::product::ProductListing`],
        arguments: [product],
      })

      console.log('[publish] signing & executing tx…')
      const result = await dAppKit.signAndExecuteTransaction({ transaction: tx })
      console.log('[publish] tx result', result)
      if (result.FailedTransaction) {
        throw new Error(result.FailedTransaction.status.error?.message || 'Publish failed')
      }

      const digest = result.Transaction.digest
      console.log('[publish] waiting for tx', digest)
      await client.waitForTransaction({ digest })
      console.log('[publish] tx confirmed', digest)
      await queryClient.invalidateQueries({ queryKey: ['productPublishedEvents'] })
      await queryClient.invalidateQueries({ queryKey: ['productObjects'] })
      console.log('[publish] done')
    } catch (e) {
      console.error('[publish] error', e)
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsPending(false)
      setStep(null)
    }
  }

  return { publish, isPending, error, step }
}
