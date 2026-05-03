// ─── Análisis ─────────────────────────────────────────────────────────────────

export interface Section {
  score: number
  feedback: string
}

export interface HistoryItem {
  analysisId: string
  cvId: string
  status: string
  score: number
  createdAt?: string
}

export interface Analysis {
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

// ─── Job Match ────────────────────────────────────────────────────────────────

export interface JobMatchItem {
  jobMatchId: string
  analysisId: string   
  matchScore: number
  matchedSkills: string[]
  missingSkills: string[]
  recommendations: string[]
}