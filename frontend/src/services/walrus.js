const PUBLISHER = import.meta.env.VITE_WALRUS_PUBLISHER
const AGGREGATOR = import.meta.env.VITE_WALRUS_AGGREGATOR
const MAX_RETRIES = 3
const BASE_DELAY_MS = 1000

async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options)
      if (res.ok) return res
      if (i < retries && res.status >= 500) {
        const delay = BASE_DELAY_MS * Math.pow(2, i)
        console.warn(`[walrus] retry ${i + 1}/${retries} after ${delay}ms (status ${res.status})`)
        await new Promise((r) => setTimeout(r, delay))
        continue
      }
      return res
    } catch (err) {
      if (i < retries) {
        const delay = BASE_DELAY_MS * Math.pow(2, i)
        console.warn(`[walrus] retry ${i + 1}/${retries} after ${delay}ms (${err.message})`)
        await new Promise((r) => setTimeout(r, delay))
        continue
      }
      throw err
    }
  }
}

export async function uploadBlob(file, epochs = 5) {
  console.log('[walrus] upload start', {
    bytes: file.size,
    epochs,
    url: `${PUBLISHER}/v1/blobs?epochs=${epochs}`,
  })
  const t0 = performance.now()
  const res = await fetchWithRetry(`${PUBLISHER}/v1/blobs?epochs=${epochs}`, {
    method: 'PUT',
    body: file,
  })
  const json = await res.json()
  const elapsedMs = Math.round(performance.now() - t0)

  if (res.status === 413) {
    throw new Error(`File too large for Walrus publisher (max ~10 MiB)`)
  }
  if (!res.ok) {
    console.error('[walrus] upload failed', { status: res.status, json })
    throw new Error(`Walrus upload failed: ${json?.error ?? res.statusText ?? res.status}`)
  }

  if (json.newlyCreated) {
    const blobId = json.newlyCreated.blobObject.blobId
    console.log('[walrus] upload ok (newlyCreated)', { blobId, elapsedMs })
    return blobId
  }
  if (json.alreadyCertified) {
    console.log('[walrus] upload ok (alreadyCertified)', {
      blobId: json.alreadyCertified.blobId,
      elapsedMs,
    })
    return json.alreadyCertified.blobId
  }
  console.error('[walrus] upload failed (unexpected response)', json)
  throw new Error('Walrus upload failed')
}

export async function fetchBlob(blobId) {
  console.log('[walrus] fetch start', { blobId })
  const t0 = performance.now()
  const res = await fetch(`${AGGREGATOR}/v1/blobs/${blobId}`)
  if (!res.ok) {
    console.error('[walrus] fetch failed', { status: res.status, blobId })
    throw new Error('Failed to fetch blob')
  }
  const buf = await res.arrayBuffer()
  console.log('[walrus] fetch ok', {
    blobId,
    bytes: buf.byteLength,
    elapsedMs: Math.round(performance.now() - t0),
  })
  return buf
}
