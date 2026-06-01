import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiDownload, FiBookOpen, FiChevronLeft, FiChevronRight, FiShoppingBag } from 'react-icons/fi'
import { HiOutlineLibrary } from 'react-icons/hi'
import { useCurrentAccount } from '@mysten/dapp-kit-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useReceipts } from '../hooks/useReceipts'
import { useSeal } from '../hooks/useSeal'
import { fetchBlob } from '../services/walrus'

// Recovers the original filename embedded by encryptFile.
// Falls back gracefully for blobs uploaded before this header was introduced.
function parsePayload(bytes) {
  if (bytes.length < 4) return { filename: null, data: bytes }
  const nameLen = new DataView(bytes.buffer, bytes.byteOffset).getUint32(0, true)
  if (nameLen === 0 || nameLen > 255 || 4 + nameLen > bytes.length) return { filename: null, data: bytes }
  const filename = new TextDecoder().decode(bytes.slice(4, 4 + nameLen))
  if (filename.includes('\x00') || filename.includes('/') || filename.includes('\\')) return { filename: null, data: bytes }
  return { filename, data: bytes.slice(4 + nameLen) }
}

function sniffFileType(bytes) {
  const b = bytes
  const eq = (offset, sig) => sig.every((v, i) => b[offset + i] === v)
  if (b.length >= 4 && eq(0, [0x25, 0x50, 0x44, 0x46])) return { mime: 'application/pdf', ext: 'pdf' }
  if (b.length >= 8 && eq(0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { mime: 'image/png', ext: 'png' }
  if (b.length >= 3 && eq(0, [0xff, 0xd8, 0xff])) return { mime: 'image/jpeg', ext: 'jpg' }
  if (b.length >= 6 && eq(0, [0x47, 0x49, 0x46, 0x38]) && (b[4] === 0x37 || b[4] === 0x39) && b[5] === 0x61) return { mime: 'image/gif', ext: 'gif' }
  if (b.length >= 12 && eq(0, [0x52, 0x49, 0x46, 0x46]) && eq(8, [0x57, 0x45, 0x42, 0x50])) return { mime: 'image/webp', ext: 'webp' }
  if (b.length >= 12 && eq(4, [0x66, 0x74, 0x79, 0x70])) return { mime: 'video/mp4', ext: 'mp4' }
  if (b.length >= 4 && eq(0, [0x1a, 0x45, 0xdf, 0xa3])) return { mime: 'video/webm', ext: 'webm' }
  if (b.length >= 12 && eq(0, [0x52, 0x49, 0x46, 0x46]) && eq(8, [0x57, 0x41, 0x56, 0x45])) return { mime: 'audio/wav', ext: 'wav' }
  if (b.length >= 3 && eq(0, [0x49, 0x44, 0x33])) return { mime: 'audio/mpeg', ext: 'mp3' }
  if (b.length >= 2 && b[0] === 0xff && (b[1] & 0xe0) === 0xe0) return { mime: 'audio/mpeg', ext: 'mp3' }
  if (b.length >= 4 && eq(0, [0x50, 0x4b, 0x03, 0x04])) {
    if (b.length >= 30) {
      const tail = new TextDecoder('latin1').decode(b.slice(0, Math.min(b.length, 2048)))
      if (tail.includes('mimetypeapplication/epub+zip')) return { mime: 'application/epub+zip', ext: 'epub' }
      if (tail.includes('word/')) return { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: 'docx' }
      if (tail.includes('xl/')) return { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: 'xlsx' }
      if (tail.includes('ppt/')) return { mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', ext: 'pptx' }
    }
    return { mime: 'application/zip', ext: 'zip' }
  }
  if (b.length >= 5 && eq(0, [0x7b]) ) return { mime: 'application/json', ext: 'json' }
  if (b.length >= 1 && b[0] < 0x80) return { mime: 'text/plain', ext: 'txt' }
  return { mime: 'application/octet-stream', ext: 'bin' }
}

export default function LibraryPage() {
  const account = useCurrentAccount()
  const { data: receipts, isLoading } = useReceipts()
  const { decryptData } = useSeal()
  const [openReceiptId, setOpenReceiptId] = useState(null)
  const [decrypting, setDecrypting] = useState(false)

  async function handleOpen(receipt) {
    console.log('[library] open clicked', {
      receiptId: receipt.id,
      productId: receipt.productId,
      blobId: receipt.blobId,
      title: receipt.productTitle,
    })
    setOpenReceiptId(receipt.id)
    setDecrypting(true)
    try {
      console.log('[library] fetching ciphertext from Walrus…')
      const encrypted = await fetchBlob(receipt.blobId)
      console.log('[library] ciphertext fetched, decrypting…', {
        bytes: encrypted.byteLength,
      })
      const decrypted = await decryptData(encrypted, receipt)
      const { filename: originalName, data: fileBytes } = parsePayload(decrypted)
      const { mime, ext } = sniffFileType(fileBytes)
      console.log('[library] sniffed type', { mime, ext, originalName })
      const blob = new Blob([fileBytes], { type: mime })
      const url = URL.createObjectURL(blob)
      let filename
      if (originalName) {
        filename = originalName.endsWith(`.${ext}`) ? originalName : `${originalName}.${ext}`
      } else {
        // Fallback for products uploaded before filename embedding was added
        const baseName = (receipt.productTitle || 'download').replace(/[^a-z0-9_.-]+/gi, '_')
        filename = baseName.endsWith(`.${ext}`) ? baseName : `${baseName}.${ext}`
      }
      console.log('[library] triggering download', {
        url,
        filename,
        plaintextBytes: fileBytes.length,
      })
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (e) {
      console.error('[library] open failed', e)
    } finally {
      setDecrypting(false)
      setOpenReceiptId(null)
    }
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <Navbar />
        <main className="pt-20 pb-8 container-site text-center py-24">
          <HiOutlineLibrary size={40} className="mx-auto text-on-surface-variant mb-6" />
          <h2 className="text-subheading font-semibold text-primary mb-2">Connect your wallet</h2>
          <p className="text-body-md text-on-surface-variant mb-8">Connect to see your purchased products.</p>
          <Link to="/discover" className="btn-primary">Browse products</Link>
        </main>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <Navbar />
        <main className="pt-20 pb-8 container-site">
          <div className="h-8 skeleton rounded w-48 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="card overflow-hidden">
                <div className="aspect-video skeleton" />
                <div className="p-5 space-y-3">
                  <div className="h-3 skeleton rounded w-1/3" />
                  <div className="h-4 skeleton rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />

      <main className="pt-20 pb-8">
        <div className="container-site">
          <div className="mb-10">
            <h1 className="text-headline-lg font-bold text-primary mb-2">My Library</h1>
            <p className="text-body-md text-on-surface-variant">Products you own, forever.</p>
          </div>

          {!receipts || receipts.length === 0 ? (
            <div className="flex flex-col items-center text-center py-24">
              <div className="w-24 h-24 rounded-2xl bg-marketplace-gray flex items-center justify-center mb-6">
                <HiOutlineLibrary size={40} className="text-on-surface-variant" />
              </div>
              <h2 className="text-subheading font-semibold text-primary mb-2">Nothing here yet</h2>
              <p className="text-body-md text-on-surface-variant max-w-[320px] mb-8">
                Browse the marketplace to find something you'll love.
              </p>
              <Link to="/discover" className="btn-primary">Browse products</Link>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="card px-6 py-4 flex flex-col">
                  <span className="text-xs text-on-surface-variant font-semibold mb-1">Products owned</span>
                  <span className="text-subheading font-bold text-primary">{receipts.length}</span>
                </div>
                <div className="card px-6 py-4 flex flex-col">
                  <span className="text-xs text-on-surface-variant font-semibold mb-1">Total downloads</span>
                  <span className="text-subheading font-bold text-primary">{receipts.reduce((s, r) => s + r.downloadCount, 0)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {receipts.map((receipt) => (
                  <div key={receipt.id} className="card overflow-hidden relative group">
                    <span className="absolute top-3 right-3 z-10 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full">Owned</span>

                    <div className="aspect-video bg-marketplace-gray overflow-hidden flex items-center justify-center">
                      <FiBookOpen size={32} className="text-on-surface-variant" />
                    </div>

                    <div className="p-5">
                      <h3 className="text-sm font-semibold text-primary line-clamp-2 mb-2 leading-snug">
                        {receipt.productTitle}
                      </h3>
                      <p className="text-xs text-on-surface-variant mb-1">
                        Purchased {new Date(receipt.purchasedAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-on-surface-variant mb-4 flex items-center gap-1">
                        <FiDownload size={10} />
                        Downloaded {receipt.downloadCount} {receipt.downloadCount === 1 ? 'time' : 'times'}
                      </p>

                      <button
                        onClick={() => handleOpen(receipt)}
                        disabled={decrypting && openReceiptId === receipt.id}
                        className="flex items-center justify-center gap-2 btn-primary w-full text-sm py-2.5 disabled:opacity-50"
                      >
                        <FiDownload size={14} />
                        {decrypting && openReceiptId === receipt.id ? 'Decrypting...' : 'Download & Decrypt'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border border-subtle-ash rounded-lg p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-marketplace-gray flex items-center justify-center flex-shrink-0">
                    <FiShoppingBag size={18} className="text-on-surface-variant" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary mb-1">Expand your collection</p>
                    <p className="text-sm text-on-surface-variant">Discover more digital products from top creators.</p>
                  </div>
                </div>
                <Link to="/discover" className="btn-secondary whitespace-nowrap text-sm">Browse marketplace</Link>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
