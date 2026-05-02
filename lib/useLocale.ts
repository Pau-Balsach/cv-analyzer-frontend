'use client'

import { useMemo } from 'react'
import es from '@/messages/es.json'
import en from '@/messages/en.json'

type Messages = typeof es

const SUPPORTED = { es, en } as const
type Locale = keyof typeof SUPPORTED

function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en'
  const lang = navigator.language?.slice(0, 2).toLowerCase() as Locale
  return lang in SUPPORTED ? lang : 'en'
}

export function useLocale() {
  const locale = useMemo(() => detectLocale(), [])
  const messages: Messages = SUPPORTED[locale]

  return { locale, messages }
}