import { useEffect, useRef, useState } from 'react'
import { LogOut, Plus, Pencil, Trash2, Eye, EyeOff, X, Upload, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// ─── Image processing ─────────────────────────────────────────────────────────

function processImage(file) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const MAX_PX = 1200
      let { width, height } = img

      if (width > MAX_PX || height > MAX_PX) {
        if (width >= height) {
          height = Math.round((height * MAX_PX) / width)
          width = MAX_PX
        } else {
          width = Math.round((width * MAX_PX) / height)
          height = MAX_PX
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)

      canvas.toBlob(
        (blob) => resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' })),
        'image/webp',
        0.85
      )
    }

    img.src = url
  })
}

// ─── Login ────────────────────────────────────────────────────────────────────

function LoginView() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError('Email ou password incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-5">
      <div className="w-full max-w-sm bg-[#141414] border border-[#2D2D2D] rounded-2xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-white text-2xl font-bold">Motoval Admin</h1>
          <p className="text-[#9CA3AF] text-sm mt-1">Acesso restrito</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#9CA3AF] text-sm mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#1A1A1A] border border-[#2D2D2D] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#FBE013] transition-colors"
              placeholder="motovalsetubal@gmail.com"
            />
          </div>
          <div>
            <label className="block text-[#9CA3AF] text-sm mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#1A1A1A] border border-[#2D2D2D] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#FBE013] transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FBE013] hover:bg-[#E5C800] text-black font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2 min-h-[44px]"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Product Form ─────────────────────────────────────────────────────────────

const EMPTY_FORM = { title: '', price: '', description: '', condition: 'Segunda Mão', tire_size: '', brand: '' }

function ProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState(product
    ? { title: product.title, price: product.price, description: product.description || '', condition: product.condition || 'Segunda Mão', tire_size: product.tire_size || '', brand: product.brand || '' }
    : { ...EMPTY_FORM }
  )
  const [existingImages, setExistingImages] = useState(product?.images || [])
  const [newFiles, setNewFiles] = useState([])
  const [newPreviews, setNewPreviews] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  function handleField(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleFileSelect(e) {
    const selected = Array.from(e.target.files)
    if (selected.length === 0) return
    const processed = await Promise.all(selected.map(processImage))
    setNewFiles((prev) => [...prev, ...processed])
    const previews = processed.map((f) => URL.createObjectURL(f))
    setNewPreviews((prev) => [...prev, ...previews])
  }

  function removeExisting(index) {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  function removeNew(index) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
    setNewPreviews((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.price.trim()) {
      setError('Título e preço são obrigatórios.')
      return
    }
    setSaving(true)
    setError('')

    try {
      const uploadedUrls = []
      for (const file of newFiles) {
        const ext = file.name.split('.').pop()
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(path, file, { upsert: false })
        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(path)
        uploadedUrls.push(publicUrl)
      }

      const payload = {
        ...form,
        images: [...existingImages, ...uploadedUrls],
      }

      if (product) {
        const { error: dbError } = await supabase
          .from('products')
          .update(payload)
          .eq('id', product.id)
        if (dbError) throw dbError
      } else {
        const { error: dbError } = await supabase
          .from('products')
          .insert([{ ...payload, is_active: true }])
        if (dbError) throw dbError
      }

      onSave()
    } catch (err) {
      setError('Erro ao guardar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "w-full bg-[#1A1A1A] border border-[#2D2D2D] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#FBE013] transition-colors placeholder:text-[#4A4A4A]"

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-16 px-4 pb-8 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#141414] border border-[#2D2D2D] rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#2D2D2D]">
          <h2 className="text-white font-semibold text-lg">
            {product ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button onClick={onCancel} className="text-[#9CA3AF] hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[#9CA3AF] text-sm mb-1.5">Título *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleField('title', e.target.value)}
              required
              className={inputClass}
              placeholder="Ex: Pneus 205/55 R16 — par"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#9CA3AF] text-sm mb-1.5">Preço *</label>
              <input
                type="text"
                value={form.price}
                onChange={(e) => handleField('price', e.target.value)}
                required
                className={inputClass}
                placeholder="Ex: 80€"
              />
            </div>
            <div>
              <label className="block text-[#9CA3AF] text-sm mb-1.5">Condição</label>
              <select
                value={form.condition}
                onChange={(e) => handleField('condition', e.target.value)}
                className={inputClass}
              >
                <option value="Segunda Mão">Usados</option>
                <option value="Novo">Novo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#9CA3AF] text-sm mb-1.5">Medida</label>
              <input
                type="text"
                value={form.tire_size}
                onChange={(e) => handleField('tire_size', e.target.value)}
                className={inputClass}
                placeholder="Ex: 205/55 R16"
              />
            </div>
            <div>
              <label className="block text-[#9CA3AF] text-sm mb-1.5">Marca</label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => handleField('brand', e.target.value)}
                className={inputClass}
                placeholder="Ex: Michelin"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#9CA3AF] text-sm mb-1.5">Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => handleField('description', e.target.value)}
              rows={3}
              className={inputClass + ' resize-none'}
              placeholder="Estado, detalhes relevantes..."
            />
          </div>

          {/* Imagens */}
          <div>
            <label className="block text-[#9CA3AF] text-sm mb-2">Fotografias</label>

            {(existingImages.length > 0 || newPreviews.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-3">
                {existingImages.map((url, i) => (
                  <div key={`existing-${i}`} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#2D2D2D]">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExisting(i)}
                      className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-red-600 text-white rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {newPreviews.map((url, i) => (
                  <div key={`new-${i}`} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#FBE013]/40">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNew(i)}
                      className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-red-600 text-white rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 border border-dashed border-[#2D2D2D] hover:border-[#FBE013]/50 text-[#9CA3AF] hover:text-white text-sm rounded-lg px-4 py-3 w-full justify-center transition-colors"
            >
              <Upload className="w-4 h-4" />
              Adicionar fotografias
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-[#2D2D2D] hover:border-[#9CA3AF] text-[#9CA3AF] font-medium py-2.5 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#FBE013] hover:bg-[#E5C800] text-black font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard() {
  const { session, logout } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  async function fetchProducts() {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [])

  async function toggleActive(product) {
    await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id)
    fetchProducts()
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Eliminar "${product.title}"? Esta ação não pode ser desfeita.`)) return
    setDeletingId(product.id)

    // Remove images from storage
    if (product.images?.length > 0) {
      const paths = product.images.map((url) => {
        const parts = url.split('/product-images/')
        return parts[1] || null
      }).filter(Boolean)
      if (paths.length > 0) {
        await supabase.storage.from('product-images').remove(paths)
      }
    }

    await supabase.from('products').delete().eq('id', product.id)
    setDeletingId(null)
    fetchProducts()
  }

  function openAdd() {
    setEditingProduct(null)
    setShowForm(true)
  }

  function openEdit(product) {
    setEditingProduct(product)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingProduct(null)
  }

  async function handleSave() {
    closeForm()
    await fetchProducts()
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="bg-[#141414] border-b border-[#2D2D2D] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <div>
            <span className="text-white font-semibold">Painel Admin</span>
            <span className="text-[#4A4A4A] text-sm ml-2">— Motoval Setúbal</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#9CA3AF] text-xs hidden sm:block">{session?.user?.email}</span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-[#9CA3AF] hover:text-white text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-8">
        {/* Actions bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-semibold text-lg">Ofertas</h2>
            <p className="text-[#9CA3AF] text-sm">{products.length} produto(s) no total</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#FBE013] hover:bg-[#E5C800] text-black font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </button>
        </div>

        {/* Product list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#FBE013] animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-[#2D2D2D] rounded-2xl">
            <p className="text-[#9CA3AF] mb-4">Ainda não há produtos. Adiciona o primeiro!</p>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 bg-[#FBE013] hover:bg-[#E5C800] text-black font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Adicionar Produto
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className={`bg-[#141414] border rounded-xl p-4 flex gap-4 items-center transition-colors ${
                  product.is_active ? 'border-[#2D2D2D]' : 'border-[#1A1A1A] opacity-60'
                }`}
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#1A1A1A] flex-shrink-0">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#4A4A4A] text-xs">Sem img.</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm leading-snug truncate">{product.title}</p>
                  <p className="text-[#FBE013] text-sm font-semibold">{product.price}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      product.is_active
                        ? 'bg-green-500/15 text-green-400'
                        : 'bg-[#2D2D2D] text-[#9CA3AF]'
                    }`}>
                      {product.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                    {product.tire_size && (
                      <span className="text-xs text-[#9CA3AF]">{product.tire_size}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(product)}
                    title={product.is_active ? 'Desativar' : 'Ativar'}
                    className="p-2 text-[#9CA3AF] hover:text-white rounded-lg hover:bg-[#1A1A1A] transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                  >
                    {product.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEdit(product)}
                    title="Editar"
                    className="p-2 text-[#9CA3AF] hover:text-white rounded-lg hover:bg-[#1A1A1A] transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteProduct(product)}
                    disabled={deletingId === product.id}
                    title="Eliminar"
                    className="p-2 text-[#9CA3AF] hover:text-red-400 rounded-lg hover:bg-[#1A1A1A] transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center disabled:opacity-40"
                  >
                    {deletingId === product.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleSave}
          onCancel={closeForm}
        />
      )}
    </div>
  )
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FBE013] animate-spin" />
      </div>
    )
  }

  return session ? <Dashboard /> : <LoginView />
}
