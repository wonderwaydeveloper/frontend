export const getLocalStorageItem = (key: string, defaultValue: string = ''): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key) || defaultValue
  }
  return defaultValue
}

export const getLocalStorageNumber = (key: string, defaultValue: number = 0): number => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(key)
    return stored ? parseInt(stored) : defaultValue
  }
  return defaultValue
}

export const validateField = <T>(schema: any, value: T, fieldName: string, setErrors: (fn: (prev: any) => any) => void): boolean => {
  try {
    schema.parse(value)
    setErrors(prev => ({ ...prev, [fieldName]: [] }))
    return true
  } catch (error: any) {
    if (error?.errors) {
      setErrors(prev => ({ ...prev, [fieldName]: error.errors.map((e: any) => e.message) }))
    }
    return false
  }
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const target = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000)
  
  if (diffInSeconds < 60) return `${diffInSeconds}s`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  return `${Math.floor(diffInSeconds / 86400)}d`
}

export function formatDate(date: string | Date): string {
  const target = new Date(date)
  return target.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}