import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiGrid,
  FiPackage,
  FiDollarSign,
  FiBarChart2,
  FiSettings,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiExternalLink,
  FiTrendingUp,
  FiUsers,
  FiX,
  FiUploadCloud,
  FiArrowLeft,
} from 'react-icons/fi'
import { HiOutlineLightningBolt } from 'react-icons/hi'
import Footer from '../components/Footer'
import { PRODUCTS } from '../data/products'

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: FiGrid },
  { id: 'products', label: 'Products', icon: FiPackage },
  { id: 'sales', label: 'Sales', icon: FiDollarSign },
  { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
  { id: 'settings', label: 'Settings', icon: FiSettings },
]

const RECENT_SALES = [
  { product: 'Cyberpunk UI Kit', buyer: '0x9a...3b2c', amount: '45', date: 'May 24, 2026' },
  { product: 'Abstract 3D Pack', buyer: '0xfe...1a90', amount: '120', date: 'May 23, 2026' },
  { product: 'Neo-Brutal Font', buyer: '0x44...8c21', amount: '15', date: 'May 22, 2026' },
  { product: 'Figma UI Kit 2025', buyer: '0x77...c3f1', amount: '49', date: 'May 21, 2026' },
]

// Upload modal steps
const UPLOAD_STEPS = ['Details', 'Upload', 'Publish']

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadStep, setUploadStep] = useState(0)
  const [form, setForm] = useState({ title: '', description: '', price: '', type: 'PDF', commission: '' })
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  function handleUploadNext() {
    if (uploadStep < 2) setUploadStep(s => s + 1)
    else {
      setShowUploadModal(false)
      setUploadStep(0)
    }
  }

  function simulateUpload() {
    setUploading(true)
    let p = 0
    const interval = setInterval(() => {
      p += 10
      setUploadProgress(p)
      if (p >= 100) {
        clearInterval(interval)
        setUploading(false)
      }
    }, 200)
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-subtle-ash h-16 flex items-center justify-between px-4 md:px-10">
        <div className="flex items-center gap-8">
          <Link to="/discover" className="text-[20px] font-bold text-primary tracking-tight">
            Delar
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {['Discover', 'How it works', 'Pricing'].map(l => (
              <Link key={l} to={l === 'Discover' ? '/discover' : '#'}
                className="text-sm text-on-surface-variant px-4 py-2 rounded-full hover:bg-marketplace-gray transition-colors">
                {l}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/library" className="text-sm text-on-surface-variant px-4 py-2 rounded-full hover:bg-marketplace-gray transition-colors">
            My Library
          </Link>
          <button className="btn-primary text-sm px-6 py-2.5">Start selling</button>
        </div>
      </nav>

      <div className="flex pt-16 min-h-screen">
        {/* ── Sidebar ── */}
        <aside className="hidden md:flex w-[240px] fixed left-0 h-[calc(100vh-64px)] bg-white border-r border-subtle-ash flex-col justify-between p-6">
          <div>
            {/* User info */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-creator-pink flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                CK
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">Welcome, Creator</p>
                <p className="text-[10px] font-mono text-on-surface-variant">0x71...f4e2</p>
              </div>
            </div>

            {/* Nav items */}
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-left transition-all ${
                    activeTab === id
                      ? 'bg-primary text-white'
                      : 'text-on-surface-variant hover:bg-marketplace-gray'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Storage usage */}
          <div>
            <Link to="/discover" className="text-xs text-primary font-semibold hover:underline block mb-4">
              ← View my store
            </Link>
            <div className="bg-marketplace-gray rounded-lg p-4">
              <p className="text-xs text-on-surface-variant mb-2">Storage Usage</p>
              <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden mb-2">
                <div className="w-[65%] h-full bg-primary rounded-full" />
              </div>
              <p className="text-xs font-bold text-primary">1.2 GB / 2.0 GB</p>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 md:ml-[240px] p-6 md:p-10 max-w-[960px]">

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <section>
              <div className="mb-8">
                <h1 className="text-headline-lg font-bold text-primary mb-1">Dashboard Overview</h1>
                <p className="text-on-surface-variant text-body-md">Real-time performance of your digital assets.</p>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {[
                  { label: 'Total Revenue', value: 'USDC 1,234', trend: '+12% this month', icon: FiDollarSign },
                  { label: 'Products', value: '12', trend: '2 pending approval', icon: FiPackage },
                  { label: 'Total Sales', value: '89', trend: '45 unique buyers', icon: FiUsers },
                  { label: 'This Month', value: 'USDC 340', trend: 'Target: USDC 500', icon: FiTrendingUp },
                ].map(({ label, value, trend, icon: Icon }) => (
                  <div key={label} className="card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-xs text-on-surface-variant font-semibold">{label}</p>
                      <Icon size={16} className="text-on-surface-variant" />
                    </div>
                    <p className="text-subheading font-bold text-primary mb-2">{value}</p>
                    <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
                      <FiTrendingUp size={11} className="text-primary" />
                      {trend}
                    </p>
                  </div>
                ))}
              </div>

              {/* Recent sales table */}
              <div className="card overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-subtle-ash">
                  <h3 className="text-subheading font-semibold text-primary">Recent Sales</h3>
                  <button className="text-xs text-primary font-semibold hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-marketplace-gray">
                      <tr>
                        {['Product', 'Buyer', 'Amount', 'Date', 'Receipt'].map(h => (
                          <th key={h} className="px-6 py-3 text-left text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {RECENT_SALES.map((row, i) => (
                        <tr key={i} className="border-t border-subtle-ash hover:bg-marketplace-gray/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-primary">{row.product}</td>
                          <td className="px-6 py-4 text-xs font-mono text-on-surface-variant">{row.buyer}</td>
                          <td className="px-6 py-4 text-sm font-bold">{row.amount} USDC</td>
                          <td className="px-6 py-4 text-xs text-on-surface-variant">{row.date}</td>
                          <td className="px-6 py-4">
                            <a href="#" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                              View <FiExternalLink size={11} />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* ── PRODUCTS TAB ── */}
          {activeTab === 'products' && (
            <section>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h1 className="text-headline-lg font-bold text-primary mb-1">My Products</h1>
                  <p className="text-on-surface-variant text-body-md">Manage and track your digital inventory.</p>
                </div>
                <button
                  onClick={() => { setShowUploadModal(true); setUploadStep(0) }}
                  className="flex items-center gap-2 btn-primary text-sm"
                >
                  <FiPlus size={16} />
                  Upload new product
                </button>
              </div>

              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-marketplace-gray">
                      <tr>
                        {['', 'Product', 'Price', 'Sales', 'Status', 'Actions'].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {PRODUCTS.slice(0, 4).map((p) => (
                        <ProductRow key={p.id} product={p} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* ── ANALYTICS TAB ── */}
          {activeTab === 'analytics' && (
            <section>
              <h1 className="text-headline-lg font-bold text-primary mb-2">Analytics</h1>
              <p className="text-on-surface-variant mb-8">Track your revenue and sales trends.</p>

              {/* Date range */}
              <div className="flex gap-2 mb-8">
                {['7 days', '30 days', '90 days', 'All time'].map((d, i) => (
                  <button key={d}
                    className={`text-xs font-semibold px-4 py-2 rounded-full transition-all ${
                      i === 1 ? 'bg-primary text-white' : 'bg-marketplace-gray text-on-surface-variant hover:border hover:border-subtle-ash'
                    }`}>
                    {d}
                  </button>
                ))}
              </div>

              {/* Chart placeholder */}
              <div className="card p-6 mb-6">
                <p className="text-sm font-semibold text-primary mb-4">Revenue (30 days)</p>
                <div className="h-48 bg-marketplace-gray rounded-lg flex items-end px-4 pb-4 gap-2 overflow-hidden">
                  {[40,65,45,80,55,90,70,85,60,75,95,110,80,65,100,88,72,95,105,88,112,98,78,115,95,88,102,120,98,110].map((h, i) => (
                    <div key={i} className="flex-1 bg-primary rounded-t transition-all" style={{ height: `${(h/120)*100}%` }} />
                  ))}
                </div>
              </div>

              {/* Top products bar chart */}
              <div className="card p-6">
                <p className="text-sm font-semibold text-primary mb-4">Sales by Product</p>
                <div className="flex flex-col gap-3">
                  {PRODUCTS.slice(0, 4).map((p) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <span className="text-xs text-on-surface-variant w-36 truncate">{p.title.slice(0,20)}…</span>
                      <div className="flex-1 h-2 bg-marketplace-gray rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(p.sales / 412) * 100}%` }} />
                      </div>
                      <span className="text-xs font-bold text-primary w-8 text-right">{p.sales}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── SALES TAB ── */}
          {activeTab === 'sales' && (
            <section>
              <h1 className="text-headline-lg font-bold text-primary mb-2">Sales History</h1>
              <p className="text-on-surface-variant mb-8">All transactions in USDC.</p>
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-marketplace-gray">
                      <tr>
                        {['Product', 'Buyer', 'Amount', 'Date', 'Receipt'].map(h => (
                          <th key={h} className="px-6 py-3 text-left text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {RECENT_SALES.concat(RECENT_SALES).map((row, i) => (
                        <tr key={i} className="border-t border-subtle-ash hover:bg-marketplace-gray/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-primary">{row.product}</td>
                          <td className="px-6 py-4 text-xs font-mono text-on-surface-variant">{row.buyer}</td>
                          <td className="px-6 py-4 text-sm font-bold">{row.amount} USDC</td>
                          <td className="px-6 py-4 text-xs text-on-surface-variant">{row.date}</td>
                          <td className="px-6 py-4"><a href="#" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">View <FiExternalLink size={11} /></a></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* ── SETTINGS TAB ── */}
          {activeTab === 'settings' && (
            <section>
              <h1 className="text-headline-lg font-bold text-primary mb-2">Settings</h1>
              <p className="text-on-surface-variant mb-8">Manage your creator profile and payouts.</p>

              {/* Profile */}
              <div className="card p-6 mb-6">
                <h2 className="text-sm font-semibold text-primary mb-5 pb-4 border-b border-subtle-ash">Profile</h2>
                <div className="flex items-start gap-6 mb-6">
                  <div className="w-16 h-16 rounded-full bg-creator-pink border-2 border-subtle-ash flex items-center justify-center text-xl font-bold text-primary flex-shrink-0">
                    CK
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-on-surface-variant mb-1">Avatar</p>
                    <button className="text-xs text-primary font-semibold px-4 py-2 rounded-full border border-subtle-ash hover:bg-marketplace-gray transition-all">
                      Upload photo
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[['Display name', 'Creator King'], ['Store slug', 'creatorking'], ['Website', 'https://']].map(([l, p]) => (
                    <div key={l}>
                      <label className="text-xs text-on-surface-variant font-semibold block mb-1.5">{l}</label>
                      <input className="input-base" placeholder={p} />
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="text-xs text-on-surface-variant font-semibold block mb-1.5">Bio</label>
                    <textarea className="input-base resize-none" rows={3} placeholder="Tell buyers about yourself..." />
                  </div>
                </div>
                <button className="btn-primary mt-5 text-sm px-6 py-2.5">Save profile</button>
              </div>

              {/* Payouts */}
              <div className="card p-6 mb-6">
                <h2 className="text-sm font-semibold text-primary mb-5 pb-4 border-b border-subtle-ash flex items-center gap-2">
                  Payouts
                  <span className="bg-creator-pink text-primary text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <HiOutlineLightningBolt size={10} /> Linq
                  </span>
                </h2>
                <p className="text-body-md text-on-surface-variant mb-4">
                  Withdraw your USDC earnings directly to your Nigerian bank account via Linq.
                  Instant conversion at market rates.
                </p>
                <button className="btn-primary text-sm px-6 py-2.5">Connect bank account</button>
              </div>

              {/* Webhooks */}
              <div className="card p-6 opacity-60">
                <h2 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                  Webhooks
                  <span className="bg-marketplace-gray text-on-surface-variant text-[10px] font-semibold px-2 py-0.5 rounded-full">Coming soon</span>
                </h2>
                <p className="text-sm text-on-surface-variant">
                  Integrate Delar with your existing systems. Webhooks coming in Q3 2026.
                </p>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* ── UPLOAD MODAL ── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowUploadModal(false)}
          />

          <div className="relative bg-white rounded-2xl w-full max-w-[600px] p-8 overflow-y-auto max-h-[90vh]">
            {/* Close */}
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-marketplace-gray transition-colors"
            >
              <FiX size={18} />
            </button>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8">
              {UPLOAD_STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <button
                    onClick={() => setUploadStep(i)}
                    className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all ${
                      uploadStep === i
                        ? 'bg-primary text-white'
                        : uploadStep > i
                        ? 'bg-marketplace-gray text-primary'
                        : 'bg-marketplace-gray text-on-surface-variant'
                    }`}
                  >
                    {step}
                  </button>
                  {i < UPLOAD_STEPS.length - 1 && (
                    <div className={`h-px w-8 ${uploadStep > i ? 'bg-primary' : 'bg-subtle-ash'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Details */}
            {uploadStep === 0 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-subheading font-semibold text-primary mb-2">Product Details</h2>
                <div>
                  <label className="text-xs text-on-surface-variant font-semibold block mb-1.5">Product title *</label>
                  <input
                    className="input-base"
                    placeholder="e.g. Ultimate Notion Dashboard Pack"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant font-semibold block mb-1.5">Description</label>
                  <textarea
                    className="input-base resize-none"
                    rows={4}
                    placeholder="Describe your product..."
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-on-surface-variant font-semibold block mb-1.5">Price (USDC) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-semibold text-sm">$</span>
                      <input
                        className="input-base pl-7"
                        placeholder="0.00"
                        value={form.price}
                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-on-surface-variant font-semibold block mb-1.5">Product type</label>
                    <select
                      className="input-base"
                      value={form.type}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    >
                      {['PDF', 'Course', 'Template', 'Software', 'Other'].map(t => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant font-semibold block mb-1.5">Affiliate commission % (optional)</label>
                  <input
                    className="input-base"
                    placeholder="e.g. 20"
                    value={form.commission}
                    onChange={e => setForm(f => ({ ...f, commission: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Upload */}
            {uploadStep === 1 && (
              <div>
                <h2 className="text-subheading font-semibold text-primary mb-6">Upload Files</h2>

                {/* Dropzone */}
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => { e.preventDefault(); setDragging(false); simulateUpload() }}
                  onClick={simulateUpload}
                  className={`border-2 border-dashed rounded-2xl py-16 text-center cursor-pointer transition-all mb-4 ${
                    dragging ? 'border-primary bg-marketplace-gray' : 'border-subtle-ash hover:border-on-surface-variant'
                  }`}
                >
                  <FiUploadCloud size={32} className="mx-auto text-on-surface-variant mb-3" />
                  <p className="text-subheading font-semibold text-primary mb-1">
                    {uploading ? 'Uploading...' : 'Drag your file here'}
                  </p>
                  <p className="text-sm text-on-surface-variant">or click to browse</p>
                  <p className="text-xs text-on-surface-variant mt-2">PDF, EPUB, ZIP, MP4, MP3 — max 500 MB</p>
                </div>

                {/* Progress bar */}
                {(uploading || uploadProgress > 0) && (
                  <div className="mb-4">
                    <div className="w-full h-1 bg-marketplace-gray rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">{uploadProgress}% complete</p>
                  </div>
                )}

                {/* Upload steps checklist */}
                {uploadProgress > 0 && (
                  <div className="flex flex-col gap-2 bg-marketplace-gray rounded-lg p-4">
                    {[
                      { label: 'Encrypting with Seal...', done: uploadProgress >= 33 },
                      { label: 'Uploading to Walrus...', done: uploadProgress >= 66 },
                      { label: 'Storing on Sui...', done: uploadProgress >= 100 },
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

                {/* Thumbnail upload */}
                <div className="mt-4">
                  <p className="text-xs text-on-surface-variant font-semibold mb-2">Thumbnail (optional)</p>
                  <div className="border border-dashed border-subtle-ash rounded-lg py-6 text-center text-xs text-on-surface-variant cursor-pointer hover:border-on-surface-variant transition-all">
                    + Upload thumbnail image
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Publish */}
            {uploadStep === 2 && (
              <div>
                <h2 className="text-subheading font-semibold text-primary mb-6">Preview & Publish</h2>

                {/* Preview card */}
                <div className="card p-5 mb-6">
                  <div className="aspect-video bg-marketplace-gray rounded-md mb-4 flex items-center justify-center">
                    <FiPackage size={32} className="text-on-surface-variant" />
                  </div>
                  <span className="badge text-[10px] mb-2">{form.type || 'PDF'}</span>
                  <h3 className="text-sm font-semibold text-primary mb-1">
                    {form.title || 'Untitled Product'}
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-3">by Creator King</p>
                  <p className="text-sm font-bold text-primary">USDC {form.price || '0.00'}</p>
                </div>

                {/* Publish toggle */}
                <div className="flex items-center gap-4 mb-6">
                  {['Publish immediately', 'Save as draft'].map((opt, i) => (
                    <button
                      key={opt}
                      className={`text-sm font-semibold px-5 py-2 rounded-full transition-all ${
                        i === 0
                          ? 'bg-primary text-white'
                          : 'bg-marketplace-gray text-on-surface-variant'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer buttons */}
            <div className="flex gap-3 mt-8">
              {uploadStep > 0 && (
                <button
                  onClick={() => setUploadStep(s => s - 1)}
                  className="flex items-center gap-2 btn-secondary text-sm px-6 py-2.5"
                >
                  <FiArrowLeft size={14} /> Back
                </button>
              )}
              <button
                onClick={handleUploadNext}
                className="btn-primary text-sm px-8 py-2.5 flex-1"
              >
                {uploadStep < 2 ? 'Continue →' : 'Publish Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

// Product row sub-component
function ProductRow({ product }) {
  const [active, setActive] = useState(true)

  return (
    <tr className="border-t border-subtle-ash hover:bg-marketplace-gray/50 transition-colors">
      <td className="px-5 py-4">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-marketplace-gray flex-shrink-0">
          {product.thumbnail ? (
            <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiPackage size={16} className="text-on-surface-variant" />
            </div>
          )}
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-primary line-clamp-1">{product.title}</p>
        <span className="badge text-[10px] mt-1">{product.type}</span>
      </td>
      <td className="px-5 py-4 text-sm font-bold text-primary">{product.price} USDC</td>
      <td className="px-5 py-4 text-sm text-on-surface-variant">{product.sales}</td>
      <td className="px-5 py-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => setActive(a => !a)}
            className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-primary' : 'bg-subtle-ash'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${active ? 'left-5' : 'left-0.5'}`} />
          </div>
          <span className={`text-xs font-medium ${active ? 'text-primary' : 'text-on-surface-variant'}`}>
            {active ? 'Active' : 'Draft'}
          </span>
        </label>
      </td>
      <td className="px-5 py-4">
        <div className="flex gap-1">
          <button className="p-2 rounded-lg hover:bg-marketplace-gray transition-colors text-on-surface-variant">
            <FiEdit2 size={15} />
          </button>
          <button className="p-2 rounded-lg hover:bg-error-container hover:text-error transition-colors text-on-surface-variant">
            <FiTrash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  )
}
