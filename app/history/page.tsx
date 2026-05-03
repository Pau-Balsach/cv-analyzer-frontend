'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getHistory, getJobMatchHistory, getJobMatchesByAnalysis } from '@/lib/api'
import { useLocale } from '@/lib/useLocale'
import type { HistoryItem, JobMatchItem } from '@/lib/types'

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className ?? ''}`} />
  )
}

function HistorySkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-5 w-36" />
      </header>
      <main className="max-w-3xl mx-auto px-4 py-10">
        <Skeleton className="h-8 w-56 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="w-14 h-14 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>

        <Skeleton className="h-8 w-64 mt-12 mb-6" />
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="w-14 h-14 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function scoreColor(score: number) {
  return score >= 70 ? 'text-green-600' : score >= 40 ? 'text-yellow-500' : 'text-red-500'
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const router = useRouter()
  const { messages } = useLocale()
  const t = messages.history

  const [history, setHistory] = useState<HistoryItem[]>([])
  const [jobMatches, setJobMatches] = useState<JobMatchItem[]>([])
  const [loading, setLoading] = useState(true)

  // ── Fase 5: estado del acordeón ──────────────────────────────────────────
  const [expanded, setExpanded] = useState<string | null>(null)
  const [analysisMatches, setAnalysisMatches] = useState<Record<string, JobMatchItem[]>>({})
  const [loadingMatches, setLoadingMatches] = useState<Record<string, boolean>>({})
  const [sessionData, setSessionData] = useState<{ token: string; userId: string } | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      setSessionData({ token: session.access_token, userId: session.user.id })

      const [analysesData, jobMatchesData] = await Promise.all([
        getHistory(session.access_token, session.user.id),
        getJobMatchHistory(session.access_token, session.user.id),
      ])

      setHistory(analysesData)
      setJobMatches(jobMatchesData)
      setLoading(false)
    }
    load()
  }, [])

  // ── Fase 5: toggle del acordeón ──────────────────────────────────────────
  async function toggleExpand(analysisId: string) {
    if (expanded === analysisId) {
      setExpanded(null)
      return
    }

    setExpanded(analysisId)

    if (!analysisMatches[analysisId] && sessionData) {
      setLoadingMatches(prev => ({ ...prev, [analysisId]: true }))
      try {
        const matches = await getJobMatchesByAnalysis(
          analysisId,
          sessionData.token,
          sessionData.userId
        )
        setAnalysisMatches(prev => ({ ...prev, [analysisId]: matches }))
      } catch {
        setAnalysisMatches(prev => ({ ...prev, [analysisId]: [] }))
      } finally {
        setLoadingMatches(prev => ({ ...prev, [analysisId]: false }))
      }
    }
  }

  if (loading) return <HistorySkeleton />

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">{t.title}</h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-blue-600 hover:underline"
        >
          {t.back_btn}
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">

        {/* ── Sección: historial de análisis ── */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 {t.heading}</h2>

        {history.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-400 text-lg mb-2">{t.empty}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {t.empty_btn}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => {
              const color = item.score >= 70
                ? 'text-green-600' : item.score >= 40
                ? 'text-yellow-500' : 'text-red-500'
              const bg = item.score >= 70
                ? 'bg-green-50 border-green-200' : item.score >= 40
                ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
              const statusLabel = item.status === 'COMPLETED' ? t.completed
                : item.status === 'FAILED' ? t.failed
                : t.processing

              const isExpanded = expanded === item.analysisId
              const matches = analysisMatches[item.analysisId] ?? []
              const isLoadingMatches = loadingMatches[item.analysisId] ?? false

              return (
                <div
                  key={item.analysisId}
                  className="bg-white rounded-xl shadow-sm overflow-hidden transition-shadow hover:shadow-md"
                >
                  {/* ── Cabecera de la tarjeta ── */}
                  <div className="p-5 flex items-center justify-between">
                    <div
                      className="flex items-center gap-4 cursor-pointer flex-1"
                      onClick={() => router.push(`/dashboard/result/${item.analysisId}`)}
                    >
                      <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center ${bg}`}>
                        <span className={`text-lg font-bold ${color}`}>
                          {item.status === 'COMPLETED' ? item.score : '...'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {t.analysis_label}{item.analysisId.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-400">{statusLabel}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className="text-blue-600 text-sm hover:underline cursor-pointer"
                        onClick={() => router.push(`/dashboard/result/${item.analysisId}`)}
                      >
                        {t.view_btn}
                      </span>

                      {/* Botón acordeón — Fase 5 */}
                      <button
                        onClick={() => toggleExpand(item.analysisId)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                        title={isExpanded ? 'Ocultar matches' : 'Ver job matches'}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* ── Acordeón de job matches — Fase 5 ── */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-5 pb-4 pt-3 bg-gray-50">
                      {isLoadingMatches ? (
                        <div className="space-y-2">
                          {[1, 2].map(i => (
                            <div key={i} className="flex items-center justify-between bg-white rounded-lg px-4 py-3">
                              <Skeleton className="h-3 w-32" />
                              <Skeleton className="h-3 w-10" />
                            </div>
                          ))}
                        </div>
                      ) : matches.length === 0 ? (
                        <p className="text-sm text-gray-400 py-2 text-center">
                          Sin comparaciones aún
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {matches.map(match => (
                            <div
                              key={match.jobMatchId}
                              className="flex items-center justify-between bg-white rounded-lg px-4 py-3
                                         cursor-pointer hover:bg-blue-50 transition-colors border border-transparent
                                         hover:border-blue-100"
                              onClick={() => router.push(`/history/job-match/${match.jobMatchId}`)}
                            >
                              <span className="text-sm text-gray-600">
                                Match #{match.jobMatchId.slice(0, 8)}
                              </span>
                              <span className={`text-sm font-bold ${scoreColor(match.matchScore)}`}>
                                {match.matchScore}%
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── Sección: historial de job matches ── */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 mt-12">🎯 {t.jobmatch_heading}</h2>

        {jobMatches.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-400 text-lg">{t.jobmatch_empty}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobMatches.map((match) => {
              const color = match.matchScore >= 70
                ? 'text-green-600' : match.matchScore >= 40
                ? 'text-yellow-500' : 'text-red-500'
              const bg = match.matchScore >= 70
                ? 'bg-green-50 border-green-200' : match.matchScore >= 40
                ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'

              // Cruzar con el historial de análisis para mostrar a qué CV pertenece
              const linkedAnalysis = history.find(h => h.analysisId === match.analysisId)

              return (
                <div
                  key={match.jobMatchId}
                  className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/history/job-match/${match.jobMatchId}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center ${bg}`}>
                      <span className={`text-lg font-bold ${color}`}>
                        {match.matchScore}%
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {t.jobmatch_label}{match.jobMatchId.slice(0, 8)}
                      </p>
                      {/* Referencia al análisis/CV ── AÑADIDO */}
                      {linkedAnalysis && (
                        <p className="text-xs text-gray-400">
                          📄 {t.analysis_label}{linkedAnalysis.analysisId.slice(0, 8)}
                          {' · '}
                          <span
                            className="text-blue-400 hover:underline"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/dashboard/result/${linkedAnalysis.analysisId}`)
                            }}
                          >
                            ver CV
                          </span>
                        </p>
                      )}
                      <p className="text-sm text-gray-400">
                        {match.matchedSkills.length} {t.matched_skills_count}
                      </p>
                    </div>
                  </div>
                  <span className="text-blue-600 text-sm hover:underline">{t.view_btn}</span>
                </div>
              )
            })}
          </div>
        )}

      </main>
    </div>
  )
}