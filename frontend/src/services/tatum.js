const TATUM_URL = import.meta.env.VITE_TATUM_RPC_URL
const API_KEY = import.meta.env.VITE_TATUM_API_KEY
const FULLNODE_URL = import.meta.env.VITE_FULLNODE_URL || 'https://fullnode.testnet.sui.io'
const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID

let requestId = 1

async function suiRpc(url, method, params) {
  const headers = { 'Content-Type': 'application/json' }
  if (url === TATUM_URL && API_KEY) {
    headers['x-api-key'] = API_KEY
  }
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: requestId++,
      method,
      params,
    }),
  })
  const json = await res.json()
  if (json.error) throw new Error(json.error.message)
  return json.result
}

export function queryPublishedEvents(cursor = null, limit = 50) {
  return suiRpc(TATUM_URL, 'suix_queryEvents', [
    { MoveModule: { package: PACKAGE_ID, module: 'product' } },
    cursor,
    limit,
    false,
  ])
}

export function queryPurchaseEvents(cursor = null, limit = 50) {
  return suiRpc(TATUM_URL, 'suix_queryEvents', [
    { MoveModule: { package: PACKAGE_ID, module: 'checkout' } },
    cursor,
    limit,
    false,
  ])
}

export function queryEventsByTransaction(digest) {
  return suiRpc(TATUM_URL, 'sui_getEvents', [digest])
}

export async function fetchObjects(objectIds) {
  return suiRpc(FULLNODE_URL, 'sui_multiGetObjects', [
    objectIds,
    { showContent: true, showOwner: true, showType: true },
  ])
}

export async function fetchObject(objectId) {
  return suiRpc(FULLNODE_URL, 'sui_getObject', [
    objectId,
    { showContent: true, showOwner: true, showType: true },
  ])
}

export async function fetchOwnedObjects(owner, opts = {}) {
  const { filter, limit, cursor } = opts
  const query = {
    options: { showContent: true, showOwner: true, showType: true },
  }
  if (filter) query.filter = filter
  if (limit) query.limit = limit
  if (cursor) query.cursor = cursor
  return suiRpc(FULLNODE_URL, 'suix_getOwnedObjects', [owner, query])
}

export async function fetchCoins(owner, coinType) {
  return suiRpc(FULLNODE_URL, 'suix_getCoins', [owner, coinType, null, 100])
}
