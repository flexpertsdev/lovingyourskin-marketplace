import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { MultiLangString } from '../../types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper to get localized string from multi-language object or return string as-is
export function getLocalizedString(value: string | MultiLangString | undefined, lang: 'en' | 'ko' | 'zh' = 'en'): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value[lang] || value.en || ''
}