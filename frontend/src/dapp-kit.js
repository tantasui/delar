import { createDAppKit } from '@mysten/dapp-kit-react'
import { SuiGrpcClient } from '@mysten/sui/grpc'

const NETWORK = import.meta.env.VITE_SUI_NETWORK || 'testnet'

const GRPC_URLS = {
  testnet: 'https://fullnode.testnet.sui.io:443',
  mainnet: 'https://fullnode.mainnet.sui.io:443',
}

export const dAppKit = createDAppKit({
  networks: ['testnet', 'mainnet'],
  defaultNetwork: NETWORK,
  createClient: (network) =>
    new SuiGrpcClient({ network, baseUrl: GRPC_URLS[network] }),
})
