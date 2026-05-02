'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getHistory } from '@/lib/api'

interface HistoryItem {
  analysisId: string
  cvId: string
  status: string
  score: number
  createdAt?: string
}

export default function HistoryPage() {
  const router = useRouter()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const data = await getHistory(session.access_token, session.user.id)
      setHistory(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Cargando historial...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">CV Analyzer</h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Volver al dashboard
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 Historial de análisis</h2>

        {history.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-400 text-lg mb-2">No tienes análisis todavía</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Analizar mi primer CV
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => {
              const scoreColor = item.score >= 70
                ? 'text-green-600'
                : item.score >= 40
                ? 'text-yellow-500'
                : 'text-red-500'

              const scoreBg = item.score >= 70
                ? 'bg-green-50 border-green-200'
                : item.score >= 40
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-red-50 border-red-200'

              return (
                <div
                  key={item.analysisId}
                  className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/dashboard/result/${item.analysisId}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center ${scoreBg}`}>
                      <span className={`text-lg font-bold ${scoreColor}`}>
                        {item.status === 'COMPLETED' ? item.score : '...'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        Análisis #{item.analysisId.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-400">
                        {item.status === 'COMPLETED' ? 'Completado' : item.status === 'FAILED' ? 'Fallido' : 'Procesando...'}
                      </p>
                    </div>
                  </div>

                  <span className="text-blue-600 text-sm hover:underline">
                    Ver resultado →
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}