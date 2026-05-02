const API_URL = '/backend'

export async function uploadCv(file: File, token: string, userId: string) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_URL}/api/cv/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-User-Id': userId,
    },
    body: formData,
  })

  if (!response.ok) throw new Error('Error subiendo el CV')
  return response.json()
}

export async function getAnalysis(analysisId: string, token: string) {
  const response = await fetch(`${API_URL}/api/analysis/${analysisId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) throw new Error('Error obteniendo el análisis')
  return response.json()
}