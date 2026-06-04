import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiGrid, FiPackage, FiDollarSign, FiTrendingUp, FiUsers,
  FiPlus, FiLink, FiTrash2,
  FiX, FiUploadCloud, FiArrowLeft,
} from 'react-icons/fi'
import Footer from '../components/Footer'
import { useCurrentAccount } from '@mysten/dapp-kit-react'
import { useProducts } from '../hooks/useProducts'
import { useReceipts } from '../hooks/useReceipts'
import { usePublish } from '../hooks/usePublish'
import { useSalesHistory } from '../hooks/useSalesHistory'
import { useAffiliates } from '../hooks/useAffiliates'
import { fetchCoins } from '../services/tatum'
import { useQuery } from '@tanstack/react-query'

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: FiGrid },
  { id: 'products', label: 'Products', icon: FiPackage },
  { id: 'sales', label: 'Sales', icon: FiDollarSign },
]

const UPLOAD_STEPS = ['Details', 'Upload', 'Publish']

export default function DashboardPage() {
  const account = useCurrentAccount()
  const { products: allProducts } = useProducts()
  const { data: receipts } = useReceipts()
  const { publish, isPending: publishing, error: publishError, step } = usePublish()
  const { data: salesHistory, isLoading: salesLoading } = useSalesHistory()
  const { addAffiliate, removeAffiliate, isPending: affiliatePending, error: affiliateError, setError: setAffiliateError } = useAffiliates()
  const [activeTab, setActiveTab] = useState('overview')
  const [managingProductId, setManagingProductId] = useState(null)
  const [newAffiliateAddr, setNewAffiliateAddr] = useState('')
  const [copiedLink, setCopiedLink] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadStep, setUploadStep] = useState(0)
  const [form, setForm] = useState({ title: '', description: '', price: '', type: '0', commission: '' })
  const [file, setFile] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)

  const { data: usdcBalance } = useQuery({
    queryKey: ['usdcBalance', account?.address],
    queryFn: async () => {
      const res = await fetchCoins(account.address, import.meta.env.VITE_USDC_TYPE)
      return res.data?.reduce((sum, c) => sum + Number(c.balance), 0) || 0
    },
    enabled: !!account,
    refetchInterval: 30_000,
  })

  const myProducts = (allProducts || []).filter((p) => p.creator === account?.address)
  const managingProduct = myProducts.find((p) => p.id === managingProductId) || null
  const totalSales = myProducts.reduce((s, p) => s + p.totalSales, 0)
  const totalRevenue = myProducts.reduce((s, p) => s + p.priceUsdc * p.totalSales, 0)

  async function handlePublish() {
    if (!file || !form.title || !form.price) return
    const priceUsdc = Math.round(parseFloat(form.price) * 1_000_000)
    const affiliateBps = Math.round(parseFloat(form.commission || '0') * 100)
    await publish({
      file,
      thumbnail,
      title: form.title,
      description: form.description,
      priceUsdc,
      productType: parseInt(form.type),
      affiliateBps,
    })
    setShowUploadModal(false)
    setUploadStep(0)
    setForm({ title: '', description: '', price: '', type: '0', commission: '' })
    setFile(null)
    setThumbnail(null)
  }

  function handleUploadNext() {
    if (uploadStep < 2) setUploadStep(s => s + 1)
    else handlePublish()
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-background font-sans flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-subheading font-semibold text-primary mb-4">Connect your wallet to continue</h2>
          <Link to="/discover" className="btn-primary">Go to Discover</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-subtle-ash h-16 flex items-center justify-between px-4 md:px-10">
        <div className="flex items-center gap-8">
          <Link to="/discover" className="text-[20px] font-bold text-primary tracking-tight">Delar</Link>
          <div className="hidden md:flex items-center gap-1">
            <Link to="/discover" className="text-sm text-on-surface-variant px-4 py-2 rounded-full hover:bg-marketplace-gray transition-colors">Discover</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/library" className="text-sm text-on-surface-variant px-4 py-2 rounded-full hover:bg-marketplace-gray transition-colors">My Library</Link>
          <span className="text-xs font-mono text-on-surface-variant">{account.address.slice(0, 6)}...{account.address.slice(-4)}</span>
        </div>
      </nav>

      <div className="flex pt-16 min-h-screen">
        <aside className="hidden md:flex w-[240px] fixed left-0 h-[calc(100vh-64px)] bg-white border-r border-subtle-ash flex-col justify-between p-6">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-creator-pink flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                {account.address.slice(2, 4).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-primary">Dashboard</p>
                <p className="text-[10px] font-mono text-on-surface-variant truncate">{account.address.slice(0, 6)}...{account.address.slice(-4)}</p>
              </div>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-left transition-all ${
                    activeTab === id ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-marketplace-gray'
                  }`}>
                  <Icon size={18} /> {label}
                </button>
              ))}
            </nav>
          </div>
          <div>
            <Link to="/discover" className="text-xs text-primary font-semibold hover:underline block mb-4">← View my store</Link>
            <div className="bg-marketplace-gray rounded-lg p-4">
              <p className="text-xs text-on-surface-variant mb-2">USDC Balance</p>
              <p className="text-sm font-bold text-primary">{(usdcBalance / 1_000_000).toFixed(2)} USDC</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 md:ml-[240px] p-6 md:p-10 max-w-[960px]">
          {activeTab === 'overview' && (
            <section>
              <div className="mb-8">
                <h1 className="text-headline-lg font-bold text-primary mb-1">Dashboard Overview</h1>
                <p className="text-on-surface-variant text-body-md">Real-time performance of your digital assets.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {[
                  { label: 'Total Revenue', value: `USDC ${(totalRevenue / 1_000_000).toFixed(2)}`, trend: `${myProducts.length} products`, icon: FiDollarSign },
                  { label: 'Products', value: `${myProducts.length}`, trend: `${myProducts.filter(p => p.isActive).length} active`, icon: FiPackage },
                  { label: 'Total Sales', value: `${totalSales}`, trend: `${receipts?.length || 0} unique buyers`, icon: FiUsers },
                  { label: 'USDC Balance', value: `${((usdcBalance || 0) / 1_000_000).toFixed(2)}`, trend: 'Available to withdraw', icon: FiTrendingUp },
                ].map(({ label, value, trend, icon: Icon }) => (
                  <div key={label} className="card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-xs text-on-surface-variant font-semibold">{label}</p>
                      <Icon size={16} className="text-on-surface-variant" />
                    </div>
                    <p className="text-subheading font-bold text-primary mb-2">{value}</p>
                    <p className="text-[11px] text-on-surface-variant">{trend}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'products' && (
            <section>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h1 className="text-headline-lg font-bold text-primary mb-1">My Products</h1>
                  <p className="text-on-surface-variant text-body-md">Manage and track your digital inventory.</p>
                </div>
                <button onClick={() => { setShowUploadModal(true); setUploadStep(0) }}
                  className="flex items-center gap-2 btn-primary text-sm">
                  <FiPlus size={16} /> Upload new product
                </button>
              </div>
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-marketplace-gray">
                      <tr>
                        {['Product', 'Price', 'Sales', 'Status', 'Affiliates'].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {myProducts.length === 0 ? (
                        <tr><td colSpan={5} className="px-5 py-12 text-center text-on-surface-variant text-sm">No products yet. Upload your first one!</td></tr>
                      ) : (
                        myProducts.map((p) => (
                          <tr key={p.id} className="border-t border-subtle-ash hover:bg-marketplace-gray/50 transition-colors">
                            <td className="px-5 py-4">
                              <p className="text-sm font-semibold text-primary line-clamp-1">{p.title}</p>
                            </td>
                            <td className="px-5 py-4 text-sm font-bold text-primary">{p.price.toFixed(2)} USDC</td>
                            <td className="px-5 py-4 text-sm text-on-surface-variant">{p.totalSales}</td>
                            <td className="px-5 py-4">
                              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${p.isActive ? 'bg-primary/10 text-primary' : 'bg-marketplace-gray text-on-surface-variant'}`}>
                                {p.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <button
                                onClick={() => { setManagingProductId(p.id); setNewAffiliateAddr(''); setAffiliateError(null) }}
                                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                              >
                                <FiUsers size={12} /> Manage ({p.affiliates?.length || 0})
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'sales' && (
            <section>
              <h1 className="text-headline-lg font-bold text-primary mb-2">Sales History</h1>
              <p className="text-on-surface-variant mb-8">All transactions in USDC.</p>
              <div className="card overflow-hidden">
                {salesLoading ? (
                  <div className="p-12 text-center text-on-surface-variant text-sm">Loading sales...</div>
                ) : !salesHistory || salesHistory.length === 0 ? (
                  <div className="p-12 text-center text-on-surface-variant text-sm">
                    No sales yet. Share your products to start earning!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-marketplace-gray">
                        <tr>
                          {['Buyer', 'Amount', 'Affiliate', 'Date'].map((h) => (
                            <th key={h} className="px-5 py-3 text-left text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {salesHistory.map((sale) => (
                          <tr key={sale.txDigest} className="border-t border-subtle-ash hover:bg-marketplace-gray/50 transition-colors">
                            <td className="px-5 py-4 font-mono text-xs text-primary">
                              {sale.buyer.slice(0, 6)}...{sale.buyer.slice(-4)}
                            </td>
                            <td className="px-5 py-4 text-sm font-bold text-primary">
                              USDC {sale.amountPaidUsdc.toFixed(2)}
                            </td>
                            <td className="px-5 py-4 text-xs text-on-surface-variant">
                              {sale.affiliate
                                ? `${sale.affiliate.slice(0, 6)}...${sale.affiliate.slice(-4)}`
                                : '—'}
                            </td>
                            <td className="px-5 py-4 text-xs text-on-surface-variant">
                              {new Date(sale.timestamp).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          )}

        </main>
      </div>

      {managingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setManagingProductId(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-[540px] p-8 max-h-[85vh] overflow-y-auto">
            <button onClick={() => setManagingProductId(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-marketplace-gray transition-colors">
              <FiX size={18} />
            </button>

            <h2 className="text-subheading font-semibold text-primary mb-1">Manage Affiliates</h2>
            <p className="text-xs text-on-surface-variant mb-6">
              {managingProduct.title}
              {managingProduct.affiliateBps > 0
                ? ` · ${managingProduct.affiliateBps / 100}% commission per sale`
                : ' · No commission set — update product to add one'}
            </p>

            <div className="flex gap-2 mb-6">
              <input
                className="input-base flex-1 text-sm"
                placeholder="Affiliate wallet address (0x...)"
                value={newAffiliateAddr}
                onChange={(e) => setNewAffiliateAddr(e.target.value)}
              />
              <button
                disabled={affiliatePending || !newAffiliateAddr.startsWith('0x')}
                onClick={async () => {
                  await addAffiliate(managingProduct.id, newAffiliateAddr)
                  setNewAffiliateAddr('')
                }}
                className="btn-primary text-sm px-5 disabled:opacity-50 whitespace-nowrap"
              >
                {affiliatePending ? 'Adding...' : 'Add'}
              </button>
            </div>

            {affiliateError && <p className="text-xs text-error mb-4">{affiliateError}</p>}

            {managingProduct.affiliates?.length === 0 ? (
              <div className="text-center py-10 text-on-surface-variant text-sm">
                No affiliates yet. Add a wallet address above to get started.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {managingProduct.affiliates.map((addr) => {
                  const link = `${window.location.origin}/product/${managingProduct.id}?ref=${addr}`
                  return (
                    <div key={addr} className="flex items-center gap-3 bg-marketplace-gray rounded-lg px-4 py-3">
                      <span className="font-mono text-xs text-primary flex-1 truncate">
                        {addr.slice(0, 10)}...{addr.slice(-6)}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(link)
                          setCopiedLink(addr)
                          setTimeout(() => setCopiedLink(null), 2000)
                        }}
                        className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline whitespace-nowrap"
                      >
                        <FiLink size={11} />
                        {copiedLink === addr ? 'Copied!' : 'Copy link'}
                      </button>
                      <button
                        disabled={affiliatePending}
                        onClick={() => removeAffiliate(managingProduct.id, addr)}
                        className="flex items-center gap-1 text-xs text-error font-semibold hover:underline disabled:opacity-50"
                      >
                        <FiTrash2 size={11} /> Remove
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowUploadModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-[600px] p-8 overflow-y-auto max-h-[90vh]">
            <button onClick={() => setShowUploadModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-marketplace-gray transition-colors">
              <FiX size={18} />
            </button>

            <div className="flex items-center gap-2 mb-8">
              {UPLOAD_STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all ${
                    uploadStep === i ? 'bg-primary text-white' : uploadStep > i ? 'bg-marketplace-gray text-primary' : 'bg-marketplace-gray text-on-surface-variant'
                  }`}>{step}</span>
                  {i < UPLOAD_STEPS.length - 1 && <div className={`h-px w-8 ${uploadStep > i ? 'bg-primary' : 'bg-subtle-ash'}`} />}
                </div>
              ))}
            </div>

            {uploadStep === 0 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-subheading font-semibold text-primary mb-2">Product Details</h2>
                <div>
                  <label className="text-xs text-on-surface-variant font-semibold block mb-1.5">Product title *</label>
                  <input className="input-base" placeholder="e.g. Ultimate Notion Dashboard Pack"
                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant font-semibold block mb-1.5">Description</label>
                  <textarea className="input-base resize-none" rows={4} placeholder="Describe your product..."
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-on-surface-variant font-semibold block mb-1.5">Price (USDC) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-semibold text-sm">$</span>
                      <input className="input-base pl-7" placeholder="0.00"
                        value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-on-surface-variant font-semibold block mb-1.5">Product type</label>
                    <select className="input-base" value={form.type}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                      {['Ebook', 'Course', 'Template', 'Coaching', 'Software', 'Other'].map((t, i) => (
                        <option key={t} value={i}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant font-semibold block mb-1.5">Affiliate commission % (optional)</label>
                  <input className="input-base" placeholder="e.g. 10"
                    value={form.commission} onChange={e => setForm(f => ({ ...f, commission: e.target.value }))} />
                </div>
              </div>
            )}

            {uploadStep === 1 && (
              <div>
                <h2 className="text-subheading font-semibold text-primary mb-6">Upload Files</h2>
                <div className="border-2 border-dashed border-subtle-ash rounded-2xl py-16 text-center cursor-pointer hover:border-on-surface-variant transition-all mb-4"
                  onClick={() => document.getElementById('file-input')?.click()}>
                  <FiUploadCloud size={32} className="mx-auto text-on-surface-variant mb-3" />
                  <p className="text-subheading font-semibold text-primary mb-1">{file ? file.name : 'Drag your file here'}</p>
                  <p className="text-sm text-on-surface-variant">{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : 'or click to browse'}</p>
                  <input id="file-input" type="file" className="hidden" onChange={e => setFile(e.target.files?.[0])} />
                </div>
                <div className="border border-dashed border-subtle-ash rounded-lg py-6 text-center text-xs text-on-surface-variant cursor-pointer hover:border-on-surface-variant transition-all"
                  onClick={() => document.getElementById('thumb-input')?.click()}>
                  {thumbnail ? thumbnail.name : '+ Upload thumbnail image'}
                  <input id="thumb-input" type="file" className="hidden" accept="image/*" onChange={e => setThumbnail(e.target.files?.[0])} />
                </div>
              </div>
            )}

            {uploadStep === 2 && (
              <div>
                <h2 className="text-subheading font-semibold text-primary mb-6">Preview & Publish</h2>
                <div className="card p-5 mb-6">
                  <div className="aspect-video bg-marketplace-gray rounded-md mb-4 flex items-center justify-center">
                    <FiPackage size={32} className="text-on-surface-variant" />
                  </div>
                  <h3 className="text-sm font-semibold text-primary mb-1">{form.title || 'Untitled Product'}</h3>
                  <p className="text-xs text-on-surface-variant mb-3">by {account.address.slice(0, 6)}...{account.address.slice(-4)}</p>
                  <p className="text-sm font-bold text-primary">USDC {form.price || '0.00'}</p>
                </div>

                {publishError && <p className="text-xs text-error mb-4">{publishError}</p>}

                {publishing && (
                  <div className="flex flex-col gap-2 bg-marketplace-gray rounded-lg p-4 mb-4">
                    {[
                      { label: 'Encrypting content...', done: step === 'upload' || step === 'publish' },
                      { label: 'Uploading to Walrus...', done: step === 'publish' },
                      { label: 'Writing to Sui...', done: step === null },
                    ].map(({ label, done }) => (
                      <p key={label} className={`text-xs font-medium flex items-center gap-2 ${done ? 'text-primary' : 'text-on-surface-variant'}`}>
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${done ? 'bg-primary text-white' : 'bg-subtle-ash'}`}>
                          {done ? '✓' : ''}
                        </span>
                        {label}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-8">
              {uploadStep > 0 && (
                <button onClick={() => setUploadStep(s => s - 1)}
                  className="flex items-center gap-2 btn-secondary text-sm px-6 py-2.5">
                  <FiArrowLeft size={14} /> Back
                </button>
              )}
              <button onClick={handleUploadNext} disabled={publishing}
                className="btn-primary text-sm px-8 py-2.5 flex-1 disabled:opacity-50">
                {publishing ? 'Publishing...' : uploadStep < 2 ? 'Continue →' : 'Publish Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
