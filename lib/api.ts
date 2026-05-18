const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

function getLang(): string {
  if (typeof navigator === 'undefined') return 'en'
  const lang = navigator.language?.slice(0, 2).toLowerCase()
  return ['es', 'en', 'fr', 'de', 'pt'].includes(lang) ? lang : 'en'
}

function sanitizeFileName(name: string): string {
  return name
    .normalize('NFD')                      // descompone tildes: á → a + ́
    .replace(/[\u0300-\u036f]/g, '')       // elimina los diacríticos sueltos
    .replace(/[^\w.\-]/g, '_')             // sustituye cualquier char raro por _
}

export async function uploadCv(file: File, token: string, userId: string) {
  const safeFileName = sanitizeFileName(file.name)
  const safeFile = new File([file], safeFileName, { type: file.type })
  const formData = new FormData()
  formData.append('file', safeFile, safeFileName)

  const response = await fetch(`${API_URL}/api/cv/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-User-Id': userId,
      'X-Language': getLang(),
    },
    body: formData,
  })

  if (!response.ok) throw new Error('Error subiendo el CV')
  return response.json()
}

export async function getAnalysis(analysisId: string, token: string, userId: string) {
  const response = await fetch(`${API_URL}/api/analysis/${analysisId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-User-Id': userId,
    },
  })

  if (!response.ok) throw new Error('Error obteniendo el análisis')
  return response.json()
}

export async function jobMatch(
  analysisId: string,
  jobDescription: string,
  token: string,
  userId: string
) {
  const response = await fetch(`${API_URL}/api/analysis/${analysisId}/job-match`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-User-Id': userId,
      'X-Language': getLang(),
    },
    body: JSON.stringify({ jobDescription }),
  })

  if (!response.ok) throw new Error('Error en job match')
  return response.json()
}

export async function getHistory(token: string, userId: string) {
  const response = await fetch(`${API_URL}/api/history`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-User-Id': userId,
    },
  })

  if (!response.ok) throw new Error('Error obteniendo el historial')
  return response.json()
}

// Historial global de job matches del usuario
export async function getJobMatchHistory(token: string, userId: string) {
  const response = await fetch(`${API_URL}/api/history/job-matches`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-User-Id': userId,
    },
  })

  if (!response.ok) throw new Error('Error obteniendo historial de job matches')
  return response.json()
}

// Job matches de un análisis concreto
export async function getJobMatchesByAnalysis(
  analysisId: string,
  token: string,
  userId: string
) {
  const response = await fetch(
    `${API_URL}/api/history/analyses/${analysisId}/job-matches`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-User-Id': userId,
      },
    }
  )

  if (!response.ok) throw new Error('Error obteniendo job matches del análisis')
  return response.json()
}
