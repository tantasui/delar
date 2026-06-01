import { useMemo, useCallback, useState } from 'react'
import { useCurrentAccount, useCurrentClient, useDAppKit } from '@mysten/dapp-kit-react'
import { SealClient, SessionKey, EncryptedObject } from '@mysten/seal'
import { fromHex } from '@mysten/sui/utils'
import { Transaction } from '@mysten/sui/transactions'
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval'

const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID
const SERVER_1 = import.meta.env.VITE_SEAL_KEY_SERVER_1
const SERVER_2 = import.meta.env.VITE_SEAL_KEY_SERVER_2
const TTL_MIN = 30

export function useSeal() {
  const account = useCurrentAccount()
  const suiClient = useCurrentClient()
  const dAppKit = useDAppKit()
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [error, setError] = useState(null)

  const sealClient = useMemo(() => {
    if (!suiClient) return null
    return new SealClient({
      suiClient,
      serverConfigs: [
        { objectId: SERVER_1, weight: 1 },
        { objectId: SERVER_2, weight: 1 },
      ],
      verifyKeyServers: false,
    })
  }, [suiClient])

  const getOrCreateSessionKey = useCallback(async () => {
    if (!account) throw new Error('Wallet not connected')

    const storageKey = `seal_session_key_${account.address}_${PACKAGE_ID}`
    console.log('[session] lookup', { storageKey })

    try {
      const stored = await idbGet(storageKey)
      if (stored) {
        console.log('[session] found stored — importing')
        const sessionKey = await SessionKey.import(stored, suiClient)
        const expired = sessionKey.isExpired()
        const addrMatch = sessionKey.getAddress() === account.address
        console.log('[session] imported', { expired, addrMatch })
        if (!expired && addrMatch) {
          return sessionKey
        }
        console.log('[session] stale — discarding')
        await idbDel(storageKey)
      } else {
        console.log('[session] none stored')
      }
    } catch (e) {
      console.warn('[session] failed to load stored', e)
    }

    console.log('[session] creating new', { ttlMin: TTL_MIN, packageId: PACKAGE_ID })
    const sessionKey = await SessionKey.create({
      address: account.address,
      packageId: PACKAGE_ID,
      ttlMin: TTL_MIN,
      suiClient,
    })

    console.log('[session] awaiting wallet signature…')
    let result
    try {
      result = await dAppKit.signPersonalMessage({
        message: sessionKey.getPersonalMessage(),
      })
    } catch (err) {
      console.error('[session] sign failed', err)
      throw new Error(`Failed to sign session key: ${err?.message ?? err}`)
    }
    console.log('[session] signed — caching')
    await sessionKey.setPersonalMessageSignature(result.signature)
    try {
      await idbSet(storageKey, sessionKey.export())
    } catch (e) {
      console.warn('[session] cache write failed (continuing)', e)
    }
    return sessionKey
  }, [account, suiClient, dAppKit])

  const decryptData = useCallback(async (encryptedData, receipt) => {
    if (!sealClient || !account) throw new Error('Seal client not initialized or wallet not connected')

    console.log('[decrypt] start', {
      receiptId: receipt?.id,
      productId: receipt?.productId,
      ciphertextBytes: encryptedData.byteLength ?? encryptedData.length,
    })
    setIsDecrypting(true)
    setError(null)

    try {
      const encryptedObject = EncryptedObject.parse(new Uint8Array(encryptedData))
      const sealId = encryptedObject.id
      console.log('[decrypt] parsed ciphertext', { sealId })

      const sessionKey = await getOrCreateSessionKey()
      console.log('[decrypt] session key ready')

      const tx = new Transaction()
      tx.setSender(account.address)
      tx.moveCall({
        target: `${PACKAGE_ID}::seal_access::seal_approve`,
        arguments: [
          tx.pure.vector('u8', Array.from(fromHex(sealId.replace('0x', '')))),
          tx.object(receipt.id),
        ],
      })

      const txBytes = await tx.build({ client: suiClient, onlyTransactionKind: true })
      console.log('[decrypt] built seal_approve txBytes', { bytes: txBytes.length })

      console.log('[decrypt] fetching keys from servers…')
      const tKeys = performance.now()
      try {
        await sealClient.fetchKeys({
          ids: [sealId],
          txBytes,
          sessionKey,
          threshold: 2,
        })
      } catch (e) {
        console.error('[decrypt] fetchKeys failed (policy denial or network)', e)
        throw e
      }
      console.log('[decrypt] keys received', {
        elapsedMs: Math.round(performance.now() - tKeys),
      })

      console.log('[decrypt] decrypting locally…')
      const tDec = performance.now()
      const decryptedBytes = await sealClient.decrypt({
        data: new Uint8Array(encryptedData),
        sessionKey,
        txBytes,
      })
      console.log('[decrypt] done', {
        plaintextBytes: decryptedBytes.length,
        elapsedMs: Math.round(performance.now() - tDec),
      })

      return decryptedBytes
    } catch (e) {
      console.error('[decrypt] error', e)
      setError(e.message || 'Decryption failed')
      throw e
    } finally {
      setIsDecrypting(false)
    }
  }, [sealClient, account, suiClient, getOrCreateSessionKey])

  return { decryptData, getOrCreateSessionKey, isDecrypting, error }
}
