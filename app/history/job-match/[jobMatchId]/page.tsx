'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getJobMatchHistory } from '@/lib/api'
import { useLocale } from '@/lib/useLocale'
import type { JobMatchItem } from '@/lib/types'

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className ?? ''}`} />
  )
}

function JobMatchDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-5 w-36" />
      </header>
      <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center gap-4">
          <Skeleton className="w-36 h-12 rounded-lg" />
          <Skeleton className="w-24 h-16 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 space-y-3">
              <Skeleton className="h-5 w-36" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map(j => <Skeleton key={j} className="h-7 w-20 rounded-full" />)}
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
          <Skeleton className="h-5 w-44" />
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
      </main>
    </div>
  )
}

// ─── Score gauge (reutiliza el mismo estilo que result/page.tsx) ───────────────
function ScoreGauge({ score }: { score: number }) {
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (score / 100) * circumference

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r="54" fill="none" stroke="#e5e7eb" strokeWidth="12" />
      <circle
        cx="70" cy="70" r="54"
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <text x="70" y="70" textAnchor="middle" dominantBaseline="middle"
        fontSize="28" fontWeight="bold" fill={color}>
        {score}
      </text>
      <text x="70" y="92" textAnchor="middle" fontSize="11" fill="#9ca3af">
        %
      </text>
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function JobMatchDetailPage() {
  const { jobMatchId } = useParams()
  const router = useRouter()
  const { messages } = useLocale()
  const t = messages.jobmatch_detail

  const [match, setMatch] = useState<JobMatchItem | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const all: JobMatchItem[] = await getJobMatchHistory(
        session.access_token,
        session.user.id
      )
      const found = all.find((m) => m.jobMatchId === jobMatchId) ?? null
      setMatch(found)
      setLoading(false)
    }
    load()
  }, [jobMatchId])

  if (loading) return <JobMatchDetailSkeleton />

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400 text-lg">{t.not_found}</p>
        <button
          onClick={() => router.push('/history')}
          className="text-sm text-blue-600 hover:underline"
        >
          {t.back_btn}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">{t.title}</h1>
        <button
          onClick={() => router.push('/history')}
          className="text-sm text-blue-600 hover:underline"
        >
          {t.back_btn}
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">

        {/* Score */}
        <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center gap-2">
          <p className="text-sm text-gray-500">{t.compatibility}</p>
          <ScoreGauge score={match.matchScore} />
        </div>

        {/* Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-700 mb-3">✅ {t.matched_skills}</h2>
            <div className="flex flex-wrap gap-2">
              {match.matchedSkills.map((s, i) => (
                <span
                  key={i}
                  className="bg-green-50 text-green-700 border border-green-200 text-xs px-3 py-1 rounded-full"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-700 mb-3">❌ {t.missing_skills}</h2>
            <div className="flex flex-wrap gap-2">
              {match.missingSkills.map((s, i) => (
                <span
                  key={i}
                  className="bg-red-50 text-red-600 border border-red-200 text-xs px-3 py-1 rounded-full"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-700 mb-3">💡 {t.recommendations}</h2>
          <ul className="space-y-2">
            {match.recommendations.map((r, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">→</span>{r}
              </li>
            ))}
          </ul>
        </div>

      </main>
    </div>
  )
}