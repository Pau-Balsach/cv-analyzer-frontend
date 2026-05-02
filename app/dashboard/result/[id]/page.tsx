'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getAnalysis, jobMatch } from '@/lib/api'

interface Section {
  score: number
  feedback: string
}

interface Analysis {
  analysisId: string
  status: string
  score: number
  strengths: string[]
  weaknesses: string[]
  improvements: string[]
  missingKeywords: string[]
  sections: {
    experience: Section
    education: Section
    skills: Section
    format: Section
  }
}

interface JobMatchResult {
  matchScore: number
  matchedSkills: string[]
  missingSkills: string[]
  recommendations: string[]
}

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
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
          / 100
        </text>
      </svg>
      <p className="text-gray-500 text-sm mt-1">Puntuación general</p>
    </div>
  )
}

function SectionBar({ label, score, feedback }: { label: string, score: number, feedback: string }) {
  const color = score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-400' : 'bg-red-400'
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700 capitalize">{label}</span>
        <span className="text-gray-500">{score}/100</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
        <div className={`${color} h-2 rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
      <p className="text-xs text-gray-400">{feedback}</p>
    </div>
  )
}

function JobMatchPanel({ analysisId, token }: { analysisId: string, token: string }) {
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState<JobMatchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleMatch() {
    if (!jobDescription.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await jobMatch(analysisId, jobDescription, token)
      setResult(data)
    } catch {
      setError('Error analizando la oferta. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = result
    ? result.matchScore >= 70 ? 'text-green-600' : result.matchScore >= 40 ? 'text-yellow-500' : 'text-red-500'
    : ''

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-1">🎯 Job Matching</h2>
      <p className="text-sm text-gray-500 mb-4">Pega la descripción de una oferta y compara con tu CV</p>

      <textarea
        value={jobDescription}
        onChange={e => setJobDescription(e.target.value)}
        placeholder="Pega aquí la descripción del trabajo..."
        rows={5}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
      />

      <button
        onClick={handleMatch}
        disabled={loading || !jobDescription.trim()}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Analizando...' : 'Comparar con oferta'}
      </button>

      {error && (
        <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Compatibilidad</p>
            <p className={`text-5xl font-bold ${scoreColor}`}>{result.matchScore}%</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">✅ Skills que tienes</p>
              <div className="flex flex-wrap gap-2">
                {result.matchedSkills.map((s, i) => (
                  <span key={i} className="bg-green-50 text-green-700 border border-green-200 text-xs px-3 py-1 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">❌ Skills que faltan</p>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map((s, i) => (
                  <span key={i} className="bg-red-50 text-red-600 border border-red-200 text-xs px-3 py-1 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">💡 Recomendaciones</p>
            <ul className="space-y-2">
              {result.recommendations.map((r, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">→</span>{r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ResultPage() {
  const { id } = useParams()
  const router = useRouter()
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setToken(session.access_token)
      const data = await getAnalysis(id as string, session.access_token)
      setAnalysis(data)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Cargando resultados...</p>
      </div>
    )
  }

  if (!analysis) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">CV Analyzer</h1>
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/history')}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            📋 Historial
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Analizar otro CV
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">

        <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center">
          <ScoreGauge score={analysis.score} />
        </div>

        {analysis.sections && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Análisis por sección</h2>
            {Object.entries(analysis.sections).map(([key, val]) => (
              <SectionBar key={key} label={key} score={(val as Section).score} feedback={(val as Section).feedback} />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">✅ Puntos fuertes</h2>
            <ul className="space-y-2">
              {analysis.strengths?.map((s, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>{s}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">⚠️ Puntos débiles</h2>
            <ul className="space-y-2">
              {analysis.weaknesses?.map((w, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>{w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">💡 Mejoras sugeridas</h2>
          <ul className="space-y-2">
            {analysis.improvements?.map((imp, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">→</span>{imp}
              </li>
            ))}
          </ul>
        </div>

        {analysis.missingKeywords?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">🔍 Keywords ATS que faltan</h2>
            <div className="flex flex-wrap gap-2">
              {analysis.missingKeywords.map((kw, i) => (
                <span key={i} className="bg-orange-50 text-orange-600 border border-orange-200 text-xs px-3 py-1 rounded-full">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        <JobMatchPanel analysisId={id as string} token={token} />

      </main>
    </div>
  )
}