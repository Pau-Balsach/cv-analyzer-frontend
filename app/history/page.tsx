'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getHistory, getJobMatchHistory } from '@/lib/api'
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
        {/* Análisis skeleton */}
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

        {/* Job matches skeleton */}
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const router = useRouter()
  const { messages } = useLocale()
  const t = messages.history

  const [history, setHistory] = useState<HistoryItem[]>([])
  const [jobMatches, setJobMatches] = useState<JobMatchItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

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
              const scoreColor = item.score >= 70
                ? 'text-green-600' : item.score >= 40
                ? 'text-yellow-500' : 'text-red-500'
              const scoreBg = item.score >= 70
                ? 'bg-green-50 border-green-200' : item.score >= 40
                ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
              const statusLabel = item.status === 'COMPLETED' ? t.completed
                : item.status === 'FAILED' ? t.failed
                : t.processing

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
                        {t.analysis_label}{item.analysisId.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-400">{statusLabel}</p>
                    </div>
                  </div>
                  <span className="text-blue-600 text-sm hover:underline">{t.view_btn}</span>
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
              const scoreColor = match.matchScore >= 70
                ? 'text-green-600' : match.matchScore >= 40
                ? 'text-yellow-500' : 'text-red-500'
              const scoreBg = match.matchScore >= 70
                ? 'bg-green-50 border-green-200' : match.matchScore >= 40
                ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'

              return (
                <div
                  key={match.jobMatchId}
                  className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/history/job-match/${match.jobMatchId}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center ${scoreBg}`}>
                      <span className={`text-lg font-bold ${scoreColor}`}>
                        {match.matchScore}%
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {t.jobmatch_label}{match.jobMatchId.slice(0, 8)}
                      </p>
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