const PUBLISHER = import.meta.env.VITE_WALRUS_PUBLISHER
const AGGREGATOR = import.meta.env.VITE_WALRUS_AGGREGATOR

export async function uploadBlob(file, epochs = 5) {
  console.log('[walrus] upload start', {
    bytes: file.size,
    epochs,
    url: `${PUBLISHER}/v1/blobs?epochs=${epochs}`,
  })
  const t0 = performance.now()
  const res = await fetch(`${PUBLISHER}/v1/blobs?epochs=${epochs}`, {
    method: 'PUT',
    body: file,
  })
  const json = await res.json()
  const elapsedMs = Math.round(performance.now() - t0)

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
  console.error('[walrus] upload failed', json)
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
