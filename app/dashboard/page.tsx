'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { uploadCv, getAnalysis } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/lib/useLocale'

// ─── Toast ───────────────────────────────────────────────────────────────────
function ErrorToast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-red-600 text-white px-5 py-3 rounded-xl shadow-lg">
      <span className="text-lg">⚠️</span>
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 text-white/70 hover:text-white text-lg leading-none"
        aria-label="Cerrar"
      >
        ×
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { messages } = useLocale()
  const t = messages.dashboard

  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [polling, setPolling] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  function showError(msg: string) {
    setError(msg)
    setTimeout(() => setError(''), 5000)
  }

  async function getToken(): Promise<{ token: string; userId: string }> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('No hay sesión activa')
    return {
      token: session.access_token,
      userId: session.user.id,
    }
  }

  async function handleFile(file: File) {
    if (!file.type.includes('pdf')) {
      showError(t.error_pdf)
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showError(t.error_size)
      return
    }

    setError('')
    setUploading(true)

    try {
      const { token, userId } = await getToken()
      const result = await uploadCv(file, token, userId)
      const { analysisId } = result

      setUploading(false)
      setPolling(true)

      const interval = setInterval(async () => {
        const analysis = await getAnalysis(analysisId, token, userId)

        if (analysis.status === 'COMPLETED') {
          clearInterval(interval)
          router.push(`/dashboard/result/${analysisId}`)
        } else if (analysis.status === 'FAILED') {
          clearInterval(interval)
          setPolling(false)
          showError(t.error_analysis)
        }
      }, 3000)

    } catch {
      setUploading(false)
      setPolling(false)
      showError(t.error_upload)
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const onDragLeave = () => setDragging(false)

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {error && <ErrorToast message={error} onClose={() => setError('')} />}

      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">{t.title}</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          {t.logout}
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">{t.heading}</h2>
          <p className="text-gray-500">{t.subheading}</p>
        </div>

        {!uploading && !polling && (
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              dragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <div className="text-5xl mb-4">📄</div>
            <p className="text-gray-600 font-medium mb-2">
              {t.dropzone_text}{' '}
              <label className="text-blue-600 hover:underline cursor-pointer">
                {t.dropzone_link}
                <input
                  type="file"
                  accept=".pdf"
                  onChange={onFileInput}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-gray-400 text-sm">{t.dropzone_hint}</p>
          </div>
        )}

        {uploading && (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <div className="text-5xl mb-4 animate-bounce">⬆️</div>
            <p className="text-gray-700 font-medium">{t.uploading}</p>
          </div>
        )}

        {polling && (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <div className="text-5xl mb-4 animate-spin">🔄</div>
            <p className="text-gray-700 font-medium mb-1">{t.analyzing}</p>
            <p className="text-gray-400 text-sm">{t.analyzing_hint}</p>
          </div>
        )}
      </main>
    </div>
  )
}