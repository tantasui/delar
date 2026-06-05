import { SealClient } from '@mysten/seal'
import { SuiGrpcClient } from '@mysten/sui/grpc'

const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID
const SERVER_1 = import.meta.env.VITE_SEAL_KEY_SERVER_1
const SERVER_2 = import.meta.env.VITE_SEAL_KEY_SERVER_2
const NETWORK = import.meta.env.VITE_SUI_NETWORK || 'testnet'

const GRPC_URLS = {
  testnet: 'https://fullnode.testnet.sui.io:443',
  mainnet: 'https://fullnode.mainnet.sui.io:443',
}

let sealClient = null
let suiClient = null

function getSuiClient() {
  if (!suiClient) {
    suiClient = new SuiGrpcClient({ network: NETWORK, baseUrl: GRPC_URLS[NETWORK] })
  }
  return suiClient
}

function getSealClient() {
  if (!sealClient) {
    sealClient = new SealClient({
      suiClient: getSuiClient(),
      serverConfigs: [
        { objectId: SERVER_1, weight: 1 },
        { objectId: SERVER_2, weight: 1 },
      ],
      verifyKeyServers: false,
    })
  }
  return sealClient
}

export async function encryptFile(file) {
  console.log('[seal] encryptFile start', {
    name: file.name,
    size: file.size,
    type: file.type,
  })

  const bytes = await file.arrayBuffer()
  const fileBytes = new Uint8Array(bytes)

  // Prepend filename header: [4 bytes LE: name length] [name bytes] [file bytes]
  // This lets us recover the original filename on decryption.
  const nameBytes = new TextEncoder().encode(file.name)
  const payload = new Uint8Array(4 + nameBytes.length + fileBytes.length)
  new DataView(payload.buffer).setUint32(0, nameBytes.length, true)
  payload.set(nameBytes, 4)
  payload.set(fileBytes, 4 + nameBytes.length)

  const sealIdBytes = crypto.getRandomValues(new Uint8Array(32))
  const sealIdHex = Array.from(sealIdBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  console.log('[seal] generated sealId', sealIdHex)
  console.log('[seal] calling sealClient.encrypt', {
    threshold: 2,
    packageId: PACKAGE_ID,
    plaintextBytes: payload.length,
  })

  const result = await getSealClient().encrypt({
    threshold: 2,
    packageId: PACKAGE_ID,
    id: sealIdHex,
    data: payload,
  })

  console.log('[seal] encrypted', {
    ciphertextBytes: result.encryptedObject.length,
    overheadBytes: result.encryptedObject.length - payload.length,
  })

  return {
    encryptedBlob: new Blob([result.encryptedObject]),
    sealId: Array.from(sealIdBytes),
  }
}
